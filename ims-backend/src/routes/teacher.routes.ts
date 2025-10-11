// src/routes/teacher.routes.ts
import { Router } from 'express';
// Import all controller functions
import { 
  getAllTeachers, 
  addTeacher, 
  deleteTeacher, 
  updateTeacher, 
  getMyAssignedCourses
} from '../controllers/teacher.controller'; 
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/teachers - Get all teachers
router.get('/', [authMiddleware, roleMiddleware(['ADMIN'])], getAllTeachers);

// POST /api/teachers - Add a new teacher
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], addTeacher);

// DELETE /api/teachers/:id - Delete a teacher
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], deleteTeacher);

// PUT /api/teachers/:id - Update a teacher
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], updateTeacher); // <-- Add this route

router.get('/my-courses', authMiddleware, getMyAssignedCourses);

export default router;