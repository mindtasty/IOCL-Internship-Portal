// Admin/Overview.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Timeline from '../../components/Timeline';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Award, 
  Users, 
  FolderGit2, 
  History,
  ShieldCheck
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/logs')
        ]);
        setStats(statsRes.data.stats);
        setLogs(logsRes.data.logs.slice(0, 5)); // Keep only latest 5 logs for overview dashboard
      } catch (error) {
        console.error('Failed to load admin overview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">System Analytics Console</h2>
          <p className="text-xs text-slate-500">Monitor system wide applications, departments, and audit logs</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={FileText}
            colorClass="blue"
            description="Submitted files in system"
          />
          <StatCard
            title="Pending Actions"
            value={stats.pendingApplications}
            icon={Clock}
            colorClass="amber"
            description="Applications awaiting reviews"
          />
          <StatCard
            title="Approved Applications"
            value={stats.approvedApplications}
            icon={CheckCircle}
            colorClass="cyan"
            description="Approved by HR/HOD/L&D"
          />
          <StatCard
            title="Rejected Logs"
            value={stats.rejectedApplications}
            icon={XCircle}
            colorClass="rose"
            description="Purged applications"
          />
          <StatCard
            title="Active Interns"
            value={stats.activeInterns}
            icon={Activity}
            colorClass="violet"
            description="Active working students"
          />
          <StatCard
            title="Completed Careers"
            value={stats.completedInternships}
            icon={Award}
            colorClass="emerald"
            description="Certificates distributed"
          />
          <StatCard
            title="Total Mentors"
            value={stats.totalMentors}
            icon={Users}
            colorClass="cyan"
            description="Assigned faculty supervisors"
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={FolderGit2}
            colorClass="blue"
            description="Linked academic divisions"
          />
        </div>
      )}

      {/* Split view: Quick Logs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-slate-500" />
              Latest System Events
            </h3>
          </div>
          
          <div className="bg-slate-900/10 rounded-2xl border border-slate-900 p-5">
            <Timeline logs={logs} />
          </div>
        </div>

        {/* Informative Help Guide Card */}
        <div className="glass-panel border-slate-800 rounded-2xl p-6 h-fit space-y-4">
          <h4 className="font-bold text-sm text-slate-600">System Overrides Info</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            As an Administrator, you have total access privileges to every module in the portal. 
            You can:
          </p>
          <ul className="text-xs text-slate-500 list-disc list-inside space-y-2">
            <li>Create or disable staff, mentors, and students.</li>
            <li>Configure new departments.</li>
            <li>Audit system transaction histories.</li>
            <li>Override states on specific student files.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
