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
  // 1. Changed courseId to programId
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
    const sID = await generateSID(); // 2. Generate new sID

    // 3. Find all subjects for Semester 1 of the selected program
    const firstSemester = await prisma.semester.findFirst({
      where: { programId, name: 'Semester 1' },
      include: { subjects: { select: { id: true } } }
    });

    if (!firstSemester || firstSemester.subjects.length === 0) {
      return res.status(400).json({ message: `This program has no subjects in Semester 1. Cannot enroll.` });
    }

    // 4. Prepare enrollment data for all subjects
    const enrollmentData = firstSemester.subjects.map(subject => ({
      subjectId: subject.id,
    }));

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        sID: sID, // 5. Save the new sID
        role: 'STUDENT',
        student: {
          create: {
            // rollNumber is removed
            admissionDate: new Date(),
          },
        },
        enrollments: {
          create: enrollmentData, // 6. Create enrollments for all subjects
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
        // --- THIS IS THE FIX ---
        // Changed 'course' to 'subject' to match your schema
        subject: { select: { title: true } }, 
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};