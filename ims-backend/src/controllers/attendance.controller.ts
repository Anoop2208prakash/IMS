import { Response } from 'express';
import { PrismaClient, AttendanceStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

// For a Teacher to submit attendance records
export const submitAttendance = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user?.id;
  const { subjectId, date, records } = req.body as {
    subjectId: string;
    date: string;
    records: AttendanceRecord[];
  };

  if (!teacherId || !subjectId || !date || !records) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // --- THIS IS THE FIX ---
    // 1. Verify the teacher is assigned to this subject
    const assignment = await prisma.subjectAssignment.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId: teacherId,
          subjectId: subjectId,
        },
      },
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this subject.' });
    }
    // --- End of fix ---

    // 2. Prepare all upsert operations
    const upsertOperations = records.map(record => 
      prisma.attendance.upsert({
        where: { date_studentId_subjectId: { date: new Date(date), studentId: record.studentId, subjectId } },
        update: { status: record.status },
        create: {
          date: new Date(date),
          status: record.status,
          studentId: record.studentId,
          subjectId: subjectId,
          markedById: teacherId,
        },
      })
    );
    
    // 3. Run all operations in a single transaction
    await prisma.$transaction(upsertOperations);
    res.status(201).json({ message: 'Attendance submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit attendance.' });
  }
};

// For a Student to get their own attendance records
export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        subject: { select: { title: true } }, // Correctly fetches subject
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};