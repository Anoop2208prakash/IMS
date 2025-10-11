import { Router } from 'express';
import { getAllStudents, addStudent, updateStudent, deleteStudent } from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
// Add 'ADMIN_FINANCE' to this array
const adminRoles = ['ADMIN', 'ADMIN_ADMISSION', 'ADMIN_FINANCE'];

router.get('/', [authMiddleware, roleMiddleware(adminRoles)], getAllStudents);
router.post('/', [authMiddleware, roleMiddleware(adminRoles)], addStudent);
router.put('/:id', [authMiddleware, roleMiddleware(adminRoles)], updateStudent);
router.delete('/:id', [authMiddleware, roleMiddleware(adminRoles)], deleteStudent);

export default router;