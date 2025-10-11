// src/controllers/teacher.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// This function fetches all existing teachers.
export const getAllTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teacher: {
          select: {
            employeeId: true,
            department: true,
            dateJoined: true,
          },
        },
      },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers.' });
  }
};

// This function creates a new teacher.
export const addTeacher = async (req: AuthRequest, res: Response) => {
  const { fullName, email, password, department } = req.body;

  if (!fullName || !email || !password || !department) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        teacher: {
          create: {
            employeeId: `TEACHER-${Date.now()}`,
            department: department,
            dateJoined: new Date(),
          },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: 'Failed to create teacher.' });
  }
};

// This function deletes a teacher by their ID.
export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'TEACHER') {
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { userId: id } }),
      prisma.teacher.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id: id } })
    ]);

    res.status(204).send();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete teacher.' });
  }
};

// v-- This entire function is new --v

// This function updates a teacher's details.
export const updateTeacher = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ message: 'Name, email, and department are required.' });
  }

  try {
    const existingUserWithEmail = await prisma.user.findFirst({
      where: { email: email, NOT: { id: id } },
    });

    if (existingUserWithEmail) {
      return res.status(409).json({ message: 'This email is already in use by another account.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        teacher: {
          update: {
            department: department,
          },
        },
      },
    });
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    res.status(500).json({ message: 'Failed to update teacher.' });
  }
};

export const getMyAssignedCourses = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const assignments = await prisma.courseAssignment.findMany({
      where: { teacherId },
      include: { course: true },
    });
    const courses = assignments.map(a => a.course);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assigned courses.' });
  }
};