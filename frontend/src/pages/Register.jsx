// Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Mail, Lock, User, Phone, Briefcase, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ioclLogo from '../assets/iocl.svg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [deptId, setDeptId] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load departments list on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await api.get('/admin/departments');
        setDepartments(response.data.departments);
      } catch (err) {
        console.warn('Failed to load departments, loading fallback list:', err.message);
        // Fallback list matching defaults seeded in schema.sql
        setDepartments([
          { id: 1, name: 'Human Resources', code: 'HR' },
          { id: 2, name: 'Learning & Development', code: 'L&D' },
          { id: 3, name: 'Information Systems', code: 'IS' },
          { id: 4, name: 'Finance', code: 'FIN' },
          { id: 5, name: 'Operations', code: 'OPS' },
          { id: 6, name: 'Marketing', code: 'MKT' },
        ]);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !deptId) {
      return setError('Please fill in all required fields.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(email, password, firstName, lastName, deptId, phone);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err || 'Failed to create student account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative bg-slate-950 overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Logo banner */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img
  src={ioclLogo}
  alt="IOCL"
  className="w-25 h-25 object-contain"
/>
          <span className="font-extrabold text-2xl text-white font-display tracking-wider uppercase">
            IOCL Internship Portal
          </span>
        </div>

        <h3 className="text-xl font-bold text-center text-slate-500 font-display">Student Registration</h3>
        <p className="text-xs text-center text-slate-500 mt-1">Register your profile to apply for college internships</p>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@college.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Briefcase className="w-4.5 h-4.5" />
              </span>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none bg-slate-900/90"
                required
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose Password *</label>
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
            className="w-full mt-2 py-3.5 rounded-xl gradient-brand text-sm font-semibold text-white shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Profile'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-accent-400 hover:text-accent-300 font-bold transition-colors"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
}
