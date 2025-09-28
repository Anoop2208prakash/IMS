import { Router } from 'express';
import { getInventory, addItem } from '../controllers/inventory.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getInventory)
  .post(protect, admin, addItem);

  router.post('/', protect, admin(['ADMIN_UNIFORMS', 'ADMIN_STATIONERY']), addItem);

export default router;