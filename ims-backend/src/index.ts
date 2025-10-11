import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admissionRoutes from './routes/admission.routes';
import authRoutes from './routes/auth.routes';
import staffRoutes from './routes/staff.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import courseRoutes from './routes/course.routes'; 
import profileRoutes from './routes/profile.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import bookRoutes from './routes/book.routes';
import loanRoutes from './routes/loan.routes';
import attendanceRoutes from './routes/attendance.routes'; 
import examRoutes from './routes/exam.routes';
import examResultRoutes from './routes/examResult.routes';
import dashboardRoutes from './routes/dashboard.routes';
import feeRoutes from './routes/fee.routes';
import inventoryRoutes from './routes/inventory.routes';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Routes ---
app.get('/api', (req, res) => {
  res.send('IMS Backend is running!');
});

app.use('/api/admissions', admissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/profile', profileRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-results', examResultRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});