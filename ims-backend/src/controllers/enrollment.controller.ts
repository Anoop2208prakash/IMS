import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * GET: /api/enrollments/my-subjects
 * Fetches all subjects for the currently logged-in student.
 */
export const getMyEnrolledSubjects = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
      },
      include: {
        subject: {
          include: {
            semester: {
              include: {
                program: true, // Include the program details
              },
            },
          },
        },
      },
      orderBy: {
        subject: {
          title: 'asc', // Order by subject title A-Z
        },
      },
    });
    
    // We only want to return the subject data
    const subjects = enrollments.map(e => e.subject);

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects.' });
  }
};