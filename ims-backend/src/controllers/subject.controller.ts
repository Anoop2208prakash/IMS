import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// GET all subjects (optionally filter by program or semester)
export const getAllSubjects = async (req: Request, res: Response) => {
  const { semesterId, programId } = req.query;
  let whereClause = {}; // Default: no filter, get all

  if (semesterId) {
    // If a specific semester is requested
    whereClause = { semesterId: String(semesterId) };
  } else if (programId) {
    // If a program is requested, find all subjects in all semesters of that program
    whereClause = { semester: { programId: String(programId) } };
  }

  try {
    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: { semester: { include: { program: true } } },
    });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects.' });
  }
};

// ADD a new subject
export const addSubject = async (req: Request, res: Response) => {
  const { title, subjectCode, credits, semesterId } = req.body;
  if (!title || !subjectCode || !credits || !semesterId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const newSubject = await prisma.subject.create({
      data: { title, subjectCode, credits: parseInt(credits), semesterId },
    });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject.' });
  }
};

// UPDATE a subject
export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, subjectCode, credits, semesterId } = req.body;
  if (!title || !subjectCode || !credits || !semesterId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: { title, subjectCode, credits: parseInt(credits), semesterId },
    });
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject.' });
  }
};

// DELETE a subject
export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const enrollments = await prisma.enrollment.count({ where: { subjectId: id } });
    if (enrollments > 0) {
      return res.status(400).json({ message: `Cannot delete: ${enrollments} student(s) are enrolled.` });
    }
    // You can add more safety checks here for attendance, results, etc.
    await prisma.subject.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject.' });
  }
};

// ASSIGN a teacher to a subject
export const assignTeacherToSubject = async (req: AuthRequest, res: Response) => {
  const { subjectId } = req.params;
  const { teacherId } = req.body;
  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required.' });
  }
  try {
    const assignment = await prisma.subjectAssignment.create({
      data: { subjectId, teacherId },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign teacher.' });
  }
};

// GET enrolled students for a subject
export const getEnrolledStudents = async (req: AuthRequest, res: Response) => {
  const { subjectId } = req.params;
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const assignment = await prisma.subjectAssignment.findUnique({
      where: { teacherId_subjectId: { teacherId, subjectId } },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this subject.' });
    }
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId },
      select: { user: { select: { id: true, name: true, student: { select: { rollNumber: true } } } } },
    });
    const students = enrollments.map(e => ({ ...e.user }));
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrolled students.' });
  }
};