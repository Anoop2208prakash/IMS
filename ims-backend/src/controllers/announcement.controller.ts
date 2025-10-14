import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
const prisma = new PrismaClient();

// GET all announcements (for everyone)
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } }, // Include author's name
    });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements.' });
  }
};

// CREATE a new announcement (for Admins)
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;
  const authorId = req.user?.id;

  if (!title || !content || !authorId) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }
  try {
    const newAnnouncement = await prisma.announcement.create({
      data: { title, content, authorId },
    });
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
};

// DELETE an announcement (for Admins)
export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.announcement.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement.' });
  }
};