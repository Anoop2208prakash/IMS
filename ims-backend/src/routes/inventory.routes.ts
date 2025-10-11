import { Router } from 'express';
import { 
  getAllItems, 
  addItem, 
  updateItem, 
  deleteItem,
  purchaseItem 
} from '../controllers/inventory.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware(['ADMIN'])];

// --- Admin Routes for managing inventory ---
router.get('/', authMiddleware, getAllItems);
router.post('/', adminOnly, addItem);
router.put('/:id', adminOnly, updateItem);
router.delete('/:id', adminOnly, deleteItem);

// --- Student Route for buying an item ---
router.post('/purchase', [authMiddleware, roleMiddleware(['STUDENT'])], purchaseItem);

export default router;