import { Request, Response } from 'express';
import { PrismaClient, Gender, MaritalStatus } from '@prisma/client';
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

// CREATE A NEW STUDENT (UPDATED FOR DETAILED FORM)
export const addStudent = async (req: Request, res: Response) => {
  // Destructure all fields from the form body
  const { 
    fullName, fatherName, motherName, dateOfBirth, gender,
    presentAddress, permanentAddress, religion, nationality,
    phoneNumber, email, nidNumber, bloodGroup, occupation,
    maritalStatus, courseId, password 
  } = req.body;

  // 1. Check if the image file was uploaded by multer
  if (!req.file) {
    return res.status(400).json({ message: 'Student photo is required.' });
  }
  const photoUrl = `/uploads/${req.file.filename}`; // Create the path to be saved in the DB

  try {
    // 2. Add more robust validation
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }
    if (phoneNumber) {
        const existingPhone = await prisma.student.findUnique({ where: { phoneNumber } });
        if (existingPhone) {
            return res.status(409).json({ message: 'Phone number is already in use.' });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        enrollments: { create: { courseId } },
        student: {
          create: {
            rollNumber: `STUDENT-${Date.now()}`,
            admissionDate: new Date(),
            fatherName,
            motherName,
            dateOfBirth: new Date(dateOfBirth),
            gender: gender as Gender,
            presentAddress,
            permanentAddress: permanentAddress || presentAddress,
            religion,
            nationality,
            phoneNumber,
            nidNumber,
            bloodGroup,
            occupation,
            maritalStatus: maritalStatus as MaritalStatus,
            photoUrl, // 3. Save the path to the photo
          },
        },
      },
    });
    res.status(201).json({ message: 'Student admitted successfully!', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while admitting the student.' });
  }
};

// UPDATE A STUDENT
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, rollNumber } = req.body; // This can be expanded to update other fields
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

    // This transaction needs to be updated to delete all related data
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { userId: id } }),
      prisma.loan.deleteMany({ where: { userId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.examResult.deleteMany({ where: { studentId: id } }),
      // ... and so on for other relations
      prisma.student.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student.' });
  }
};