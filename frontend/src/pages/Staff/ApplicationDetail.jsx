// Staff/ApplicationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserCheck,
  Send,
  Upload
} from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const [appDetails, setAppDetails] = useState(null);
  const [mentors, setMentors] = useState([]);
  
  // Action state
  const [selectedMentor, setSelectedMentor] = useState('');
  const [actionRemarks, setActionRemarks] = useState('');
  const [docRemarks, setDocRemarks] = useState({}); // { docId: 'remarks' }
  const [flaggedDocs, setFlaggedDocs] = useState({}); // { docId: true/false }

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Certificate Upload (for HR/L&D completion)
  const [certificateFile, setCertificateFile] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const loadApplicationDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${id}`);
      setAppDetails(response.data);

      // If HOD or Admin reviews, load mentors from the department
      if (['HOD', 'Admin'].includes(user?.role)) {
        const mentorRes = await api.get(`/mentors?department_id=${response.data.application.department_id}`);
        setMentors(mentorRes.data.mentors);
      }
    } catch (error) {
      console.error('Failed to load application folder:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicationDetails();
  }, [id]);

  const handleStatusUpdate = async (nextStatus) => {
    setActionLoading(true);
    try {
      const payload = { status: nextStatus, remarks: actionRemarks };
      
      // If HR requested corrections, attach document specific remarks
      if (nextStatus === 'Modification Requested') {
        const documentRemarks = {};
        Object.keys(flaggedDocs).forEach(docId => {
          if (flaggedDocs[docId]) {
            documentRemarks[docId] = docRemarks[docId] || 'Document requires correction.';
          }
        });
        payload.documentRemarks = documentRemarks;
      }

      await api.put(`/applications/${id}/status`, payload);
      setActionRemarks('');
      setFlaggedDocs({});
      setDocRemarks({});
      loadApplicationDetails();
    } catch (error) {
      console.error('Status transition error:', error);
      alert(error.message || 'Failed to update application status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedMentor) return alert('Please select a mentor.');
    setActionLoading(true);
    try {
      await api.post(`/applications/${id}/assign-mentor`, { mentor_id: parseInt(selectedMentor) });
      setSelectedMentor('');
      loadApplicationDetails();
    } catch (error) {
      console.error('Mentor assignment error:', error);
      alert(error.message || 'Failed to assign mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!certificateFile) return alert('Please select a certificate file.');

    setActionLoading(true);
    const formData = new FormData();
    formData.append('certificate', certificateFile);

    try {
      await api.post(`/applications/${id}/certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCertificateFile(null);
      loadApplicationDetails();
    } catch (error) {
      console.error('Certificate upload error:', error);
      alert(error.message || 'Failed to upload certificate.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { application, documents, activityLogs, mentor, certificate, summary } = appDetails;

  const openDocument = (filePath) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.target = '_blank';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Workflow Review Desk" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-6xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/applications')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Backlog
            </button>

            {/* Profile Overview Banner */}
            <div className="glass-panel border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{application.department_name}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{application.first_name} {application.last_name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Applying for <span className="font-semibold text-slate-600">{application.internship_title}</span> at <span className="font-semibold text-slate-600">{application.company_name}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={application.status} />
                <span className="text-[10px] text-slate-500">Duration: {new Date(application.start_date).toLocaleDateString()} to {new Date(application.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Documents & Review Actions */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Documents list card */}
                <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-500 border-b border-slate-900 pb-2.5 flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-slate-500" />
                    Student File Checklist
                  </h3>

                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-900/30 rounded-xl border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs text-slate-700">{doc.document_type}</span>
                          <span className="text-[10px] text-slate-500 block">Status: {doc.status}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {user?.role === 'HR' && application.status === 'Submitted' && (
                            <label className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={flaggedDocs[doc.id] || false}
                                onChange={(e) => setFlaggedDocs({ ...flaggedDocs, [doc.id]: e.target.checked })}
                                className="rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-0"
                              />
                              Flag Correction
                            </label>
                          )}

                          <button
                            onClick={() => openDocument(doc.file_path)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                          >
                            Open PDF <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Input for document correction reason */}
                        {flaggedDocs[doc.id] && (
                          <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-1 pl-4 border-l border-orange-500/20">
                            <input
                              type="text"
                              value={docRemarks[doc.id] || ''}
                              onChange={(e) => setDocRemarks({ ...docRemarks, [doc.id]: e.target.value })}
                              placeholder="Reason for correction (e.g. NOC incomplete)"
                              className="w-full px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] focus:outline-none focus:border-orange-500/40 text-slate-300"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Actions Module */}
                <div className="glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-500 border-b border-slate-900 pb-2.5">
                    Workflow Actions
                  </h3>

                  {actionLoading ? (
                    <div className="py-8 flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 1. HR Review Actions */}
                      {user?.role === 'HR' && ['Submitted', 'Resubmitted'].includes(application.status) && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Internal Remarks & Audit Comments</label>
                            <textarea
                              rows="2"
                              value={actionRemarks}
                              onChange={(e) => setActionRemarks(e.target.value)}
                              placeholder="Remarks to append to timeline..."
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2.5">
                            <button
                              onClick={() => handleStatusUpdate('Forwarded To HOD')}
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/10"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve & Forward HOD
                            </button>

                            <button
                              onClick={() => handleStatusUpdate('Modification Requested')}
                              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/10"
                            >
                              <AlertTriangle className="w-4 h-4" /> Request Modification
                            </button>

                            <button
                              onClick={() => handleStatusUpdate('Rejected')}
                              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/10"
                            >
                              <XCircle className="w-4 h-4" /> Reject application
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. HOD Review & Mentor Assignment */}
                      {user?.role === 'HOD' && ['Forwarded To HOD', 'Under HOD Review'].includes(application.status) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Assign Academic Mentor</label>
                              <select
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs bg-slate-900"
                              >
                                <option value="">Select Mentor from Dept</option>
                                {mentors.map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.first_name} {m.last_name} (Active: {m.active_interns_count})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleAssignMentor}
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all"
                            >
                              <UserCheck className="w-4 h-4" /> Assign Mentor & Approve
                            </button>

                            <button
                              onClick={() => handleStatusUpdate('Rejected')}
                              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-4 h-4" /> Reject application
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. L&D Approval */}
                      {user?.role === 'L&D' && ['Forwarded To L&D', 'Under L&D Review'].includes(application.status) && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">L&D Comments</label>
                            <textarea
                              rows="2"
                              value={actionRemarks}
                              onChange={(e) => setActionRemarks(e.target.value)}
                              placeholder="Approval comments..."
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate('L&D Approved')}
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve & Activate Internship
                            </button>

                            <button
                              onClick={() => handleStatusUpdate('Rejected')}
                              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-4 h-4" /> Reject application
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. Admin Status Override Panel */}
                      {user?.role === 'Admin' && (
                        <div className="space-y-4 pt-4 border-t border-slate-900/60">
                          <label className="block text-[10px] font-bold text-purple-400 uppercase">Admin Overrides Console</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <select
                              onChange={(e) => handleStatusUpdate(e.target.value)}
                              defaultValue=""
                              className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                            >
                              <option value="" disabled>Override Status to...</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Under HR Review">Under HR Review</option>
                              <option value="Modification Requested">Modification Requested</option>
                              <option value="Resubmitted">Resubmitted</option>
                              <option value="Forwarded To HOD">Forwarded To HOD</option>
                              <option value="Under HOD Review">Under HOD Review</option>
                              <option value="HOD Approved">HOD Approved</option>
                              <option value="Forwarded To L&D">Forwarded To L&D</option>
                              <option value="Under L&D Review">Under L&D Review</option>
                              <option value="Internship Active">Internship Active</option>
                              <option value="Internship Completed">Internship Completed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* 5. HR/L&D upload certificate block if internship is completed */}
                      {application.status === 'Internship Active' && ['Admin', 'HR', 'L&D'].includes(user?.role) && (
                        <form onSubmit={handleUploadCertificate} className="space-y-4 pt-4 border-t border-slate-900/60">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Upload Final Completion Certificate</label>
                          <p className="text-[10px] text-slate-500 leading-relaxed">Uploading the certificate closes this file and moves status to Completed.</p>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              onChange={(e) => setCertificateFile(e.target.files[0])}
                              accept=".pdf"
                              className="text-xs text-slate-400"
                              required
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl gradient-brand text-xs font-bold text-white flex items-center gap-1.5 hover:brightness-110"
                            >
                              <Upload className="w-3.5 h-3.5" /> Upload & Complete
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Informational State blocks */}
                      {!['Submitted', 'Resubmitted'].includes(application.status) && user?.role === 'HR' && (
                        <p className="text-xs text-slate-500 italic">No HR actions available for this status.</p>
                      )}
                      {!['Forwarded To HOD', 'Under HOD Review'].includes(application.status) && user?.role === 'HOD' && (
                        <p className="text-xs text-slate-500 italic">No HOD actions available for this status.</p>
                      )}
                      {!['Forwarded To L&D', 'Under L&D Review'].includes(application.status) && user?.role === 'L&D' && (
                        <p className="text-xs text-slate-500 italic">No L&D actions available for this status.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Timeline tracker & Supervisor assignments */}
              <div className="space-y-6">
                
                {/* Supervisor details */}
                {mentor && (
                  <div className="glass-panel border-slate-900 rounded-3xl p-5 space-y-3">
                    <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Assigned Faculty Mentor</h4>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600">{mentor.first_name} {mentor.last_name}</p>
                      <p className="text-[10px] text-slate-500">{mentor.email}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Specialization: {mentor.specialization || '—'}</p>
                    </div>
                  </div>
                )}

                {/* Audit logs */}
                <div className="glass-panel border-slate-900 rounded-3xl p-5 space-y-3">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Approval Timeline</h4>
                  <Timeline logs={activityLogs} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
