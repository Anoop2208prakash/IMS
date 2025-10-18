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
  // 1. Changed courseId to subjectId
  const { subjectId, date, records } = req.body as {
    subjectId: string;
    date: string;
    records: AttendanceRecord[];
  };

  if (!teacherId || !subjectId || !date || !records) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const upsertOperations = records.map(record => 
      prisma.attendance.upsert({
        // 2. Updated the unique where clause
        where: { date_studentId_subjectId: { date: new Date(date), studentId: record.studentId, subjectId } },
        update: { status: record.status },
        create: {
          date: new Date(date),
          status: record.status,
          studentId: record.studentId,
          subjectId: subjectId, // 3. Use subjectId here
          markedById: teacherId,
        },
      })
    );
    
    await prisma.$transaction(upsertOperations);
    res.status(201).json({ message: 'Attendance submitted successfully.' });
  } catch (error) {
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
        subject: { select: { title: true } }, // 4. Changed course to subject
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};