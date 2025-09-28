import { Router } from 'express';
import { getUserFees, createFee, recordPayment } from '../controllers/fee.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

// Corrected: The admin middleware is now called with the allowed roles
router.get('/user/:userId', protect, admin(['ADMIN', 'SUPER_ADMIN']), getUserFees);
router.post('/', protect, admin(['ADMIN', 'SUPER_ADMIN']), createFee);
router.post('/payment', protect, admin(['ADMIN', 'SUPER_ADMIN']), recordPayment); 

export default router;