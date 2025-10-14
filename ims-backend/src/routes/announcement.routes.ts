import { Router } from 'express';
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} from '../controllers/announcement.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminRoles = ['ADMIN', 'SUPER_ADMIN'];

router.get('/', authMiddleware, getAllAnnouncements);
router.post('/', [authMiddleware, roleMiddleware(adminRoles)], createAnnouncement);
router.delete('/:id', [authMiddleware, roleMiddleware(adminRoles)], deleteAnnouncement);

export default router;