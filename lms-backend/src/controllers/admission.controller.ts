import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// POST /api/admissions/apply - Handles new student applications and creates their accounts
export const submitApplication = async (req: Request, res: Response) => {
  const { 
    fullName, fatherName, motherName, birthDate, gender, fullAddress, religion,
    nationality, phoneNumber, email, bloodGroup, tenthPercentage, twelfthPercentage,
    guardianPhoneNumber, courseId, password 
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'A photo is required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rollNumber = `STUDENT-${Date.now()}`;

    // Create the User, Student, Enrollment, and Admission record
    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'USER',
        student: {
          create: {
            rollNumber,
            admissionDate: new Date(),
            profileImageUrl: `/uploads/admissions/${req.file.filename}`,
          },
        },
        enrollments: {
          create: { courseId },
        },
      },
    });

    // ✅ CORRECTED: The 'await prisma.admission.create' was missing
    await prisma.admission.create({
      data: {
        fullName, fatherName, motherName, gender, fullAddress, religion,
        nationality, phoneNumber, email, bloodGroup,
        birthDate: new Date(birthDate),
        tenthPercentage: parseFloat(tenthPercentage),
        twelfthPercentage: parseFloat(twelfthPercentage),
        guardianPhoneNumber,
        courseId,
        password: hashedPassword,
        imageUrl: `/uploads/admissions/${req.file.filename}`,
      },
    });

    res.status(201).json({ message: 'Application submitted and account created successfully!' });
  } catch (error) {
    console.error(error); // Log the actual error to the backend console for debugging
    res.status(400).json({ message: 'Error submitting application' });
  }
};

// GET /api/admissions - Get all applications (Admin only)
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const applications = await prisma.admission.findMany({ 
      include: { course: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};