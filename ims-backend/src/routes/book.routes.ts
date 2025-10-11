// src/routes/book.routes.ts
import { Router } from 'express';
import { getAllBooks, addBook, updateBook, deleteBook } from '../controllers/book.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
const router = Router();
const libraryAdminRoles = ['ADMIN', 'ADMIN_LIBRARY'];

router.get('/', authMiddleware, getAllBooks); // All authenticated users can see books
router.post('/', [authMiddleware, roleMiddleware(libraryAdminRoles)], addBook);
router.put('/:id', [authMiddleware, roleMiddleware(libraryAdminRoles)], updateBook);
router.delete('/:id', [authMiddleware, roleMiddleware(libraryAdminRoles)], deleteBook);

export default router;