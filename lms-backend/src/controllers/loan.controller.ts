import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const issueBook = async (req: Request, res: Response) => {
  const { isbn, userEmail } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const book = await prisma.book.findUnique({ where: { isbn: isbn }});
    if (!book) {
      return res.status(404).json({ message: 'Book with that ISBN not found' });
    }
    
    const existingLoan = await prisma.loan.findFirst({
      where: {
        bookId: book.id,
        userId: user.id,
        returnDate: null,
      },
    });

    if (existingLoan) {
      return res.status(400).json({ message: 'User already has this book on loan' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const bookInTx = await tx.book.findUnique({ where: { id: book.id } });

      if (!bookInTx || bookInTx.availableQuantity < 1) {
        throw new Error('Book is not available');
      }

      await tx.book.update({
        where: { id: book.id },
        data: { availableQuantity: { decrement: 1 } },
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const loan = await tx.loan.create({
        data: {
          bookId: book.id,
          userId: user.id,
          dueDate,
        },
      });
      return loan;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Book is not available') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during transaction' });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  const { isbn } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { isbn: isbn } });
      if (!book) {
        throw new Error('Book with that ISBN not found');
      }

      const activeLoan = await tx.loan.findFirst({
        where: {
          bookId: book.id,
          returnDate: null,
        },
      });

      if (!activeLoan) {
        throw new Error('No active loan found for this book');
      }

      const updatedLoan = await tx.loan.update({
        where: { id: activeLoan.id },
        data: { returnDate: new Date() },
      });

      await tx.book.update({
        where: { id: book.id },
        data: { availableQuantity: { increment: 1 } },
      });

      return updatedLoan;
    });

    res.json(result);
  } catch (error: any) {
    if (error.message.includes('No active loan') || error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLoans = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;

  try {
    const loans = await prisma.loan.findMany({
      where: {
        userId: userId,
        returnDate: null, // Only fetch active loans
      },
      include: {
        book: true, // Include the full book details
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};