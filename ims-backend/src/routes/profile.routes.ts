import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller'; // <-- This line is the fix
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// This route gets the profile of the currently logged-in user
router.get('/me', authMiddleware, getProfile); // <-- This line is the fix

export default router;