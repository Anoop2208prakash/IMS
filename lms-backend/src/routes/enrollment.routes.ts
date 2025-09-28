import { Router } from 'express';
import { getMyGrades, assignGrade } from '../controllers/enrollment.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-grades', protect, getMyGrades);
router.post('/grade', protect, admin, assignGrade);

export default router;