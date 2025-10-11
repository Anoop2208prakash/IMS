// src/controllers/profile.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  // req.user is attached by our authMiddleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: true, // Include student-specific details if they exist
        teacher: true, // Include teacher-specific details if they exist
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};