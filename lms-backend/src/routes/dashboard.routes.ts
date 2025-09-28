import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', protect, getStats);

export default router;