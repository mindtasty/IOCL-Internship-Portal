// Admin/Logs.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Timeline from '../../components/Timeline';
import { History, RefreshCw } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="System Audit Logs" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Portal Transaction Audit</h3>
                  <p className="text-[10px] text-slate-500">Track and review all application reviews, updates, and status transitions</p>
                </div>
              </div>

              <button
                onClick={fetchLogs}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Logs
              </button>
            </div>

            <div className="glass-panel border-slate-900 rounded-3xl p-6">
              {loading ? (
                <div className="py-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Timeline logs={logs} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
