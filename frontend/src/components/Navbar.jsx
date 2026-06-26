// Navbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ pageTitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#1a3a6b] bg-[#0d2352] backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">{pageTitle || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4.5">
        <NotificationBell />

        <span className="w-[1px] h-6 bg-white/20" />

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                {user.role}
              </p>
            </div>

            <div className="p-1 rounded-full bg-white/10 border border-white/20 text-white/70">
              <UserCircle className="w-6 h-6" />
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-white/50 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-all focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
