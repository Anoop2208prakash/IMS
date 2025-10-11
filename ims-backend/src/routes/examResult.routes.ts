import { Router } from 'express';
import { submitMarks, getMyResults } from '../controllers/examResult.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// For a Teacher to submit marks
router.post('/', [authMiddleware, roleMiddleware(['TEACH-ER'])], submitMarks);

// For a Student to get their own exam results
router.get(
  '/my-results',
  [authMiddleware, roleMiddleware(['STUDENT'])],
  getMyResults
);

export default router;