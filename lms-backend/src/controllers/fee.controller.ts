import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/fees/user/:userId - Get all fees for a specific user
export const getUserFees = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const fees = await prisma.fee.findMany({
      where: { userId },
      include: { course: true },
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/fees - Create a new fee for a user
export const createFee = async (req: Request, res: Response) => {
  const { userId, courseId, amount, dueDate } = req.body;
  try {
    const fee = await prisma.fee.create({
      data: {
        userId,
        courseId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
      },
    });
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/fees/payment - Record a new payment
export const recordPayment = async (req: Request, res: Response) => {
  const { feeId, amount } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const fee = await tx.fee.findUnique({ where: { id: feeId } });

      if (!fee) {
        throw new Error('Fee not found');
      }

      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          feeId,
          userId: fee.userId,
          amount: parseFloat(amount),
        },
      });

      // Mark the fee as paid
      await tx.fee.update({
        where: { id: feeId },
        data: { isPaid: true },
      });

      return payment;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Server error' });
  }
};