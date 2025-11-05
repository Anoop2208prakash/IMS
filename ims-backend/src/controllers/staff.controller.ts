import { Request, Response } from 'express';
import { PrismaClient, Role, Prisma } from '@prisma/client';
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

// POST: /api/staff/register
// Creates a new staff member (Teacher, Admin, etc.)
export const registerStaff = async (req: Request, res: Response) => {
  const { fullName, email, password, role, department } = req.body;

  // 1. Validate input
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'Full name, email, password, and role are required.' });
  }

  // 2. Prevent student registration through this endpoint
  if (role === 'STUDENT') {
    return res.status(400).json({ message: 'Please use the admission form for student registration.' });
  }

  // 3. Check if the role is valid
  if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
  }

  // 4. If role is TEACHER, department is required
  if (role === 'TEACHER' && !department) {
    return res.status(400).json({ message: 'Department is required for teachers.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sID = await generateSID(); // <-- Generate the new SID

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        sID: sID, // <-- Save the new SID
        role: role,
        // Conditionally create a teacher record if the role is TEACHER
        ...(role === 'TEACHER' && {
          teacher: {
            create: {
              department: department,
              dateJoined: new Date(),
            },
          },
        }),
      },
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: `${role} registered successfully!`, user: userWithoutPassword });

  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

// GET: /api/staff
// Fetches all non-student users (for Super Admin)
export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          not: 'STUDENT' // Exclude students
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        sID: true,
        role: true,
        teacher: {
          select: {
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff.' });
  }
};

// DELETE: /api/staff/:id
// Deletes a staff member (Admin or Teacher)
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const superAdminId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'Staff not found.' });
    }
    if (user.id === superAdminId || user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Cannot delete your own account or another Super Admin.' });
    }
    if (user.role === 'STUDENT') {
      return res.status(400).json({ message: 'Cannot delete student from this endpoint.' });
    }

    // If the user is a teacher, we must do a full cascade delete
    if (user.role === 'TEACHER') {
      await prisma.$transaction([
        prisma.subject.updateMany({ where: { teacherId: id }, data: { teacherId: null } }),
        prisma.attendance.deleteMany({ where: { markedById: id } }),
        prisma.examResult.deleteMany({ where: { enteredById: id } }),
        prisma.announcement.deleteMany({ where: { authorId: id } }),
        prisma.teacher.delete({ where: { userId: id } }),
        prisma.user.delete({ where: { id: id } })
      ]);
    } else {
      // For other staff (ADMIN, ADMIN_FINANCE, etc.)
      await prisma.$transaction([
        prisma.announcement.deleteMany({ where: { authorId: id } }),
        prisma.user.delete({ where: { id: id } })
      ]);
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete staff member.' });
  }
};