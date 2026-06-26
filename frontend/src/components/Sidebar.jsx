// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ioclLogo from '../assets/iocl.svg';
import { 
  LayoutDashboard, 
  FileEdit, 
  Clock, 
  CalendarCheck, 
  BookOpen, 
  Award, 
  FileSpreadsheet, 
  Users, 
  FolderGit2, 
  UserCheck, 
  History,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  
  if (!user) return null;

  // Enumerate navigation lists based on role
  const getNavLinks = () => {
    switch (user.role) {
      case 'Student':
        return [
          { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { path: '/application/apply', label: 'Apply Internship', icon: FileEdit },
          { path: '/application/track', label: 'Track Application', icon: Clock },
          { path: '/internship/attendance', label: 'Attendance Sheet', icon: CalendarCheck },
          { path: '/internship/reports', label: 'Weekly Updates', icon: BookOpen },
          { path: '/internship/completion', label: 'Certificates & Summary', icon: Award },
        ];
      case 'HR':
      case 'L&D':
        return [
          { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { path: '/applications', label: 'Applications Backlog', icon: FileSpreadsheet },
        ];
      case 'HOD':
        return [
          { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { path: '/applications', label: 'Department Backlog', icon: FileSpreadsheet },
          { path: '/mentors', label: 'Mentor Database', icon: UserCheck },
        ];
      case 'Mentor':
        return [
          { path: '/dashboard', label: 'My Interns', icon: Users },
        ];
      case 'Admin':
        return [
          { path: '/dashboard', label: 'Analytics Panel', icon: LayoutDashboard },
          { path: '/admin/users', label: 'User Management', icon: Users },
          { path: '/admin/departments', label: 'Departments', icon: FolderGit2 },
          { path: '/admin/mentors', label: 'Mentors list', icon: UserCheck },
          { path: '/applications', label: 'All Applications', icon: FileSpreadsheet },
          { path: '/admin/logs', label: 'Global Audit Logs', icon: History },
        ];
      default:
        return [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavLinks();

  return (
    <aside className="w-64 border-r border-[#1a3a6b] bg-[#0d2352] flex flex-col h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="min-h-16 flex items-center px-6 gap-2.5 border-b border-white/10 py-3">
        <img
  src={ioclLogo}
  alt="IOCL"
  className="w-15 h-15 object-contain shrink-0"
/>
        <span className="font-extrabold text-sm text-white font-display uppercase tracking-wider leading-tight">
          IOCL Internship Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
                  isActive
                    ? 'gradient-brand text-white border-orange-400/30 shadow-lg shadow-orange-500/20'
                    : 'text-white/60 border-transparent hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}
