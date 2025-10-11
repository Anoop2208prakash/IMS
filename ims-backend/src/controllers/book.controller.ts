import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET all books
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books.' });
  }
};

// ADD a new book
export const addBook = async (req: Request, res: Response) => {
  const { title, isbn, publishedDate, totalQuantity } = req.body;
  if (!title || !isbn || !publishedDate || !totalQuantity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        isbn,
        publishedDate: new Date(publishedDate),
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: parseInt(totalQuantity),
      },
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create book.' });
  }
};

// UPDATE a book
export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, isbn, publishedDate, totalQuantity, availableQuantity } = req.body;

  // FIX: Corrected validation to allow a quantity of 0
  if (
    !title ||
    !isbn ||
    !publishedDate ||
    totalQuantity == null || 
    availableQuantity == null
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title,
        isbn,
        publishedDate: new Date(publishedDate),
        totalQuantity: parseInt(totalQuantity),
        availableQuantity: parseInt(availableQuantity),
      },
    });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book.' });
  }
};

// DELETE a book
export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const loans = await prisma.loan.count({ where: { bookId: id, returnDate: null } });
    if (loans > 0) {
      return res.status(400).json({ message: `Cannot delete book, it is currently on loan to ${loans} user(s).` });
    }
    await prisma.book.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book.' });
  }
};