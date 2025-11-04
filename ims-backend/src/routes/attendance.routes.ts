import { Router } from 'express';
import { 
  submitAttendance, 
  getMyAttendance 
} from '../controllers/attendance.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const teacherRole = ['TEACHER'];
const studentRole = ['STUDENT'];

// Route for Teachers to submit attendance
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware(teacherRole), 
  submitAttendance
);

// --- THIS IS THE FIX ---
// Route for Students to get their own attendance
router.get(
  '/my-attendance', 
  authMiddleware, 
  roleMiddleware(studentRole), 
  getMyAttendance
);
// -----------------------

export default router;