// Admin/MentorManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { UserCheck, ShieldCheck, Mail, Phone, BookOpen, Layers } from 'lucide-react';

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read active role details
  const localUser = JSON.parse(localStorage.getItem('user'));
  const userRole = localUser?.role || 'Admin';

  useEffect(() => {
    const fetchMentorsList = async () => {
      setLoading(true);
      try {
        const response = await api.get('/mentors');
        setMentors(response.data.mentors);
      } catch (err) {
        console.error('Failed to load mentors registry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorsList();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={userRole === 'HOD' ? 'Department Mentors Desk' : 'Faculty Mentors Console'} />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            
            {/* Header section */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Supervisor Directory</h3>
                <p className="text-[10px] text-slate-500">
                  {userRole === 'HOD' 
                    ? 'Track department mentors load and student assignments' 
                    : 'System wide directory of all internship faculty advisors'}
                </p>
              </div>
            </div>

            {/* Mentors grid */}
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-12 border border-slate-900 rounded-3xl bg-slate-900/10">
                <UserCheck className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">No mentors registered in department database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {mentors.map((m) => (
                  <div key={m.id} className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-600 text-sm">{m.first_name} {m.last_name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                            {m.department_code} Department
                          </span>
                        </div>
                        
                        <div className="px-2 py-0.5 bg-slate-900 rounded text-[9px] font-semibold text-slate-400 border border-slate-800 uppercase">
                          Faculty
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-900/60">
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-600" />
                          <span className='text-slate-700'>{m.email}</span>
                        </p>
                        {m.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span className='text-slate-700'>{m.phone}</span>
                          </p>
                        )}
                        {m.specialization && (
                          <p className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            <span className='text-slate-700'>Focus: {m.specialization}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Workload card */}
                    <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Active Supervisions:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          m.active_interns_count >= m.max_interns ? 'text-rose-400' : m.active_interns_count >= m.max_interns - 2 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {m.active_interns_count}
                        </span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-500">{m.max_interns} Max</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
