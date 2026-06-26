// Staff/ApplicationsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { Search, Filter, RefreshCw, FileText, ArrowRight, Layers } from 'lucide-react';

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Search/Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadBacklogData = async () => {
    setLoading(true);
    try {
      const [appRes, deptRes] = await Promise.all([
        api.get('/applications'),
        api.get('/admin/departments')
      ]);
      setApplications(appRes.data.applications);
      setDepartments(deptRes.data.departments);
    } catch (error) {
      console.error('Failed to load application backlog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBacklogData();
  }, []);

  const triggerSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get('/applications', {
        params: {
          search,
          status: statusFilter,
          department_id: deptFilter
        }
      });
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to filter applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDeptFilter('');
    loadBacklogData();
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Applications Log Registry" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Search and filter bar */}
            <form onSubmit={triggerSearch} className="glass-panel border-slate-900 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student, company, or title..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl glass-input text-xs bg-slate-900"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.code}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl glass-input text-xs bg-slate-900"
                >
                  <option value="">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under HR Review">Under HR Review</option>
                  <option value="Modification Requested">Modification Requested</option>
                  <option value="Resubmitted">Resubmitted</option>
                  <option value="Forwarded To HOD">Forwarded To HOD</option>
                  <option value="Under HOD Review">Under HOD Review</option>
                  <option value="HOD Approved">HOD Approved</option>
                  <option value="Forwarded To L&D">Forwarded To L&D</option>
                  <option value="Internship Active">Active</option>
                  <option value="Internship Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl gradient-brand text-xs font-semibold text-white transition-all hover:brightness-110"
                >
                  Filter
                </button>
                
                <button
                  type="button"
                  onClick={clearFilters}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Reset Filter"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Backlog Logs Table */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6 overflow-hidden">
              <h3 className="font-bold text-sm text-slate-500 border-b border-slate-900 pb-4 mb-4 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-slate-500" />
                Applications Queue Backlog
              </h3>

              {loading ? (
                <div className="py-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-10 h-10 mx-auto text-slate-800 mb-2" />
                  <p className="text-xs text-slate-500">No applications matching current filters found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-400 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 text-left">Student Name</th>
                        <th className="py-3 text-left">Department</th>
                        <th className="py-3 text-left">Company details</th>
                        <th className="py-3 text-left">Duration Dates</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4">
                            <span className="font-bold text-slate-600 block">{app.first_name} {app.last_name}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">{app.email}</span>
                          </td>
                          <td className="py-4 font-semibold text-slate-600">
                            {app.department_code}
                          </td>
                          <td className="py-4">
                            <span className="font-semibold text-slate-600 block">{app.internship_title}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">at {app.company_name}</span>
                          </td>
                          <td className="py-4 text-slate-500">
                            {new Date(app.start_date).toLocaleDateString()} - {new Date(app.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => navigate(`/applications/${app.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all inline-flex items-center gap-1 font-semibold"
                            >
                              Review <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
