import { Router } from 'express';
import {
  getAllSubjects, addSubject, updateSubject, deleteSubject,
  assignTeacherToSubject, getEnrolledStudents
} from '../controllers/subject.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware(['ADMIN'])];
const teacherOnly = [authMiddleware, roleMiddleware(['TEACHER'])];

// Admin routes
router.get('/', authMiddleware, getAllSubjects);
router.post('/', adminOnly, addSubject);
router.put('/:id', adminOnly, updateSubject);
router.delete('/:id', adminOnly, deleteSubject);
router.post('/:subjectId/assign-teacher', adminOnly, assignTeacherToSubject);

// Teacher routes
router.get('/:subjectId/students', teacherOnly, getEnrolledStudents);

export default router;