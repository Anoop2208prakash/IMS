import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// Helper function for fetching recent announcements
const getRecentAnnouncements = () => {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { author: { select: { name: true } } },
  });
};

// Helper function for Admin/Super Admin data
const getAdminDashboardData = async () => {
  const [studentCount, teacherCount, courseCount, booksOnLoan, announcements] = await prisma.$transaction([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.course.count(),
    prisma.loan.count({ where: { returnDate: null } }),
    getRecentAnnouncements(),
  ]);
  return { studentCount, teacherCount, courseCount, booksOnLoan, announcements };
};

// Helper function for Student data (Updated)
const getStudentDashboardData = async (studentId: string) => {
  const soonDate = new Date();
  soonDate.setDate(soonDate.getDate() + 7);

  const [
    enrolledCourses, 
    booksOnLoan, 
    attendanceRecords,
    recentOrders,
    upcomingDueDates,
    announcements
  ] = await prisma.$transaction([
    prisma.enrollment.count({ where: { userId: studentId } }),
    prisma.loan.count({ where: { userId: studentId, returnDate: null } }),
    prisma.attendance.findMany({ where: { studentId } }),
    prisma.order.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.loan.findMany({
      where: { 
        userId: studentId, 
        returnDate: null,
        dueDate: { lte: soonDate }
      },
      include: { book: { select: { title: true } } },
    }),
    getRecentAnnouncements(),
  ]);

  // --- New Detailed Attendance Calculation ---
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'ABSENT').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'LATE').length;
  // Consider 'LATE' as present for the overall percentage
  const attendancePercentage = totalDays > 0 ? (((presentDays + lateDays) / totalDays) * 100).toFixed(1) : '100';

  return { 
    enrolledCourses, 
    booksOnLoan, 
    attendancePercentage, 
    recentOrders, 
    upcomingDueDates,
    announcements,
    presentDays, // <-- Add this
    absentDays,  // <-- Add this
    lateDays     // <-- Add this
  };
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