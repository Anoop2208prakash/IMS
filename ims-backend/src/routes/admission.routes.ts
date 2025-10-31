import { Router } from 'express';
import { getMyAttendance } from '../controllers/admission.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const studentRole = ['STUDENT'];

// This route is for a student to get their own attendance
router.get(
  '/my-attendance', 
  authMiddleware, 
  roleMiddleware(studentRole), 
  getMyAttendance
);

// The public "submitApplication" route is no longer used.
// Student creation is now handled by /api/students (addStudent)

export default router;