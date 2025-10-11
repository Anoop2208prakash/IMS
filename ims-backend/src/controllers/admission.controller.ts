// src/controllers/admission.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const submitApplication = async (req: Request, res: Response) => {
  const { fullName, email, password, courseId } = req.body;

  if (!fullName || !email || !password || !courseId) {
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
        role: 'STUDENT',
        student: {
          create: {
            rollNumber: `STUDENT-${Date.now()}`,
            admissionDate: new Date(),
          },
        },
        enrollments: { // <-- This block was added
          create: {
            courseId: courseId, // Links the user to the selected course
          },
        },
      },
    });

    res.status(201).json({ message: 'Application successful!', user: newUser });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: 'An error occurred while processing your application.' });
  }
};

// GET a student's own attendance records
export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: { select: { title: true } }, // Include the course title
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};