import { Request, Response } from 'express';
import { PrismaClient, Gender, MaritalStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

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

// GET ALL STUDENTS
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        sID: true, // <-- Get the new SID
        createdAt: true,
        student: {
          select: {
            // rollNumber: true, // <-- REMOVED
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
    const sID = await generateSID(); // Generate the new SID

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
        sID: sID, // <-- Add the new SID
        role: 'STUDENT',
        enrollments: { create: enrollmentData },
        student: {
          create: {
            // rollNumber: `STUDENT-${Date.now()}`, // <-- REMOVED
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
  const { name, email, sID } = req.body; // <-- Changed from rollNumber to sID
  if (!name || !email || !sID) {
    return res.status(400).json({ message: 'Name, email, and SID are required.' });
  }
  try {
    const existingUserWithEmail = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (existingUserWithEmail) return res.status(409).json({ message: 'Email already in use.' });

    // Check for sID conflict
    const existingUserWithSID = await prisma.user.findFirst({ where: { sID, NOT: { id } } });
    if (existingUserWithSID) return res.status(409).json({ message: 'SID is already in use.' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name, 
        email,
        sID, // <-- Update sID on the User model
      },
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update student.' });
  }
};

// DELETE A STUDENT (Corrected Version)
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 1. Find all orders associated with the student
    const studentOrders = await prisma.order.findMany({
      where: { userId: id },
      select: { id: true }
    });
    const orderIds = studentOrders.map(order => order.id);

    // 2. Delete all OrderItems linked to those orders (if any)
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } }
      });
    }
    
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