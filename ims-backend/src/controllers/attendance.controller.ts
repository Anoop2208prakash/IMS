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
  const { courseId, date, records } = req.body as {
    courseId: string;
    date: string;
    records: AttendanceRecord[];
  };

  if (!teacherId || !courseId || !date || !records) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const upsertOperations = records.map(record => 
      prisma.attendance.upsert({
        where: { date_studentId_courseId: { date: new Date(date), studentId: record.studentId, courseId } },
        update: { status: record.status },
        create: {
          date: new Date(date),
          status: record.status,
          studentId: record.studentId,
          courseId: courseId,
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
        course: { select: { title: true } }, // Include the course title
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};