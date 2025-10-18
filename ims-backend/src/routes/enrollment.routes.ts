import { Router } from 'express';
import { getMyEnrolledSubjects } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Replaced /my-courses with /my-subjects
router.get(
  '/my-subjects',
  [authMiddleware, roleMiddleware(['STUDENT'])], 
  getMyEnrolledSubjects
);

export default router;