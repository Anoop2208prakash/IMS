import { Router } from 'express';
import { createBook, deleteBook, getAllBooks } from '../controllers/book.controller';
import { admin, protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getAllBooks);
router.post('/', protect, admin, createBook); 
router.delete('/:id', protect, admin, deleteBook);
router.post('/', protect, admin(['ADMIN_LIBRARY']), createBook);
router.delete('/:id', protect, admin(['ADMIN_LIBRARY']), deleteBook);

export default router;