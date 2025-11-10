import { Request, Response } from 'express';
import { PrismaClient, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper function to generate a unique 7-digit SID
const generateSID = async (): Promise<string> => {
  let sID = Math.floor(1000000 + Math.random() * 9000000).toString();
  const existing = await prisma.user.findUnique({ where: { sID } });
  if (existing) {
    return await generateSID();
  }
  return sID;
};

// POST: /api/staff/register
export const registerStaff = async (req: Request, res: Response) => {
  // 1. Get data from form fields (req.body)
  const { 
    fullName, email, password, role, department, 
    phoneNumber, dob, bloodGroup, dateJoined 
  } = req.body;

  // 2. Get the uploaded file (req.file)
  const profileImage = req.file;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'Full name, email, password, and role are required.' });
  }
  if (role === 'TEACHER' && !department) {
    return res.status(400).json({ message: 'Department is required for teachers.' });
  }
  if (!profileImage) {
    return res.status(400).json({ message: 'Profile image is required.' });
  }

  try {
    const existingUserEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserEmail) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }
    
    // 3. Generate sID here
    const sID = await generateSID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const photoUrl = `/uploads/${profileImage.filename}`;

    const newUserData: Prisma.UserCreateInput = {
      name: fullName,
      email,
      password: hashedPassword,
      sID: sID, // Use the generated sID
      role: role as Role,
    };

    if (role === 'TEACHER') {
      newUserData.teacher = {
        create: {
          department: department,
          dateJoined: new Date(dateJoined),
          phoneNumber: phoneNumber || null,
          dateOfBirth: dob ? new Date(dob) : null,
          bloodGroup: bloodGroup || null,
          photoUrl: photoUrl,
        }
      };
    }

    const newUser = await prisma.user.create({ data: newUserData });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: `${role} registered successfully!`, user: userWithoutPassword });

  } catch (error) {
    console.error('Staff registration error:', error);
    if (profileImage) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', profileImage.filename);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting orphaned image:", err);
      });
    }
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

// GET: /api/staff
export const getAllStaff = async (req: AuthRequest, res: Response) => {
  // --- THIS IS THE FIX ---
  const { role } = req.query;

  try {
    let whereClause: any = {
      role: {
        not: 'STUDENT' // Exclude students
      }
    };

    // If a specific role is provided, overwrite the role filter
    if (role && role !== 'all') {
      whereClause.role = role as Role;
    }
    // ---------------------

    const staff = await prisma.user.findMany({
      where: whereClause, // Use the new whereClause
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
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const loggedInUserId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: { teacher: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'Staff not found.' });
    }
    if (user.id === loggedInUserId) {
      return res.status(403).json({ message: 'You cannot delete your own account.' });
    }
    if (user.role === 'STUDENT') {
      return res.status(400).json({ message: 'Cannot delete student from this endpoint.' });
    }

    if (user.role === 'TEACHER' && user.teacher) {
      await prisma.$transaction([
        prisma.subject.updateMany({ where: { teacherId: id }, data: { teacherId: null } }),
        prisma.attendance.deleteMany({ where: { markedById: id } }),
        prisma.examResult.deleteMany({ where: { enteredById: id } }),
        prisma.announcement.deleteMany({ where: { authorId: id } }),
        prisma.teacher.delete({ where: { userId: id } }),
        prisma.user.delete({ where: { id: id } })
      ]);
      
      if (user.teacher.photoUrl) {
        const imagePath = path.join(__dirname, '..', '..', user.teacher.photoUrl);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
      }
    } else {
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