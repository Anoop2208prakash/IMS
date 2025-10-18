import { Router } from 'express';
import { getAllSemesters, addSemester, updateSemester, deleteSemester } from '../controllers/semester.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware(['ADMIN'])];

router.get('/', authMiddleware, getAllSemesters);
router.post('/', adminOnly, addSemester);
router.put('/:id', adminOnly, updateSemester);
router.delete('/:id', adminOnly, deleteSemester);

export default router;