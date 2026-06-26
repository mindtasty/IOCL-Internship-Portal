// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ShieldAlert, LogIn } from 'lucide-react';
import ioclLogo from '../assets/iocl.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show session expired alerts if redirected
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setError('Your login session has expired. Please sign in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all credentials fields.');
    }
    
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Failed to authenticate. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick credentials injector for examiners
  const injectDemoCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password');
    setError('');
  };

  const demoAccounts = [
    { roleName: 'Admin', email: 'admin@portal.com' },
    { roleName: 'Student', email: 'student@portal.com' },
    { roleName: 'HR', email: 'hr@portal.com' },
    { roleName: 'HOD', email: 'hod@portal.com' },
    { roleName: 'Mentor', email: 'mentor@portal.com' },
    { roleName: 'L&D', email: 'ld@portal.com' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative bg-slate-950 overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img
  src={ioclLogo}
  alt="IOCL"
  className="w-25 h-25 object-contain"
/>
          <span className="font-extrabold text-2xl text-center text-white font-display tracking-wider uppercase">
            IOCL Internship Portal
          </span>
        </div>

        <h3 className="text-xl text-white font-bold text-center text-slate-100 font-display">Welcome Back</h3>
        <p className="text-xs text-center text-slate-800 mt-1">Sign in to access your portal dashboard</p>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-slate-600 hover:text-accent-300 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-brand text-sm font-semibold text-white shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4.5 h-4.5" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-600 mt-6">
          New Student?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-accent-400 hover:text-accent-800 font-bold transition-colors"
          >
            Create Account
          </button>
        </p>

        {/* Quick Demo Helper Section */}
        <div className="mt-8 pt-6 border-t border-slate-900">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3.5">
            Quick-Fill Examiner Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc, index) => (
              <button
                key={index}
                type="button"
                onClick={() => injectDemoCredentials(acc.email)}
                className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all text-center truncate"
              >
                {acc.roleName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
