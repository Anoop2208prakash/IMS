import { Request, Response } from 'express';
import { PrismaClient, Gender, MaritalStatus, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Helper function to generate a unique 7-digit SID
const generateSID = async (): Promise<string> => {
  let sID = Math.floor(1000000 + Math.random() * 9000000).toString();
  const existing = await prisma.user.findUnique({ where: { sID } });
  if (existing) {
    return await generateSID(); // Recurse if it exists
  }
  return sID;
};

// This function is for a public admission form
export const submitApplication = async (req: Request, res: Response) => {
  const { fullName, email, password, programId } = req.body;

  if (!fullName || !email || !password || !programId) {
    return res.status(400).json({ message: 'Full name, email, password, and program are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sID = await generateSID();

    const firstSemester = await prisma.semester.findFirst({
      where: { programId, name: 'Semester 1' },
      include: { subjects: { select: { id: true } } }
    });

    if (!firstSemester || firstSemester.subjects.length === 0) {
      return res.status(400).json({ message: `This program has no subjects in Semester 1. Cannot enroll.` });
    }

    const enrollmentData = firstSemester.subjects.map(subject => ({
      subjectId: subject.id,
    }));

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        sID: sID,
        role: 'STUDENT',
        student: {
          create: {
            admissionDate: new Date(),
          },
        },
        enrollments: {
          create: enrollmentData,
        },
      },
    });

    res.status(201).json({ message: 'Application successful!', user: newUser });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: 'An error occurred while processing your application.' });
  }
};

// --- The getMyAttendance function has been REMOVED from this file ---