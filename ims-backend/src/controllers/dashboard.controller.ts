import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// Helper function for Admin/Super Admin data
const getAdminDashboardData = async () => {
  const [studentCount, teacherCount, courseCount, booksOnLoan] = await prisma.$transaction([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.course.count(),
    prisma.loan.count({ where: { returnDate: null } })
  ]);
  return { studentCount, teacherCount, courseCount, booksOnLoan };
};

// Helper function for Student data
const getStudentDashboardData = async (studentId: string) => {
  const [enrolledCourses, booksOnLoan, attendanceRecords] = await prisma.$transaction([
    prisma.enrollment.count({ where: { userId: studentId } }),
    prisma.loan.count({ where: { userId: studentId, returnDate: null } }),
    prisma.attendance.findMany({ where: { studentId } })
  ]);

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100;

  return { enrolledCourses, booksOnLoan, attendancePercentage };
};

// Main controller function
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    let data;
    switch (user.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'ADMIN_ADMISSION':
      case 'ADMIN_FINANCE':
      case 'ADMIN_LIBRARY':
        data = await getAdminDashboardData();
        break;
      case 'STUDENT':
        data = await getStudentDashboardData(user.id);
        break;
      case 'TEACHER':
        // For now, teachers can see the general admin dashboard
        data = await getAdminDashboardData();
        break;
      default:
        data = { message: 'Welcome!' };
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};