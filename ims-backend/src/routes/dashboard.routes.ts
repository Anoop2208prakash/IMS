import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getDashboardData);

export default router;