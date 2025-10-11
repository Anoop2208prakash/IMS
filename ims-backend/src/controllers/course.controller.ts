import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// GET all courses
export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
};

// ADD a new course
export const addCourse = async (req: AuthRequest, res: Response) => {
  const { title, courseCode, credits, description } = req.body;
  if (!title || !courseCode || !credits) {
    return res.status(400).json({ message: 'Title, course code, and credits are required.' });
  }
  try {
    const newCourse = await prisma.course.create({
      data: { title, courseCode, credits, description },
    });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course.' });
  }
};

// UPDATE a course
export const updateCourse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, courseCode, credits, description } = req.body;
  if (!title || !courseCode || !credits) {
    return res.status(400).json({ message: 'Title, course code, and credits are required.' });
  }
  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { title, courseCode, credits, description },
    });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course.' });
  }
};

// DELETE a course
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const enrollments = await prisma.enrollment.count({ where: { courseId: id } });
    if (enrollments > 0) {
      return res.status(400).json({ message: `Cannot delete course with ${enrollments} student(s) enrolled.` });
    }
    await prisma.course.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course.' });
  }
};

// ASSIGN a teacher to a course
export const assignTeacherToCourse = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required.' });
  }

  try {
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: 'TEACHER' }
    });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    const assignment = await prisma.courseAssignment.create({
      data: {
        courseId: courseId,
        teacherId: teacherId,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign teacher. The assignment may already exist.' });
  }
};

// GET all students enrolled in a specific course (for teachers)
export const getEnrolledStudents = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const teacherId = req.user?.id;

  if (!teacherId) return res.status(401).json({ message: 'Not authenticated.'});

  try {
    // Security Check: Verify the teacher is assigned to this course
    const assignment = await prisma.courseAssignment.findUnique({
      where: { teacherId_courseId: { teacherId, courseId } },
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this course.' });
    }

    // Fetch all students enrolled in the course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: {
        user: {
          select: { id: true, name: true, student: { select: { rollNumber: true } } },
        },
      },
    });
    
    const students = enrollments.map(e => ({ ...e.user }));
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrolled students.' });
  }
};