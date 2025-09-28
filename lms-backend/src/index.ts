import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bookRoutes from './routes/book.routes';
import loanRoutes from './routes/loan.routes';
import dashboardRoutes from './routes/dashboard.routes';
import courseRoutes from './routes/course.routes';
import feeRoutes from './routes/fee.routes';
import examRoutes from './routes/exam.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import inventoryRoutes from './routes/inventory.routes';
import path from 'path';
import admissionRoutes from './routes/admission.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admissions', admissionRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});