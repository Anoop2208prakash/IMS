import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/courses - Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { title: 'asc' },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses - Create a new course
export const createCourse = async (req: Request, res: Response) => {
  const { title, description, courseCode, credits } = req.body;
  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        courseCode,
        credits: parseInt(credits, 10),
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};