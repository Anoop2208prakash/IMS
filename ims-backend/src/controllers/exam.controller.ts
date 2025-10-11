import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// GET all exams
export const getAllExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({ orderBy: { date: 'desc' } });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams.' });
  }
};

// ADD a new exam
export const addExam = async (req: Request, res: Response) => {
  const { name, date, totalMarks } = req.body;
  if (!name || !date || totalMarks == null) {
    return res.status(400).json({ message: 'Name, date, and total marks are required.' });
  }
  try {
    const newExam = await prisma.exam.create({
      data: {
        name,
        date: new Date(date),
        totalMarks: parseInt(totalMarks),
      },
    });
    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create exam.' });
  }
};

// UPDATE an exam
export const updateExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, date, totalMarks } = req.body;
  if (!name || !date || totalMarks == null) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        name,
        date: new Date(date),
        totalMarks: parseInt(totalMarks),
      },
    });
    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update exam.' });
  }
};

// DELETE an exam
export const deleteExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const resultsCount = await prisma.examResult.count({ where: { examId: id } });
    if (resultsCount > 0) {
      return res.status(400).json({ message: `Cannot delete exam, ${resultsCount} result(s) have been entered.` });
    }
    await prisma.exam.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exam.' });
  }
};

// GET Admit Card Data
export const getAdmitCard = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const studentId = req.user?.id;

  if (!studentId) return res.status(401).json({ message: 'Not authenticated.'});

  try {
    const [studentData, examData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { name: true, student: true, enrollments: { include: { course: true } } }
      }),
      prisma.exam.findUnique({ where: { id: examId } })
    ]);

    if (!studentData || !examData) {
      return res.status(404).json({ message: 'Student or Exam data not found.' });
    }

    res.status(200).json({ student: studentData, exam: examData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate admit card data.' });
  }
};