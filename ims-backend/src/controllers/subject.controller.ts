import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// GET all subjects (optionally filter by program or semester)
export const getAllSubjects = async (req: Request, res: Response) => {
  const { semesterId, programId } = req.query;
  let whereClause = {};

  if (semesterId && semesterId !== 'all') {
    whereClause = { semesterId: String(semesterId) };
  } else if (programId && programId !== 'all') {
    whereClause = { semester: { programId: String(programId) } };
  }

  try {
    // --- THIS IS THE FIX ---
    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: { 
        semester: { 
          include: { 
            program: true 
          } 
        },
        teacher: { // 1. Include the teacher directly
          select: { 
            id: true, 
            name: true 
          } 
        } 
      },
    });
    // -----------------------
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: 'Failed to fetch subjects.' });
  }
};

// ADD a new subject
export const createSubject = async (req: Request, res: Response) => {
  const { title, subjectCode, credits, semesterId } = req.body;
  if (!title || !subjectCode || !credits || !semesterId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const newSubject = await prisma.subject.create({
      data: { 
        title, 
        subjectCode, 
        credits: parseInt(credits), 
        semesterId 
      },
    });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject.' });
  }
};

// UPDATE a subject
export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, subjectCode, credits, semesterId } = req.body;
  if (!title || !subjectCode || !credits || !semesterId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: { 
        title, 
        subjectCode, 
        credits: parseInt(credits), 
        semesterId 
      },
    });
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject.' });
  }
};

// DELETE a subject
export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Check for related records before deleting
    const enrollments = await prisma.enrollment.count({ where: { subjectId: id } });
    if (enrollments > 0) {
      return res.status(400).json({ message: `Cannot delete: ${enrollments} student(s) are enrolled.` });
    }
    
    // We check the direct teacherId link now
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (subject?.teacherId) {
      return res.status(400).json({ message: 'Cannot delete: A teacher is assigned to this subject.' });
    }
    
    const results = await prisma.examResult.count({ where: { subjectId: id } });
    if (results > 0) {
      return res.status(400).json({ message: 'Cannot delete: This subject has exam results.' });
    }

    const attendance = await prisma.attendance.count({ where: { subjectId: id } });
    if (attendance > 0) {
      return res.status(400).json({ message: 'Cannot delete: This subject has attendance records.' });
    }

    await prisma.subject.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject.' });
  }
};

// ASSIGN a teacher to a subject
export const assignTeacherToSubject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // Subject ID
  const { teacherId } = req.body;
  
  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required.' });
  }
  
  try {
    // 1. Check if the teacher is already assigned to another subject
    const existingAssignment = await prisma.subject.findFirst({
      where: { 
        teacherId: teacherId,
        NOT: { id: id } // Exclude the current subject from the check
      }
    });
    
    if (existingAssignment) {
      return res.status(409).json({ 
        message: `This teacher is already assigned to ${existingAssignment.title}.` 
      });
    }

    // 2. Update the subject with the new teacherId
    const updatedSubject = await prisma.subject.update({
      where: { id: id },
      data: {
        teacherId: teacherId,
      },
    });

    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to assign teacher.' });
  }
};

// GET enrolled students for a subject
export const getEnrolledStudents = async (req: AuthRequest, res: Response) => {
  const { subjectId } = req.params;
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    // 3. Verify the teacher is assigned to this subject
    const subject = await prisma.subject.findFirst({
      where: { 
        id: subjectId,
        teacherId: teacherId 
      },
    });
    
    if (!subject) {
      return res.status(403).json({ message: 'You are not assigned to this subject.' });
    }

    // 4. Fetch the students
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId },
      select: { 
        user: { 
          select: { 
            id: true, 
            name: true, 
            sID: true // <-- Use new sID
          } 
        } 
      },
    });

    // Format the data
    const students = enrollments.map(e => ({
      id: e.user.id,
      name: e.user.name,
      sID: e.user.sID, // <-- Use new sID
    }));
    
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrolled students.' });
  }
};