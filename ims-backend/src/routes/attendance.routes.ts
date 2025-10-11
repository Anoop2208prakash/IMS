import { Router } from 'express';
import { submitAttendance, getMyAttendance } from '../controllers/attendance.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// For a Teacher to submit attendance records
router.post('/', [authMiddleware, roleMiddleware(['TEACHER'])], submitAttendance);

// For a Student to get their own attendance records
router.get(
  '/my-attendance',
  [authMiddleware, roleMiddleware(['STUDENT'])],
  getMyAttendance
);

export default router;