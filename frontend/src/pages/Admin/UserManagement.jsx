// Admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Users, UserPlus, ShieldAlert, CheckCircle, Edit, Power, RefreshCw, KeyRound, X, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [showModal, setShowModal] = useState(false); // 'create', 'edit', 'reset' or false
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/departments')
      ]);
      setUsers(usersRes.data.users);
      setDepartments(deptRes.data.departments);
      
      // Fixed lookup mapping for roles seeded in DB
      setRoles([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Student' },
        { id: 3, name: 'HR' },
        { id: 4, name: 'HOD' },
        { id: 5, name: 'Mentor' },
        { id: 6, name: 'L&D' }
      ]);
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setDeptId('');
    setPhone('');
    setError('');
    setSuccess('');
    setShowModal('create');
  };

  const openEditModal = (userItem) => {
    setSelectedUser(userItem);
    setFirstName(userItem.first_name);
    setLastName(userItem.last_name);
    setEmail(userItem.email);
    setRoleId(userItem.role_id);
    setDeptId(userItem.department_id || '');
    setPhone(userItem.phone || '');
    setStatus(userItem.status);
    setError('');
    setSuccess('');
    setShowModal('edit');
  };

  const openResetModal = (userItem) => {
    setSelectedUser(userItem);
    setPassword('');
    setError('');
    setSuccess('');
    setShowModal('reset');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/users', {
        email,
        password,
        role_id: parseInt(roleId),
        first_name: firstName,
        last_name: lastName,
        department_id: deptId ? parseInt(deptId) : null,
        phone
      });
      setSuccess('User created successfully!');
      setTimeout(() => {
        setShowModal(false);
        loadData();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        first_name: firstName,
        last_name: lastName,
        role_id: parseInt(roleId),
        department_id: deptId ? parseInt(deptId) : null,
        phone,
        status
      });
      setSuccess('User account updated successfully!');
      setTimeout(() => {
        setShowModal(false);
        loadData();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        password
      });
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (userItem) => {
    const nextStatus = userItem.status === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/admin/users/${userItem.id}`, {
        status: nextStatus
      });
      loadData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDeleteUser = async (userItem) => {
  if (!window.confirm(`Permanently delete ${userItem.first_name} ${userItem.last_name}? This cannot be undone.`)) return;
  try {
    await api.delete(`/admin/users/${userItem.id}`);
    loadData();
  } catch (err) {
    alert(err.message || 'Failed to delete user.');
  }
};

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="User Directory Console" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">System Users Accounts</h3>
                  <p className="text-[10px] text-slate-500">Configure administrative, faculty, and student portals</p>
                </div>
              </div>

              <button
                onClick={openCreateModal}
                className="px-4 py-2.5 rounded-xl gradient-brand text-xs font-semibold text-white flex items-center gap-1.5 hover:brightness-110 shadow-lg"
              >
                <UserPlus className="w-4 h-4" /> Add Accounts
              </button>
            </div>

            {/* Users table */}
            <div className="glass-panel border-slate-900 rounded-3xl p-6 overflow-hidden">
              {loading ? (
                <div className="py-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-400">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 text-left">Name</th>
                        <th className="py-3 text-left">Email Address</th>
                        <th className="py-3 text-left">Role Type</th>
                        <th className="py-3 text-left">Department</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 font-bold text-slate-200">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="py-4 font-semibold text-slate-300">{u.email}</td>
                          <td className="py-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                              {u.role_name}
                            </span>
                          </td>
                          <td className="py-4 text-slate-500">{u.department_name || '—'}</td>
                          <td className="py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${
                              u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openResetModal(u)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(u)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                u.status === 'active' 
                                  ? 'bg-slate-900 border-slate-800 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20' 
                                  : 'bg-slate-900 border-slate-800 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                              }`}
                              title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg border bg-slate-900 border-slate-800 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MODALS DRAWERS */}
            {showModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-950 border border-slate-900 rounded-3xl p-6 relative animate-slide-up shadow-2xl space-y-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-bold text-slate-200 text-sm">
                    {showModal === 'create' ? 'Create User Account' : showModal === 'edit' ? 'Edit User Details' : 'Reset Password'}
                  </h3>

                  {error && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* CREATE OR EDIT FORM */}
                  {(showModal === 'create' || showModal === 'edit') && (
                    <form onSubmit={showModal === 'create' ? handleCreateUser : handleEditUser} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">First Name *</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Last Name *</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            required
                          />
                        </div>
                      </div>

                      {showModal === 'create' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Email *</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Choose Password *</label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Role Type *</label>
                          <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                            required
                          >
                            <option value="">Select Role</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Department (linked option)</label>
                          <select
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                          >
                            <option value="">None / Administrative</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Contact Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 rounded-xl gradient-brand text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {submitting ? 'Processing...' : showModal === 'create' ? 'Add Account' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* RESET PASSWORD FORM */}
                  {showModal === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <p className="text-[11px] text-slate-500">
                        Resetting password for <span className="font-semibold text-slate-300">{selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})</span>.
                      </p>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">New Password *</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 rounded-xl gradient-brand text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Reset Password
                        </button>
                      </div>
                    </form>
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
