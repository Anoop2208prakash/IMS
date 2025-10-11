// src/controllers/student.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET ALL STUDENTS
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        student: {
          select: {
            rollNumber: true,
            admissionDate: true,
          },
        },
        enrollments: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
};

// CREATE A NEW STUDENT
export const addStudent = async (req: Request, res: Response) => {
  const { fullName, email, password, courseId } = req.body;
  if (!fullName || !email || !password || !courseId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: { create: { rollNumber: `STUDENT-${Date.now()}`, admissionDate: new Date() } },
        enrollments: { create: { courseId: courseId } },
      },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student.' });
  }
};

// UPDATE A STUDENT
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, rollNumber } = req.body;
  if (!name || !email || !rollNumber) {
    return res.status(400).json({ message: 'Name, email, and roll number are required.' });
  }
  try {
    const existingUserWithEmail = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (existingUserWithEmail) return res.status(409).json({ message: 'Email already in use.' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        student: { update: { rollNumber } },
      },
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student.' });
  }
};

// DELETE A STUDENT
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STUDENT') return res.status(404).json({ message: 'Student not found.' });

    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { userId: id } }),
      prisma.student.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student.' });
  }
};