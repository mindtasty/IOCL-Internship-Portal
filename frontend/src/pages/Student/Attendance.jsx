// Student/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import { CalendarCheck, Percent, HelpCircle, ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function Attendance() {
  const [application, setApplication] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        const appRes = await api.get('/applications');
        const apps = appRes.data.applications;
        
        if (apps.length > 0) {
          const app = apps[0];
          setApplication(app);
          
          if (['Internship Active', 'Internship Completed'].includes(app.status)) {
            const attRes = await api.get(`/attendance/${app.id}`);
            setAttendance(attRes.data.summary);
            setLogs(attRes.data.logs);
          }
        }
      } catch (err) {
        console.error('Failed to load attendance logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceDetails();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Attendance Sheets" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-5xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Overview
            </button>

            {!application || !['Internship Active', 'Internship Completed'].includes(application.status) ? (
              <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10">
                <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                <h4 className="font-bold text-slate-300 text-sm">Attendance Inactive</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Daily attendance logs will become visible once your internship status becomes active.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-slide-up">
                {/* Attendance Summary Grid */}
                {attendance && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Attendance Score"
                      value={`${attendance.attendancePercentage}%`}
                      icon={Percent}
                      colorClass={attendance.attendancePercentage >= 80 ? 'emerald' : attendance.attendancePercentage >= 65 ? 'amber' : 'rose'}
                      description="Calculated attendance score"
                    />
                    <StatCard
                      title="Present Days"
                      value={attendance.presentDays}
                      icon={ArrowUpRight}
                      colorClass="emerald"
                      description="Days present at workplace"
                    />
                    <StatCard
                      title="Half Days"
                      value={attendance.halfDays}
                      icon={Minus}
                      colorClass="amber"
                      description="Evaluated half workdays"
                    />
                    <StatCard
                      title="Absent Days"
                      value={attendance.absentDays}
                      icon={ArrowDownRight}
                      colorClass="rose"
                      description="Unexcused leaves logged"
                    />
                  </div>
                )}

                {/* Attendance log lists */}
                <div className="glass-panel border-slate-900 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-700 border-b border-slate-800/80 pb-2.5">
                    Daily Mark Sheets
                  </h3>

                  {logs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">Your mentor hasn't marked any attendance logs yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-600 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 font-bold">
                            <th className="py-2.5 text-left">Date</th>
                            <th className="py-2.5 text-left">Status</th>
                            <th className="py-2.5 text-left">Supervisor Remarks</th>
                            <th className="py-2.5 text-left">Marked By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-900/10">
                              <td className="py-3 font-semibold text-slate-500">
                                {new Date(log.date).toLocaleDateString(undefined, {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'Present' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : log.status === 'Half Day' 
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-500">{log.remarks || '—'}</td>
                              <td className="py-3 font-medium text-slate-500">
                                {log.marked_by_first} {log.marked_by_last}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
