// Admin/DepartmentManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { FolderGit2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleRegisterDept = async (e) => {
    e.preventDefault();
    if (!name || !code) return setError('All fields are required.');
    
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/admin/departments', { name, code: code.toUpperCase() });
      setSuccess('Department registered successfully!');
      setName('');
      setCode('');
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to add department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Department Setup Console" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Form to create department */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-accent-500" />
                Add Department
              </h3>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleRegisterDept} className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Civil Engineering"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Abbreviation Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CIV"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl gradient-brand text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Registering...' : 'Register Department'}
                </button>
              </form>
            </div>

            {/* Right Column: Departments list */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <FolderGit2 className="w-4.5 h-4.5 text-accent-500" />
                Linked Divisions
              </h3>

              <div className="glass-panel border-slate-900 rounded-3xl p-6">
                {loading ? (
                  <div className="py-12 flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No departments registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-600 font-bold uppercase text-[10px]">
                          <th className="py-2.5 text-left">ID</th>
                          <th className="py-2.5 text-left">Code</th>
                          <th className="py-2.5 text-left">Department Name</th>
                          <th className="py-2.5 text-left">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {departments.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-900/10">
                            <td className="py-3 font-semibold text-slate-500">{d.id}</td>
                            <td className="py-3 font-bold text-slate-400">{d.code}</td>
                            <td className="py-3 text-slate-400 font-semibold">{d.name}</td>
                            <td className="py-3 text-slate-500">
                              {new Date(d.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
