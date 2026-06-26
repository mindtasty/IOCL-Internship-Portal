// ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) {
      return setError('Please provide email and the new password.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email, newPassword);
      setSuccess('Your password has been reset successfully! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err || 'Failed to reset password. Verify email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative bg-slate-950 overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10 animate-fade-in">
        <button
          onClick={() => navigate('/login')}
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-accent-600/10 text-accent-500 border border-accent-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-white font-display tracking-wider uppercase">
            Intern<span className="text-accent-500">Flow</span>
          </span>
        </div>

        <h3 className="text-xl font-bold text-center text-slate-100 font-display">Reset Password</h3>
        <p className="text-xs text-center text-slate-500 mt-1">Enter your registered email and choose a new password</p>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-brand text-sm font-semibold text-white shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Processing Reset...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
