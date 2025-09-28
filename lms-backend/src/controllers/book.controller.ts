import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/books - Get all books (with search and pagination)
export const getAllBooks = async (req: Request, res: Response) => {
  const { search, page = '1', pageSize = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const size = parseInt(pageSize as string, 10);

  const whereClause = search
    ? {
        title: {
          contains: search as string,
        },
      }
    : {};

  try {
    const [books, totalBooks] = await prisma.$transaction([
      prisma.book.findMany({
        where: whereClause,
        include: {
          authors: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.book.count({ where: whereClause }),
    ]);

    res.json({
      books,
      totalPages: Math.ceil(totalBooks / size),
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/books - Create a new book (Admin only)
export const createBook = async (req: Request, res: Response) => {
  const { title, isbn, publishedDate, totalQuantity, authorName } = req.body;

  try {
    let author = await prisma.author.findFirst({
      where: { name: authorName },
    });

    if (!author) {
      author = await prisma.author.create({
        data: { name: authorName },
      });
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        isbn,
        publishedDate: new Date(publishedDate),
        totalQuantity: parseInt(totalQuantity, 10),
        availableQuantity: parseInt(totalQuantity, 10),
        authors: {
          create: {
            authorId: author.id,
          },
        },
      },
    });
    res.status(201).json(newBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/books/:id - Delete a book (Admin only)
export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Before deleting a book, we must delete related records in BookAuthor and Loan
    await prisma.$transaction([
      prisma.bookAuthor.deleteMany({ where: { bookId: id } }),
      prisma.loan.deleteMany({ where: { bookId: id } }),
      prisma.book.delete({ where: { id } }),
    ]);

    res.status(204).send(); // 204 No Content is standard for a successful delete
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting book' });
  }
};