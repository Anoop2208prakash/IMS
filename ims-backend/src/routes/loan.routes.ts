// src/routes/loan.routes.ts
import { Router } from 'express';
import { 
  checkoutBook, 
  getActiveLoans, 
  getMyLoans, 
  returnBook 
} from '../controllers/loan.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';


const router = Router();
const libraryAdminRoles = ['ADMIN', 'ADMIN_LIBRARY'];

// POST /api/loans/checkout - Issue a book to a user
router.post('/checkout', [authMiddleware, roleMiddleware(libraryAdminRoles)], checkoutBook);

// GET /api/loans/active - Get a list of all active (unreturned) loans
router.get('/active', [authMiddleware, roleMiddleware(libraryAdminRoles)], getActiveLoans);

// POST /api/loans/return - Mark a loan as returned
router.post('/return', [authMiddleware, roleMiddleware(libraryAdminRoles)], returnBook);
router.get('/my-loans', authMiddleware, getMyLoans);

export default router;