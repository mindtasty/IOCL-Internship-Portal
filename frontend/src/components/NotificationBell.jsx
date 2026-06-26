// NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Bell, Check, MailOpen } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Long poll every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'Read' } : n))
      );
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => n.status === 'Unread');
    try {
      await Promise.all(unread.map((n) => api.put(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 rounded-lg hover:text-slate-100 hover:bg-slate-800/60 transition-all focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-800 glass-panel shadow-2xl z-50 animate-slide-up">
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
            <span className="font-semibold text-sm text-slate-600">Alert Center</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-slate-600 hover:text-slate-200 font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <MailOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No notification alerts
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.status === 'Unread' && markAsRead(notif.id)}
                  className={`p-3.5 text-left transition-colors cursor-pointer ${
                    notif.status === 'Unread'
                      ? 'bg-slate-600/30 hover:bg-slate-600/50'
                      : 'hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-600">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
