import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET all programs
export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({ orderBy: { title: 'asc' } });
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch programs.' });
  }
};

// ADD a new program
export const addProgram = async (req: Request, res: Response) => {
  const { title, description, durationYears } = req.body;
  if (!title || !durationYears) {
    return res.status(400).json({ message: 'Title and duration are required.' });
  }
  try {
    const newProgram = await prisma.program.create({
      data: { title, description, durationYears: parseInt(durationYears) },
    });
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create program.' });
  }
};

// UPDATE a program
export const updateProgram = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, durationYears } = req.body;
  if (!title || !durationYears) {
    return res.status(400).json({ message: 'Title and duration are required.' });
  }
  try {
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: { title, description, durationYears: parseInt(durationYears) },
    });
    res.status(200).json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update program.' });
  }
};

// DELETE a program
export const deleteProgram = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Safety check: ensure no semesters are linked
    const semesterCount = await prisma.semester.count({ where: { programId: id } });
    if (semesterCount > 0) {
      return res.status(400).json({ message: `Cannot delete: ${semesterCount} semester(s) are linked to this program.` });
    }
    await prisma.program.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete program.' });
  }
};