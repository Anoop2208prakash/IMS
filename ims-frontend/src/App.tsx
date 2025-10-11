// src/App.tsx
import { Routes, Route } from 'react-router-dom';
// --- Public Page Imports ---
import LoginPage from './pages/LoginPage';
import AdmissionPage from './pages/AdmissionPage';
import StaffRegisterPage from './pages/StaffRegisterPage';
// --- Layout and Auth Imports ---
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
// --- Shared Page Imports ---
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
// --- Student Page Imports ---
import MyCoursesPage from './pages/MyCoursesPage';
// --- Teacher Page Imports ---
import MyClassesPage from './pages/teacher/MyClassesPage';
// --- Admin Page Imports ---
import ViewAdmissionsPage from './pages/admin/ViewAdmissionsPage';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageTeachersPage from './pages/admin/ManageTeachersPage';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import IDCardPage from './pages/IDCardPage';
import ManageBooksPage from './pages/admin/library/ManageBooksPage';
import BrowseBooksPage from './pages/admin/library/BrowseBooksPage';
import ManageLoansPage from './pages/admin/library/ManageLoansPage';
import MyLoansPage from './pages/admin/library/MyLoansPage';
import MarkAttendancePage from './pages/teacher/MarkAttendancePage';
import MyAttendancePage from './pages/student/MyAttendancePage';
import ManageExamsPage from './pages/admin/ManageExamsPage';
import EnterMarksPage from './pages/teacher/EnterMarksPage';
import MyResultsPage from './pages/student/MyResultsPage';
import ManageFeeStructuresPage from './pages/admin/finance/ManageFeeStructuresPage';
import GenerateInvoicesPage from './pages/admin/finance/GenerateInvoicesPage';
import MyInvoicesPage from './pages/student/MyInvoicesPage';
import AdmitCardPage from './pages/student/AdmitCardPage';
import ManageInventoryPage from './pages/admin/inventory/ManageInventoryPage';
import StationaryStorePage from './pages/student/StationaryStorePage';
import OrderInvoicePage from './pages/student/OrderInvoicePage';
import MyOrdersPage from './pages/student/MyOrdersPage';
import ViewOrdersPage from './pages/admin/ViewOrdersPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admission" element={<AdmissionPage />} />
      <Route path="/staff-register" element={<StaffRegisterPage />} />

      {/* Routes for ALL Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
            <Route path="/order/:orderId" element={<OrderInvoicePage   />} /> 
          </Route>  

          {/* Teacher-Only Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher/my-classes" element={<MyClassesPage />} />
            <Route path="/teacher/attendance" element={<MarkAttendancePage />} />
            <Route path="/teacher/marks" element={<EnterMarksPage />} /> 
          </Route>
          
          {/* Admin-Only Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ADMIN_ADMISSION']} />}>
            <Route path="/admin/admissions" element={<ViewAdmissionsPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN','ADMIN_LIBRARY']} />}>
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
            <Route path="/admin/orders" element={<ViewOrdersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;