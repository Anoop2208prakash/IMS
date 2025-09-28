import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Get the current user's profile
export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update the current user's profile
export const updateProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  const { name } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Create a new user (Super Admin only)
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
};

// Update any user's details, including optional password (Super Admin only)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  try {
    const dataToUpdate: any = { name, email, role };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
};

// Delete a user (Super Admin only)
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user. Ensure related records are removed.' });
  }
};

// Update the logged-in user's own password
export const updateMyPassword = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload a profile picture
export const uploadProfileImage = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found for this user.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    await prisma.student.update({
      where: { userId },
      data: { profileImageUrl: imageUrl },
    });

    res.json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get the logged-in user's student profile
export const getMyStudentProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  try {
    const studentProfile = await prisma.student.findUnique({
      where: { userId },
    });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }
    res.json(studentProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};