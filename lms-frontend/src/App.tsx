import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import UserManagementPage from './pages/UserManagementPage';
import LibraryPage from './pages/LibraryPage';
import IssueBookPage from './pages/IssueBookPage';
import ReturnBookPage from './pages/ReturnBookPage';
import MyLoansPage from './pages/MyLoansPage';
import CourseManagementPage from './pages/CourseManagementPage';
import FeeManagementPage from './pages/FeeManagementPage';
import UserFeeDetailsPage from './pages/UserFeeDetailsPage';
import ExamFormPage from './pages/ExamFormPage';
import AdmitCardPage from './pages/AdmitCardPage';
import IDCardPage from './pages/IDCardPage';
import MyGradesPage from './pages/MyGradesPage';
import StationeryPage from './pages/StationeryPage';
import UniformPage from './pages/UniformPage';
import ManageInventoryPage from './pages/ManageInventoryPage';
import AdmissionPage from './pages/AdmissionPage';
import ViewAdmissionsPage from './pages/ViewAdmissionsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admission" element={<AdmissionPage />} />
      <Route path="/" element={<LoginPage />} />

      {/* Protected Routes Parent Layout */}
      <Route 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Routes for ALL authenticated users */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="my-loans" element={<MyLoansPage />} />
        <Route path="exam-form" element={<ExamFormPage />} />
        <Route path="admit-card" element={<AdmitCardPage />} />
        <Route path="id-card" element={<IDCardPage />} />
        <Route path="my-grades" element={<MyGradesPage />} />
        <Route path="stationery" element={<StationeryPage />} />
        <Route path="uniforms" element={<UniformPage />} />
        
        {/* General Admin-Only Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="users" element={<UserManagementPage />} />
          <Route path="courses" element={<CourseManagementPage />} />
          <Route path="fees" element={<FeeManagementPage />} />
          <Route path="fees/user/:userId" element={<UserFeeDetailsPage />} />
        </Route>
        
        {/* Library Admin-Only Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN_LIBRARY', 'SUPER_ADMIN']} />}>
          <Route path="issue-book" element={<IssueBookPage />} />
          <Route path="return-book" element={<ReturnBookPage />} />
        </Route>
        
        {/* Inventory Admin-Only Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN_STATIONERY', 'ADMIN_UNIFORMS', 'SUPER_ADMIN']} />}>
          <Route path="manage-inventory" element={<ManageInventoryPage />} />
        </Route>

        {/* Admission Admin-Only Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN_ADMISSION', 'SUPER_ADMIN']} />}>
          <Route path="view-admissions" element={<ViewAdmissionsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;