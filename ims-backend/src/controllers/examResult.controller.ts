import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

interface ResultRecord { studentId: string; marksObtained: number; }

// For a Teacher to submit marks
export const submitMarks = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user?.id;
  // 1. Changed courseId to subjectId
  const { subjectId, examId, results } = req.body as {
    subjectId: string; examId: string; results: ResultRecord[];
  };

  if (!teacherId || !subjectId || !examId || !results) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const upsertOperations = results.map(result => 
      prisma.examResult.upsert({
        // 2. Updated the unique where clause
        where: { studentId_subjectId_examId: { studentId: result.studentId, subjectId, examId } },
        update: { marksObtained: result.marksObtained },
        create: {
          marksObtained: result.marksObtained,
          studentId: result.studentId,
          subjectId: subjectId, // 3. Use subjectId here
          examId: examId,
          enteredById: teacherId,
        },
      })
    );

    await prisma.$transaction(upsertOperations);
    res.status(201).json({ message: 'Marks submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit marks.' });
  }
};

// For a Student to get their own exam results
export const getMyResults = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const results = await prisma.examResult.findMany({
      where: { studentId },
      include: {
        subject: { select: { title: true } }, // 4. Changed course to subject
        exam: { select: { name: true, date: true, totalMarks: true } },
      },
      orderBy: { exam: { date: 'desc' } },
    });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results.' });
  }
};