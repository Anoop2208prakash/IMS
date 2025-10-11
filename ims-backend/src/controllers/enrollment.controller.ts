// src/controllers/enrollment.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getMyCourses = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: true, // Include the full details of the course
      },
    });

    // We only need the course data from the enrollments
    const courses = enrollments.map(enrollment => enrollment.course);
    res.status(200).json(courses);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
};