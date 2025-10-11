import { Router } from 'express';
import { 
  getAllExams, 
  addExam, 
  updateExam, 
  deleteExam,
  getAdmitCard 
} from '../controllers/exam.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAllExams);
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], addExam);
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], updateExam);
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], deleteExam);

// For a student to get their admit card data
router.get(
  '/:examId/admit-card',
  [authMiddleware, roleMiddleware(['STUDENT'])],
  getAdmitCard
);

export default router;