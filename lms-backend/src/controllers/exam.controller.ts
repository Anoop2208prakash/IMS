import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/exams - Get all exams
export const getAllExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({ include: { course: true } });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/exams/:examId/register - Register current user for an exam
export const registerForExam = async (req: Request, res: Response) => {
  const { examId } = req.params;
  // @ts-ignore
  const userId = req.user.userId;
  try {
    const registration = await prisma.examRegistration.create({
      data: { examId, userId },
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(409).json({ message: 'Already registered or server error' });
  }
};

// GET /api/exams/my-registrations - Get registrations for the current user
export const getMyRegistrations = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  try {
    const registrations = await prisma.examRegistration.findMany({
      where: { userId },
      include: {
        exam: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        exam: {
          date: 'asc',
        },
      },
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};