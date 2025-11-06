import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
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