import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
          { userId: user.id, role: user.role },
          JWT_SECRET,
          { expiresIn: '1d' }
      );

      res.status(200).json({ token, userId: user.id, name: user.name, role: user.role });

  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};