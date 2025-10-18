import { Router } from 'express';
import { getAllPrograms, addProgram, updateProgram, deleteProgram } from '../controllers/program.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware(['ADMIN'])];

router.get('/', authMiddleware, getAllPrograms); // All users can see programs
router.post('/', adminOnly, addProgram);
router.put('/:id', adminOnly, updateProgram);
router.delete('/:id', adminOnly, deleteProgram);

export default router;