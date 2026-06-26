// Student/TimelineView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Timeline from '../../components/Timeline';
import StatusBadge from '../../components/StatusBadge';
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function TimelineView() {
  const [application, setApplication] = useState(null);
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  const loadTimelineDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications');
      const apps = response.data.applications;
      if (apps.length > 0) {
        const app = apps[0];
        setApplication(app);
        const detailRes = await api.get(`/applications/${app.id}`);
        setLogs(detailRes.data.activityLogs);
      }
    } catch (error) {
      console.error('Failed to load tracking timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTimelineDetails(); }, []);

  return (
    <div className="min-h-screen flex bg-[#f4f7fc] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Timeline Tracker" />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Overview
              </button>

              <button
                onClick={loadTimelineDetails}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-24 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !application ? (
              <div className="text-center py-16 border border-dashed border-slate-700 rounded-3xl bg-white">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h4 className="font-bold text-slate-200 text-sm">No Application Found</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  You must start an application before you can track approval progress.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-slide-up">

                {/* Status card */}
                <div className="glass-panel rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Internship Stage</span>
                    <h3 className="text-lg font-bold text-slate-700 mt-0.5">{application.internship_title}</h3>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                {/* Audit trail */}
                <div className="glass-panel rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-500 border-b border-slate-700 pb-2.5">
                    Lifecycle Audit History
                  </h3>
                  <Timeline logs={logs} />
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}