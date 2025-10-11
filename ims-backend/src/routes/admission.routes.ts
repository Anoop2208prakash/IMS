import { Router } from 'express';
import { submitAttendance} from '../controllers/attendance.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { getMyAttendance } from '../controllers/admission.controller';

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