// Mentor/Overview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { Users, Mail, Building, Calendar, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

export default function MentorOverview() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedInterns = async () => {
      try {
        const response = await api.get('/applications');
        setInterns(response.data.applications);
      } catch (error) {
        console.error('Failed to load assigned interns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedInterns();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">My Assigned Interns</h2>
            <p className="text-xs text-slate-500">Record attendance, review weekly learning reports, and submit evaluations</p>
          </div>
        </div>
        
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          Total Interns: <span className="text-accent-400 font-bold">{interns.length}</span>
        </div>
      </div>

      {/* Intern Roster Cards Grid */}
      {interns.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <h4 className="font-bold text-slate-300 text-sm">No Interns Assigned</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            You will be automatically notified here when a department HOD assigns you as a mentor to a student.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {interns.map((intern) => (
            <div 
              key={intern.id} 
              className="glass-panel border-slate-900 rounded-2xl p-5 card-hover shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Profile header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-600 text-sm">
                      {intern.first_name} {intern.last_name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      {intern.department_code} Department
                    </p>
                  </div>
                  <StatusBadge status={intern.status} />
                </div>

                {/* Intern email */}
                <div className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-900">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span className='text-slate-700'>{intern.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-semibold text-slate-700">{intern.company_name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span className='text-slate-700'>
                      {new Date(intern.start_date).toLocaleDateString()} - {new Date(intern.end_date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/internship/intern/${intern.id}`)}
                className="w-full mt-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 hover:text-white transition-all"
              >
                Supervise Intern <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
