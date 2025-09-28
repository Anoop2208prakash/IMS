import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/enrollments/my-grades - Get grades for the current user
export const getMyGrades = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/enrollments/grade - Assign a grade to a student's enrollment
export const assignGrade = async (req: Request, res: Response) => {
  const { enrollmentId, grade } = req.body;
  try {
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { grade },
    });
    res.json(updatedEnrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};