// src/routes/profile.routes.ts
import { Router } from 'express';
import { getMyProfile } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, getMyProfile);

export default router;