import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- 1. Import Toaster

// --- Layout and Auth Imports ---
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// --- Public Page Imports ---
import LoginPage from './pages/LoginPage';
import StaffRegisterPage from './pages/StaffRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- Shared Page Imports ---
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import IDCardPage from './pages/IDCardPage';
import OrderInvoicePage from './pages/student/OrderInvoicePage';

// --- Student-Only Imports ---
import MyCoursesPage from './pages/MyCoursesPage';
import MyAttendancePage from './pages/student/MyAttendancePage';
import MyResultsPage from './pages/student/MyResultsPage';
import MyInvoicesPage from './pages/student/MyInvoicesPage';
import AdmitCardPage from './pages/student/AdmitCardPage';
import StationaryStorePage from './pages/student/StationaryStorePage';
import MyOrdersPage from './pages/student/MyOrdersPage';

// --- Teacher-Only Imports ---
import MarkAttendancePage from './pages/teacher/MarkAttendancePage';
import EnterMarksPage from './pages/teacher/EnterMarksPage';

// --- Admin Imports ---
import NewAdmissionPage from './pages/admin/admission/NewAdmissionPage';
import ViewAdmissionsPage from './pages/admin/admission/ViewAdmissionsPage';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageTeachersPage from './pages/admin/ManageTeachersPage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import ManageExamsPage from './pages/admin/ManageExamsPage';
import ManageBooksPage from './pages/admin/library/ManageBooksPage';
import ManageLoansPage from './pages/admin/library/ManageLoansPage';
import ManageFeeStructuresPage from './pages/admin/finance/ManageFeeStructuresPage';
import GenerateInvoicesPage from './pages/admin/finance/GenerateInvoicesPage';
import ManageInventoryPage from './pages/admin/inventory/ManageInventoryPage';
import ViewOrdersPage from './pages/admin/ViewOrdersPage';
import BrowseBooksPage from './pages/admin/library/BrowseBooksPage';
import MyLoansPage from './pages/admin/library/MyLoansPage';
import ManageAnnouncementsPage from './pages/admin/ManageAnnouncementsPage';

function App() {
  return (
    <>
      {/* 2. Add the Toaster component for sitewide notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#28a745',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#e74c3c',
              color: 'white',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/staff-register" element={<StaffRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Routes for ALL Authenticated Users */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/id-card" element={<IDCardPage />} />
            <Route path="/library" element={<BrowseBooksPage />} />
            <Route path="/my-loans" element={<MyLoansPage />} />
            <Route path="/order/:orderId" element={<OrderInvoicePage />} />

            {/* Student-Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/my-attendance" element={<MyAttendancePage />} />
              <Route path="/my-results" element={<MyResultsPage />} />
              <Route path="/my-invoices" element={<MyInvoicesPage />} />
              <Route path="/admit-card-generator" element={<AdmitCardPage />} />
              <Route path="/stationary-store" element={<StationaryStorePage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
            </Route>

            {/* Teacher-Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path="/teacher/attendance" element={<MarkAttendancePage />} />
              <Route path="/teacher/marks" element={<EnterMarksPage />} />
            </Route>
            
            {/* Admin-Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_ADMISSION']} />}>
              <Route path="/admin/admissions" element={<ViewAdmissionsPage />} />
              <Route path="/admin/admission/new" element={<NewAdmissionPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_LIBRARY']} />}>
              <Route path="/admin/library/books" element={<ManageBooksPage />} />
              <Route path="/admin/library/loans" element={<ManageLoansPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_FINANCE']} />}>
              <Route path="/admin/finance/structures" element={<ManageFeeStructuresPage />} />
              <Route path="/admin/finance/invoices/generate" element={<GenerateInvoicesPage />} />
              <Route path="/admin/orders" element={<ViewOrdersPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/students" element={<ManageStudentsPage />} />
              <Route path="/admin/teachers" element={<ManageTeachersPage />} />
              <Route path="/admin/courses" element={<ManageCoursesPage />} />
              <Route path="/admin/exams" element={<ManageExamsPage />} />
              <Route path="/admin/inventory" element={<ManageInventoryPage />} />
              <Route path="/admin/announcements" element={<ManageAnnouncementsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;