import { Router } from 'express';
import { 
  registerStaff, 
  getAllStaff, 
  deleteStaff 
} from '../controllers/staff.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const superAdminRole = ['SUPER_ADMIN'];

// All staff routes are now protected and require SUPER_ADMIN role
router.get(
  '/', 
  authMiddleware, // <-- 1. COMMENT OUT THIS LINE
  roleMiddleware(superAdminRole), // <-- 2. COMMENT OUT THIS LINE
  getAllStaff
);

router.post(
  '/register', 
  authMiddleware, // <-- 3. COMMENT OUT THIS LINE
  roleMiddleware(superAdminRole), // <-- 4. COMMENT OUT THIS LINE
  registerStaff
);

router.delete(
  '/:id', 
  authMiddleware, // <-- 5. COMMENT OUT THIS LINE
  roleMiddleware(superAdminRole), // <-- 6. COMMENT OUT THIS LINE
  deleteStaff
);

export default router;