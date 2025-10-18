import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET all semesters (optionally filter by program)
export const getAllSemesters = async (req: Request, res: Response) => {
  const { programId } = req.query;
  try {
    const semesters = await prisma.semester.findMany({
      where: {
        programId: programId ? String(programId) : undefined,
      },
      include: { program: { select: { title: true } } },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch semesters.' });
  }
};

// ADD a new semester
export const addSemester = async (req: Request, res: Response) => {
  const { name, programId } = req.body;
  if (!name || !programId) {
    return res.status(400).json({ message: 'Name and Program ID are required.' });
  }
  try {
    const newSemester = await prisma.semester.create({
      data: { name, programId },
    });
    res.status(201).json(newSemester);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create semester. It may already exist for this program.' });
  }
};

// UPDATE a semester
export const updateSemester = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, programId } = req.body;
  if (!name || !programId) {
    return res.status(400).json({ message: 'Name and Program ID are required.' });
  }
  try {
    const updatedSemester = await prisma.semester.update({
      where: { id },
      data: { name, programId },
    });
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update semester.' });
  }
};

// DELETE a semester
export const deleteSemester = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subjectCount = await prisma.subject.count({ where: { semesterId: id } });
    if (subjectCount > 0) {
      return res.status(400).json({ message: `Cannot delete: ${subjectCount} subject(s) are linked to this semester.` });
    }
    await prisma.semester.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete semester.' });
  }
};