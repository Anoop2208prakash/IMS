import { Router } from 'express';
import {
  getAllSubjects,
  createSubject, // <-- Renamed from addSubject
  updateSubject,
  deleteSubject,
  assignTeacherToSubject,
  getEnrolledStudents
} from '../controllers/subject.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
const teacherRole = ['TEACHER'];

// Admin routes
router.get('/', authMiddleware, getAllSubjects);
router.post('/', authMiddleware, roleMiddleware(adminRoles), createSubject);
router.put('/:id', authMiddleware, roleMiddleware(adminRoles), updateSubject);
router.delete('/:id', authMiddleware, roleMiddleware(adminRoles), deleteSubject);

// Route for Admins to assign a teacher
router.post(
  '/:id/assign-teacher', // <-- Standardized to :id
  authMiddleware,
  roleMiddleware(adminRoles),
  assignTeacherToSubject
);

// Teacher routes
router.get(
  '/:subjectId/students', // <-- This remains :subjectId as it's specific
  authMiddleware,
  roleMiddleware(teacherRole),
  getEnrolledStudents
);

export default router;