// Staff/Overview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function StaffOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStaffOverview = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStaffOverview();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Set description and tasks based on user role
  const getRoleConfig = () => {
    switch (user?.role) {
      case 'HR':
        return {
          header: 'Human Resources Dashboard',
          sub: 'Review new application files, check NOC codes, and forward validated folders to HOD department desks.',
          actionLabel: 'Open Applications Backlog',
          actionUrl: '/applications',
        };
      case 'HOD':
        return {
          header: 'Department Head Dashboard',
          sub: 'Approve department internship requests and assign faculty mentors to validated applicants.',
          actionLabel: 'Open Department Requests',
          actionUrl: '/applications',
        };
      case 'L&D':
        return {
          header: 'L&D Admin Dashboard',
          sub: 'Inspect final approved packages, issue official start notifications, and activate student internships.',
          actionLabel: 'Open L&D Queue',
          actionUrl: '/applications',
        };
      default:
        return {
          header: 'Staff Portal',
          sub: 'Review applications and perform internship management tasks.',
          actionLabel: 'View Applications',
          actionUrl: '/applications',
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Role Banner Card */}
      <div className="glass-panel border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent-500/10 text-slate-600 border border-accent-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">{config.header}</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{config.sub}</p>
        </div>

        <button
          onClick={() => navigate(config.actionUrl)}
          className="px-5 py-3 rounded-xl gradient-brand text-xs font-semibold text-white inline-flex items-center gap-2 hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-accent-500/10 transition-all shrink-0"
        >
          {config.actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <StatCard
            title="Active Internships"
            value={stats.activeInterns}
            icon={Briefcase}
            colorClass="violet"
            description="Students currently in industry"
          />
          <StatCard
            title="Pending Actions"
            value={stats.pendingApplications}
            icon={Clock}
            colorClass="amber"
            description="Awaiting staff approval"
          />
          <StatCard
            title="Completed Interns"
            value={stats.completedInternships}
            icon={CheckCircle}
            colorClass="emerald"
            description="Internships fully closed"
          />
          {user?.role === 'HOD' ? (
            <StatCard
              title="Department Mentors"
              value={stats.totalMentors}
              icon={Users}
              colorClass="cyan"
              description="Assigned supervisors"
            />
          ) : (
            <StatCard
              title="Total Submissions"
              value={stats.totalApplications}
              icon={FileText}
              colorClass="blue"
              description="Total records filed"
            />
          )}
        </div>
      )}

      {/* Guide Box */}
      <div className="glass-panel border-slate-900 rounded-3xl p-6">
        <h3 className="font-bold text-sm text-slate-700 mb-3.5 flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-slate-500" />
          Internship Workflow Stages Reference
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900/60 space-y-1.5">
            <span className="font-extrabold text-[10px] text-accent-500 uppercase tracking-widest">Stage 1</span>
            <h5 className="font-bold text-slate-700">Student Submission</h5>
            <p className="text-[10px] text-slate-600 leading-relaxed">Student uploads Resume, NOC, and details.</p>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900/60 space-y-1.5">
            <span className="font-extrabold text-[10px] text-accent-500 uppercase tracking-widest">Stage 2</span>
            <h5 className="font-bold text-slate-700">HR Review</h5>
            <p className="text-[10px] text-slate-600 leading-relaxed">HR checks documents, requests corrections if needed, and forwards to HOD.</p>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900/60 space-y-1.5">
            <span className="font-extrabold text-[10px] text-accent-500 uppercase tracking-widest">Stage 3</span>
            <h5 className="font-bold text-slate-700">HOD Approval</h5>
            <p className="text-[10px] text-slate-600 leading-relaxed">HOD validates the academic match and assigns a Mentor.</p>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900/60 space-y-1.5">
            <span className="font-extrabold text-[10px] text-accent-500 uppercase tracking-widest">Stage 4</span>
            <h5 className="font-bold text-slate-700">L&D Activation</h5>
            <p className="text-[10px] text-slate-600 leading-relaxed">L&D performs final audit, activates the internship, and starts tracking.</p>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900/60 space-y-1.5">
            <span className="font-extrabold text-[10px] text-accent-500 uppercase tracking-widest">Stage 5</span>
            <h5 className="font-bold text-slate-700">Completion</h5>
            <p className="text-[10px] text-slate-600 leading-relaxed">Mentor evaluates, L&D/HR uploads certificate, and closes file.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
