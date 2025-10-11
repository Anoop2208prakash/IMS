// src/routes/enrollment.routes.ts
import { Router } from 'express';
import { getMyCourses } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-courses', [authMiddleware, roleMiddleware(['STUDENT'])], getMyCourses);

export default router;