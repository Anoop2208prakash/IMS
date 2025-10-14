import { Router } from 'express';
import { 
  loginUser, 
  forgotPassword, 
  resetPassword,
  changePassword 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// New route for a logged-in user to change their password
router.put('/change-password', authMiddleware, changePassword);

export default router;