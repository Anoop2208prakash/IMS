import { Router } from 'express';
import { 
  getAllFeeStructures, 
  addFeeStructure, 
  updateFeeStructure,
  deleteFeeStructure,
  generateInvoices,
  getMyInvoices,
  makePayment
} from '../controllers/fee.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const financeAdminRoles = ['ADMIN', 'ADMIN_FINANCE'];

// --- Fee Structure Routes ---
router.get('/structures', authMiddleware, getAllFeeStructures);
router.post('/structures', [authMiddleware, roleMiddleware(financeAdminRoles)], addFeeStructure);
router.put('/structures/:id', [authMiddleware, roleMiddleware(financeAdminRoles)], updateFeeStructure);
router.delete('/structures/:id', [authMiddleware, roleMiddleware(financeAdminRoles)], deleteFeeStructure);

// --- Fee Invoice Routes ---
router.post('/invoices/generate', [authMiddleware, roleMiddleware(financeAdminRoles)], generateInvoices);
router.get('/invoices/my-invoices', [authMiddleware, roleMiddleware(['STUDENT'])], getMyInvoices);

// --- Fee Payment Routes ---
router.post('/payments', [authMiddleware, roleMiddleware(['STUDENT'])], makePayment);

export default router;