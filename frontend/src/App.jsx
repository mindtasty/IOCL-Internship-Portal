// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Layout & Dashboard
import Dashboard from './pages/Dashboard';

// Student Pages
import ApplicationForm from './pages/Student/ApplicationForm';
import TimelineView from './pages/Student/TimelineView';
import Attendance from './pages/Student/Attendance';
import Reports from './pages/Student/Reports';
import Completion from './pages/Student/Completion';

// Staff Pages
import ApplicationsList from './pages/Staff/ApplicationsList';
import ApplicationDetail from './pages/Staff/ApplicationDetail';

// Mentor Pages
import InternDetail from './pages/Mentor/InternDetail';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
import DepartmentManagement from './pages/Admin/DepartmentManagement';
import MentorManagement from './pages/Admin/MentorManagement';
import Logs from './pages/Admin/Logs';

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected General Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Student Routes */}
          <Route 
            path="/application/apply" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <ApplicationForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/application/track" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <TimelineView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/internship/attendance" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Attendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/internship/reports" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/internship/completion" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Completion />
              </ProtectedRoute>
            } 
          />

          {/* Protected Staff Shared Routes (HR, HOD, L&D, Admin) */}
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'HOD', 'L&D', 'Admin']}>
                <ApplicationsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applications/:id" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'HOD', 'L&D', 'Admin']}>
                <ApplicationDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentors" 
            element={
              <ProtectedRoute allowedRoles={['HOD', 'Admin', 'HR']}>
                <MentorManagement />
              </ProtectedRoute>
            } 
          />

          {/* Protected Mentor Specific Routes */}
          <Route 
            path="/internship/intern/:id" 
            element={
              <ProtectedRoute allowedRoles={['Mentor', 'Admin']}>
                <InternDetail />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Specific Routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/departments" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DepartmentManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/mentors" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <MentorManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Logs />
              </ProtectedRoute>
            } 
          />

          {/* Default Wildcard Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
