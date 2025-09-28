import { Router } from 'express';
import { getAllExams, getMyRegistrations, registerForExam } from '../controllers/exam.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getAllExams);
router.post('/:examId/register', protect, registerForExam);
router.get('/my-registrations', protect, getMyRegistrations);

export default router;