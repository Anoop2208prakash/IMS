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
          take: 1,
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

    const formattedStudents = students.map(s => ({
      ...s,
      programName: s.enrollments[0]?.subject?.semester?.program?.title || 'N/A',
    }));
    
    res.status(200).json(formattedStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
};

// CREATE A NEW STUDENT
export const addStudent = async (req: Request, res: Response) => {
  const { 
    fullName, fatherName, motherName, dateOfBirth, gender,
    presentAddress, permanentAddress, religion, nationality,
    phoneNumber, email, nidNumber, bloodGroup, occupation,
    maritalStatus, 
    programId,
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

    const firstSemester = await prisma.semester.findFirst({
      where: { programId, name: 'Semester 1' }, // Or "1" if that is what you used
      include: { subjects: { select: { id: true } } }
    });

    if (!firstSemester || firstSemester.subjects.length === 0) {
      return res.status(400).json({ message: `This program has no subjects in Semester 1. Please add subjects first.` });
    }

    const enrollmentData = firstSemester.subjects.map(subject => ({
      subjectId: subject.id,
    }));

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        enrollments: { create: enrollmentData },
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
  // ... (this function is unchanged)
};

// DELETE A STUDENT (Corrected Version)
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // --- This is the fix ---
    // 1. Find all orders associated with the student
    const studentOrders = await prisma.order.findMany({
      where: { userId: id },
      select: { id: true }
    });
    const orderIds = studentOrders.map(order => order.id);

    // 2. Delete all OrderItems linked to those orders
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } }
    });
    // --- End of fix ---

    // 3. Now the full transaction will work
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { userId: id } }),
      prisma.loan.deleteMany({ where: { userId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.examResult.deleteMany({ where: { studentId: id } }),
      prisma.feeInvoice.deleteMany({ where: { userId: id } }),
      prisma.feePayment.deleteMany({ where: { userId: id } }),
      prisma.order.deleteMany({ where: { userId: id } }), // This line will no longer fail
      prisma.inventoryIssuance.deleteMany({ where: { userId: id } }),
      prisma.student.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    
    res.status(204).send();
  } catch (error) {
    console.error(error); // Log the real error
    res.status(500).json({ message: 'Failed to delete student.' });
  }
};