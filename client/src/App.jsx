import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout & Protected Route
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Loader from './components/common/Loader';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ComplaintsList from './pages/student/ComplaintsList';
import NewComplaint from './pages/student/NewComplaint';
import BookAppointment from './pages/student/BookAppointment';
import MyAppointments from './pages/student/MyAppointments';
import SkillExchange from './pages/student/SkillExchange';
import HelpRequestsBoard from './pages/student/HelpRequestsBoard';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import SlotManager from './pages/faculty/SlotManager';
import FacultyAppointments from './pages/faculty/FacultyAppointments';
import AssignedComplaints from './pages/faculty/AssignedComplaints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintManager from './pages/admin/ComplaintManager';
import EventManager from './pages/admin/EventManager';
import AnnouncementManager from './pages/admin/AnnouncementManager';
import DepartmentManager from './pages/admin/DepartmentManager';
import UserManager from './pages/admin/UserManager';
import FeedbackManager from './pages/admin/FeedbackManager';

// Shared Pages
import EventsCatalog from './pages/student/EventsCatalog';
import LostFoundPage from './pages/shared/LostFoundPage';
import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import ProfilePage from './pages/shared/ProfilePage';

// Root redirect component based on authenticated role
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Bootstrapping university platform..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root smart redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected dashboard layout wrapper */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ComplaintsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <NewComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/appointments/book"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/appointments"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SkillExchange />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills/requests"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <HelpRequestsBoard />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/slots"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <SlotManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/appointments"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/complaints"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <AssignedComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComplaintManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EventManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AnnouncementManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <FeedbackManager />
                  </ProtectedRoute>
                }
              />

              {/* Shared Campus Portals */}
              <Route path="/events" element={<EventsCatalog />} />
              <Route path="/lost-found" element={<LostFoundPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
