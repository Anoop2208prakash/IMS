import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// GET a student's own enrolled subjects
export const getMyEnrolledSubjects = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        subject: { // Include the subject details
          include: {
            semester: { // And the semester
              include: {
                program: { select: { title: true } } // And the program title
              }
            }
          }
        }
      }
    });

    // Remap to a cleaner array of subjects that includes program/semester names
    const subjects = enrollments.map(e => ({
      ...e.subject,
      programTitle: e.subject.semester.program.title,
      semesterName: e.subject.semester.name
    }));
    
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrolled subjects.' });
  }
};