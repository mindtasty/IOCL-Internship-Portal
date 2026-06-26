// Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Sub-overview pages
import AdminOverview from './Admin/Overview';
import StudentOverview from './Student/Overview';
import StaffOverview from './Staff/Overview';
import MentorOverview from './Mentor/Overview';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Restoring Session...</span>
        </div>
      </div>
    );
  }

  // Resolve sub-panel based on user role
  const renderRoleOverview = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminOverview />;
      case 'Student':
        return <StudentOverview />;
      case 'HR':
      case 'L&D':
      case 'HOD':
        return <StaffOverview />;
      case 'Mentor':
        return <MentorOverview />;
      default:
        return (
          <div className="p-8 text-center text-rose-400 border border-dashed border-rose-500/20 rounded-2xl bg-rose-500/5">
            Role "{user?.role}" is unrecognized or unauthorized.
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'Admin':
        return 'Global Systems Control Panel';
      case 'Student':
        return 'Student Internship Center';
      case 'HR':
        return 'HR Management Portal';
      case 'L&D':
        return 'L&D Administration Hub';
      case 'HOD':
        return 'Head of Department Desk';
      case 'Mentor':
        return 'Mentor Supervision Desk';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* 1. Left Sidebar menu */}
      <Sidebar />

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={getPageTitle()} />

        {/* 3. Dashboard Scrollable Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderRoleOverview()}
          </div>
        </main>
      </div>
    </div>
  );
}
