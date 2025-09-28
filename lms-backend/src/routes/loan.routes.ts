import { Router } from 'express';
import { issueBook, returnBook } from '../controllers/loan.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.post('/issue', protect, admin, issueBook);
router.post('/return', protect, admin, returnBook);
router.post('/issue', protect, admin(['ADMIN_LIBRARY']), issueBook);
router.post('/return', protect, admin(['ADMIN_LIBRARY']), returnBook);

export default router;