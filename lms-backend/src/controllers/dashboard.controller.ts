import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalBooks = await prisma.book.aggregate({
      _sum: {
        totalQuantity: true,
      },
    });

    const activeLoans = await prisma.loan.count({
      where: {
        returnDate: null,
      },
    });
    
    const overdueLoans = await prisma.loan.count({
        where: {
            returnDate: null,
            dueDate: {
                lt: new Date(), // Less than today's date
            }
        }
    });

    res.json({
      totalBooks: totalBooks._sum.totalQuantity || 0,
      activeLoans,
      overdueLoans,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// GET /api/dashboard/admin-stats - Get stats for the admin dashboard
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCourses = await prisma.course.count();
    const pendingFees = await prisma.fee.aggregate({
      where: { isPaid: false },
      _sum: {
        amount: true,
      },
    });

    res.json({
      totalUsers,
      totalCourses,
      pendingFees: pendingFees._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};