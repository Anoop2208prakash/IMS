import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

// This function fetches all existing teachers.
export const getAllTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        sID: true, // <-- Get the new SID
        role: true,
        createdAt: true,
        teacher: {
          select: {
            // employeeId: true, // <-- Removed
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
    const sID = await generateSID(); // <-- Generate new SID

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        sID: sID, // <-- Save new SID
        role: 'TEACHER',
        teacher: {
          create: {
            // employeeId: `TEACHER-${Date.now()}`, // <-- Removed
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

// This function updates a teacher's details.
export const updateTeacher = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, sID, department } = req.body; // <-- Added sID

  if (!name || !email || !sID || !department) {
    return res.status(400).json({ message: 'Name, email, SID, and department are required.' });
  }

  try {
    const existingUserWithEmail = await prisma.user.findFirst({
      where: { email: email, NOT: { id: id } },
    });
    if (existingUserWithEmail) {
      return res.status(409).json({ message: 'This email is already in use.' });
    }
    
    const existingUserWithSID = await prisma.user.findFirst({
      where: { sID: sID, NOT: { id: id } },
    });
    if (existingUserWithSID) {
      return res.status(409).json({ message: 'This SID is already in use.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        sID: sID, // <-- Update sID
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

// This function deletes a teacher by their ID.
export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'TEACHER') {
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    
    // Updated transaction to include all relations
    await prisma.$transaction([
      prisma.subjectAssignment.deleteMany({ where: { teacherId: id } }),
      prisma.attendance.deleteMany({ where: { markedById: id } }),
      prisma.examResult.deleteMany({ where: { enteredById: id } }),
      prisma.announcement.deleteMany({ where: { authorId: id } }), // <-- Added this
      prisma.teacher.delete({ where: { userId: id } }),
      prisma.user.delete({ where: { id: id } })
    ]);

    res.status(204).send();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete teacher.' });
  }
};

// GET subjects assigned to the logged-in teacher
export const getMyAssignedSubjects = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const assignments = await prisma.subjectAssignment.findMany({
      where: { teacherId },
      include: { 
        subject: { 
          include: {
            semester: { 
              include: {
                program: { select: { title: true } }
              }
            }
          }
        } 
      },
    });
    
    const subjects = assignments.map(a => ({
      ...a.subject,
      programTitle: a.subject.semester.program.title,
    }));
    
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assigned subjects.' });
  }
};