import { Router } from 'express';
import { 
  getAllTeachers, 
  addTeacher, 
  deleteTeacher, 
  updateTeacher, 
  getMyAssignedSubjects // <-- Renamed this import
} from '../controllers/teacher.controller'; 
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware(['ADMIN'])];

// Admin routes for managing teachers
router.get('/', adminOnly, getAllTeachers);
router.post('/', adminOnly, addTeacher);
router.delete('/:id', adminOnly, deleteTeacher);
router.put('/:id', adminOnly, updateTeacher);

// Teacher-only route to get their assigned subjects
router.get(
  '/my-subjects', // <-- Updated this path
  authMiddleware, 
  getMyAssignedSubjects // <-- Updated this handler
);

export default router;