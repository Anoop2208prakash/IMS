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
        enrollments: { // Updated query to find the program title
          take: 1, // We only need one subject to find the program
          select: {
            subject: {
              select: {
                semester: {
                  select: {
                    program: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Re-map the data to be easier for the frontend to read
    const formattedStudents = students.map(s => ({
      ...s,
      // Access the program title through the nested relations
      programName: s.enrollments[0]?.subject?.semester?.program?.title || 'N/A',
    }));
    
    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
};

// CREATE A NEW STUDENT (Refactored for Program/Subject Enrollment)
export const addStudent = async (req: Request, res: Response) => {
  const { 
    fullName, fatherName, motherName, dateOfBirth, gender,
    presentAddress, permanentAddress, religion, nationality,
    phoneNumber, email, nidNumber, bloodGroup, occupation,
    maritalStatus, 
    programId, // <-- Changed from courseId
    password 
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Student photo is required.' });
  }
  const photoUrl = `/uploads/${req.file.filename}`;

  if (!programId) {
    return res.status(400).json({ message: 'Program selection is required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email is already in use.' });
    if (phoneNumber) {
        const existingPhone = await prisma.student.findUnique({ where: { phoneNumber } });
        if (existingPhone) return res.status(409).json({ message: 'Phone number is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- New Enrollment Logic ---
    const firstSemester = await prisma.semester.findFirst({
      where: { programId, name: 'Semester 1' },
      include: { subjects: { select: { id: true } } }
    });

    if (!firstSemester || firstSemester.subjects.length === 0) {
      return res.status(400).json({ message: `This program has no subjects in Semester 1. Please add subjects first.` });
    }

    const enrollmentData = firstSemester.subjects.map(subject => ({
      subjectId: subject.id,
    }));
    // --- End of New Logic ---

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        enrollments: { 
          create: enrollmentData, // Enroll in all subjects
        },
        student: {
          create: {
            rollNumber: `STUDENT-${Date.now()}`,
            admissionDate: new Date(),
            fatherName, motherName,
            dateOfBirth: new Date(dateOfBirth),
            gender: gender as Gender,
            presentAddress,
            permanentAddress: permanentAddress || presentAddress,
            religion, nationality, phoneNumber, nidNumber,
            bloodGroup, occupation,
            maritalStatus: maritalStatus as MaritalStatus,
            photoUrl,
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
        name, email,
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
      prisma.loan.deleteMany({ where: { userId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.examResult.deleteMany({ where: { studentId: id } }),
      prisma.feeInvoice.deleteMany({ where: { userId: id } }),
      prisma.feePayment.deleteMany({ where: { userId: id } }),
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.inventoryIssuance.deleteMany({ where: { userId: id } }),
      prisma.student.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student.' });
  }
};