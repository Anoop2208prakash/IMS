import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware'; // Import AuthRequest
const prisma = new PrismaClient();

// PROCESS a book checkout
export const checkoutBook = async (req: Request, res: Response) => {
  const { bookId, identifier } = req.body;

  if (!bookId || !identifier) {
    return res.status(400).json({ message: 'Book ID and User Identifier are required.' });
  }

  try {
    let user = null;
    const studentProfile = await prisma.student.findUnique({ where: { rollNumber: identifier } });

    if (studentProfile) {
      user = await prisma.user.findUnique({ where: { id: studentProfile.userId } });
    } else {
      const teacherProfile = await prisma.teacher.findUnique({ where: { employeeId: identifier } });
      if (teacherProfile) {
        user = await prisma.user.findUnique({ where: { id: teacherProfile.userId } });
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User with that Roll Number or Employee ID not found.' });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    if (book.availableQuantity < 1) {
      return res.status(400).json({ message: 'Book is not available for checkout.' });
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const [, newLoan] = await prisma.$transaction([
      prisma.book.update({ where: { id: bookId }, data: { availableQuantity: { decrement: 1 } } }),
      prisma.loan.create({ data: { bookId, userId: user.id, dueDate } }),
    ]);

    res.status(201).json(newLoan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process checkout.' });
  }
};

// GET all active loans (for librarians)
export const getActiveLoans = async (req: Request, res: Response) => {
  try {
    const activeLoans = await prisma.loan.findMany({
      where: { returnDate: null },
      include: {
        user: { select: { name: true } },
        book: { select: { title: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.status(200).json(activeLoans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active loans.' });
  }
};

// PROCESS a book return
export const returnBook = async (req: Request, res: Response) => {
  const { loanId } = req.body;
  if (!loanId) {
    return res.status(400).json({ message: 'Loan ID is required.' });
  }

  try {
    const loan = await prisma.loan.findUnique({ where: { id: loanId, returnDate: null } });
    if (!loan) {
      return res.status(404).json({ message: 'Active loan not found.' });
    }

    const [, updatedLoan] = await prisma.$transaction([
      prisma.book.update({ where: { id: loan.bookId }, data: { availableQuantity: { increment: 1 } } }),
      prisma.loan.update({ where: { id: loanId }, data: { returnDate: new Date() } }),
    ]);

    res.status(200).json(updatedLoan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process return.' });
  }
};

// v-- This entire function is new --v

// GET a user's own loan history
export const getMyLoans = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      include: {
        book: { select: { title: true } },
      },
      orderBy: { checkoutDate: 'desc' }, // Show most recent first
    });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loan history.' });
  }
};