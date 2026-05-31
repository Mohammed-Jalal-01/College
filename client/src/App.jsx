import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import ActivitiesPage from './pages/public/ActivitiesPage'
import DepartmentsPage from './pages/public/DepartmentsPage'
import SchedulesPage from './pages/public/SchedulesPage'
import MaterialsPage from './pages/public/MaterialsPage'
import GradesPage from './pages/public/GradesPage'
import UserProfilePage from './pages/public/UserProfilePage'
import AccountTypeSelection from './pages/auth/AccountTypeSelection'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import StudentInfoPage from './pages/auth/StudentInfoPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import NewsManagement from './pages/admin/NewsManagement'
import ActivitiesManagement from './pages/admin/ActivitiesManagement'
import DepartmentsManagement from './pages/admin/DepartmentsManagement'
import AboutCollegeManagement from './pages/admin/AboutCollegeManagement'
import SchedulesManagement from './pages/admin/SchedulesManagement'
import MaterialsManagement from './pages/admin/MaterialsManagement'
import UserManagement from './pages/admin/UserManagement'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route 
            path="grades" 
            element={
              <ProtectedRoute>
                <GradesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="user/:displayId" 
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="/auth">
          <Route index element={<Navigate to="/auth/account-type" replace />} />
          <Route path="account-type" element={<AccountTypeSelection />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="student-info" element={<StudentInfoPage />} />
        </Route>

        <Route path="/admin">
          <Route 
            index 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="news" 
            element={
              <ProtectedRoute requireAdmin>
                <NewsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="activities" 
            element={
              <ProtectedRoute requireAdmin>
                <ActivitiesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="departments" 
            element={
              <ProtectedRoute requireAdmin>
                <DepartmentsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="about-college" 
            element={
              <ProtectedRoute requireAdmin>
                <AboutCollegeManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="schedules" 
            element={
              <ProtectedRoute requireAdmin>
                <SchedulesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="materials" 
            element={
              <ProtectedRoute requireAdmin>
                <MaterialsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="users" 
            element={
              <ProtectedRoute requireSuperAdmin>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
