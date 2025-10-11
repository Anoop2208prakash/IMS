import { Router } from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderInvoice,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminRoles = ['ADMIN', 'ADMIN_FINANCE'];

// --- Student Routes ---
router.post('/', [authMiddleware, roleMiddleware(['STUDENT'])], createOrder);
router.get('/my-orders', [authMiddleware, roleMiddleware(['STUDENT'])], getMyOrders);

// --- Admin Routes (MUST be before the dynamic ':orderId' routes) ---
router.get('/all', [authMiddleware, roleMiddleware(adminRoles)], getAllOrders);
router.put('/:orderId/status', [authMiddleware, roleMiddleware(adminRoles)], updateOrderStatus);

// --- SHARED ROUTE (for both Students and Admins) ---
// Accessible to any authenticated user. The controller handles the permissions logic.
router.get('/:orderId', authMiddleware, getOrderInvoice);

export default router;