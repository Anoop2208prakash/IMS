import { Router } from 'express';
import { getMyEnrolledSubjects } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const studentRole = ['STUDENT'];

// This route matches the frontend API call
router.get(
  '/my-subjects',
  authMiddleware,
  roleMiddleware(studentRole),
  getMyEnrolledSubjects
);

export default router;