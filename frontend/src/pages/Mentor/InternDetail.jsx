// Mentor/InternDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { 
  ArrowLeft, 
  User, 
  CalendarCheck, 
  BookOpen, 
  Award, 
  FileText, 
  ExternalLink,
  Plus,
  Send,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Percent
} from 'lucide-react';

export default function InternDetail() {
  const { id } = useParams(); // application ID
  const [appDetails, setAppDetails] = useState(null);
  const [reports, setReports] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  // Navigation tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'attendance', 'reports', 'evaluation'

  // Mark Attendance Form State
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('Present');
  const [attRemarks, setAttRemarks] = useState('');
  
  // Weekly Report review form State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportReviewStatus, setReportReviewStatus] = useState('Approved');
  const [reportRemarks, setReportRemarks] = useState('');
  
  // Chat Comments state
  const [chatReport, setChatReport] = useState(null);
  const [threadComments, setThreadComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Evaluation Form State
  const [techSkills, setTechSkills] = useState('5');
  const [learnAbility, setLearnAbility] = useState('5');
  const [communication, setCommunication] = useState('5');
  const [discipline, setDiscipline] = useState('5');
  const [attScore, setAttScore] = useState('5');
  const [evaluationRemarks, setEvaluationRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadInternDetails = async () => {
    try {
      const [appRes, repRes, attRes] = await Promise.all([
        api.get(`/applications/${id}`),
        api.get(`/reports/${id}`),
        api.get(`/attendance/${id}`).catch(() => ({ data: { summary: null, logs: [] } }))
      ]);
      setAppDetails(appRes.data);
      setReports(repRes.data.reports);
      setAttendance(attRes.data.summary);
      setAttendanceLogs(attRes.data.logs);

      // Pre-fill evaluation if it exists
      if (appRes.data.summary) {
        const sum = appRes.data.summary;
        setTechSkills(sum.technical_skills.toString());
        setLearnAbility(sum.learning_ability.toString());
        setCommunication(sum.communication.toString());
        setDiscipline(sum.discipline.toString());
        setAttScore(sum.attendance_score.toString());
        setEvaluationRemarks(sum.evaluation_remarks || '');
      }
    } catch (error) {
      console.error('Failed to load intern profile logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternDetails();
  }, [id]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/attendance/${id}`, {
        date: attDate,
        status: attStatus,
        remarks: attRemarks
      });
      setAttRemarks('');
      loadInternDetails();
    } catch (error) {
      alert(error.message || 'Failed to log daily attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/reports/${id}/reports/${selectedReport.id}/status`, {
        status: reportReviewStatus,
        remarks: reportRemarks
      });
      setSelectedReport(null);
      setReportRemarks('');
      loadInternDetails();
    } catch (error) {
      alert(error.message || 'Failed to review weekly update.');
    } finally {
      setSubmitting(false);
    }
  };

  const openChatThread = async (report) => {
    setChatReport(report);
    setNewComment('');
    try {
      const res = await api.get(`/reports/reports/${report.id}/comments`);
      setThreadComments(res.data.comments);
    } catch (err) {
      console.error('Failed to load report comments:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/reports/reports/${chatReport.id}/comments`, {
        comment: newComment
      });
      setThreadComments(prev => [...prev, res.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to write comment:', err);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/applications/${id}/evaluation`, {
        technical_skills: parseInt(techSkills),
        learning_ability: parseInt(learnAbility),
        communication: parseInt(communication),
        discipline: parseInt(discipline),
        attendance_score: parseInt(attScore),
        evaluation_remarks: evaluationRemarks
      });
      alert('Evaluation submitted and PDF report card generated successfully!');
      loadInternDetails();
    } catch (error) {
      alert(error.message || 'Failed to submit final evaluation scorecard.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { application, documents } = appDetails;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={`Supervising Intern: ${application.first_name} ${application.last_name}`} />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to interns roster
            </button>

            {/* Profile Overview Card */}
            <div className="glass-panel border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{application.first_name} {application.last_name}</h2>
                  <StatusBadge status={application.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Intern Role: <span className="font-semibold text-slate-600">{application.internship_title}</span> at <span className="font-semibold text-slate-600">{application.company_name}</span>
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'profile' ? 'bg-slate-600 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Profile & Files
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'attendance' ? 'bg-slate-600 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Attendance Sheet
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'reports' ? 'bg-slate-600 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Reports
                </button>
                <button
                  onClick={() => setActiveTab('evaluation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'evaluation' ? 'bg-slate-600 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Final Evaluation
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. Profile & Files Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
                <div className="md:col-span-2 glass-panel border-slate-900 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-600 border-b border-slate-800 pb-2">Intern Metadata</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 font-bold block">First Name</span>
                      <span className="text-slate-700 text-sm block mt-0.5">{application.first_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Last Name</span>
                      <span className="text-slate-700 text-sm block mt-0.5">{application.last_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Email Address</span>
                      <span className="text-slate-700 text-sm block mt-0.5">{application.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Contact Number</span>
                      <span className="text-slate-700 text-sm block mt-0.5">{application.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Department</span>
                      <span className="text-slate-700 text-sm block mt-0.5">{application.department_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Duration Dates</span>
                      <span className="text-slate-700 text-sm block mt-0.5">
                        {new Date(application.start_date).toLocaleDateString()} to {new Date(application.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel border-slate-900 rounded-3xl p-5 space-y-3 h-fit">
                  <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Attached Student Documents</h4>
                  <div className="divide-y divide-slate-800/60">
                    {documents.map(doc => (
                      <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                        <span className="font-medium text-slate-500">{doc.document_type}</span>
                        <button
                          onClick={() => window.open(doc.file_path, '_blank')}
                          className="text-slate-600 hover:text-slate-400 flex items-center gap-1 font-bold text-[10px]"
                        >
                          View PDF <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Attendance Sheet Tab */}
            {activeTab === 'attendance' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                {/* Mark daily attendance form */}
                <div>
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 mb-4">
                    <Plus className="w-4.5 h-4.5 text-accent-500" />
                    Mark Daily Attendance
                  </h3>
                  
                  {application.status !== 'Internship Active' ? (
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-xs text-orange-400 flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                      <span>Cannot mark attendance unless the internship is active.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleMarkAttendance} className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
                        <input
                          type="date"
                          value={attDate}
                          onChange={(e) => setAttDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workday Status</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Present', 'Absent', 'Half Day'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setAttStatus(status)}
                              className={`py-2 px-1 text-xs rounded-xl font-semibold border transition-all ${
                                attStatus === status 
                                  ? 'bg-accent-600 border-accent-500 text-white shadow shadow-accent-500/10'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                        <input
                          type="text"
                          value={attRemarks}
                          onChange={(e) => setAttRemarks(e.target.value)}
                          placeholder="e.g. Late shift, sick leave"
                          className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl gradient-brand text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-500/10 disabled:opacity-50"
                      >
                        <CalendarCheck className="w-4 h-4" /> Save Attendance Log
                      </button>
                    </form>
                  )}
                </div>

                {/* Logs history */}
                <div className="lg:col-span-2 space-y-6">
                  {attendance && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Attendance Score</span>
                        <span className="text-2xl font-extrabold text-slate-200 mt-1 block">{attendance.attendancePercentage}%</span>
                      </div>
                      <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Present Days</span>
                        <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{attendance.presentDays}</span>
                      </div>
                      <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Half Days</span>
                        <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{attendance.halfDays}</span>
                      </div>
                      <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Absent Days</span>
                        <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{attendance.absentDays}</span>
                      </div>
                    </div>
                  )}

                  <div className="glass-panel border-slate-900 rounded-2xl p-6">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-4">Daily Logs Calendar</h4>
                    
                    {attendanceLogs.length === 0 ? (
                      <p className="text-xs text-slate-500 py-8 text-center">No attendance logs logged yet.</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto pr-1">
                        <table className="w-full text-xs text-slate-400">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-600 font-bold">
                              <th className="py-2 text-left">Date</th>
                              <th className="py-2 text-left">Status</th>
                              <th className="py-2 text-left">Supervisor Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {attendanceLogs.map(log => (
                              <tr key={log.id}>
                                <td className="py-2.5 font-semibold text-slate-500">
                                  {new Date(log.date).toLocaleDateString(undefined, {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </td>
                                <td className="py-2.5">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : log.status === 'Half Day' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-slate-500">{log.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4 animate-slide-up">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-accent-500" />
                  Weekly Progress updates queue
                </h3>

                {reports.length === 0 ? (
                  <div className="text-center py-12 border border-slate-900 rounded-3xl bg-slate-900/10">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                    <p className="text-xs text-slate-500">Student hasn't submitted any weekly reports yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((rep) => (
                      <div key={rep.id} className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="font-bold text-slate-600 text-sm">Week {rep.week_number} report card</span>
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              rep.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : rep.status === 'Clarification Requested' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {rep.status}
                            </span>
                            
                            <button
                              onClick={() => setSelectedReport(rep)}
                              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-500 text-[10px] font-bold"
                            >
                              Grade / Review
                            </button>

                            <button
                              onClick={() => openChatThread(rep)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-600"
                              title="Chat Feed"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-600 uppercase tracking-wide block text-[10px]">Tasks Performed</span>
                            <p className="mt-1 leading-relaxed">{rep.tasks_performed}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 uppercase tracking-wide block text-[10px]">What was learned</span>
                            <p className="mt-1 leading-relaxed">{rep.what_learned}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 uppercase tracking-wide block text-[10px]">Challenges faced</span>
                            <p className="mt-1 leading-relaxed">{rep.challenges_faced}</p>
                          </div>
                        </div>

                        {rep.comments && (
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs">
                            <span className="font-bold text-accent-400">Review remarks:</span>
                            <p className="text-slate-400 mt-0.5 leading-relaxed">{rep.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Grading Review Modal */}
                {selectedReport && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleReviewReport} className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 animate-slide-up shadow-2xl">
                      <h3 className="font-bold text-slate-200 text-sm">Review Week {selectedReport.week_number} Update</h3>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Review Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Approved', 'Clarification Requested'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setReportReviewStatus(status)}
                              className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                                reportReviewStatus === status 
                                  ? 'bg-accent-600 border-accent-500 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {status === 'Clarification Requested' ? 'Clarification' : 'Approve'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mentor Remarks</label>
                        <textarea
                          rows="3"
                          value={reportRemarks}
                          onChange={(e) => setReportRemarks(e.target.value)}
                          placeholder="Provide grading remarks or explain missing information..."
                          className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 rounded-xl gradient-brand text-xs font-bold text-white disabled:opacity-50"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Comment Feed Drawer modal */}
                {chatReport && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-md bg-slate-950 border-l border-slate-900 h-full p-6 flex flex-col justify-between animate-slide-up">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <h3 className="font-bold text-slate-200 text-sm">
                            Week {chatReport.week_number} Comment Thread
                          </h3>
                          <button
                            onClick={() => setChatReport(null)}
                            className="text-xs text-slate-500 hover:text-white font-bold"
                          >
                            Close
                          </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                          {threadComments.length === 0 ? (
                            <p className="text-center text-xs text-slate-600 py-10">No messages in this thread.</p>
                          ) : (
                            threadComments.map((c) => (
                              <div 
                                key={c.id} 
                                className={`p-3 rounded-xl text-xs max-w-[85%] ${
                                  c.role_name === 'Mentor' 
                                    ? 'bg-accent-600/10 border border-accent-500/20 ml-auto text-right' 
                                    : 'bg-slate-900 border border-slate-800'
                                }`}
                              >
                                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                                  {c.first_name} ({c.role_name})
                                </span>
                                <p className="text-slate-300 leading-relaxed">{c.comment}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-900 flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Ask/Reply in this thread..."
                          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
                          required
                        />
                        <button
                          type="submit"
                          className="p-2.5 rounded-xl gradient-brand text-white hover:brightness-110 flex items-center justify-center shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Final Evaluation Tab */}
            {activeTab === 'evaluation' && (
              <div className="max-w-2xl mx-auto animate-slide-up">
                <form onSubmit={handleSubmitEvaluation} className="glass-panel border-slate-900 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-600 text-sm flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-slate-600" />
                      Final Internship Performance Evaluation
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Submit parameters scores and compile the performance scorecard PDF.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tech skills */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Skills (1-5)</label>
                      <select
                        value={techSkills}
                        onChange={(e) => setTechSkills(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val} - {val === 5 ? 'Excellent' : val === 1 ? 'Poor' : 'Standard'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Learning ability */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Learning Agility (1-5)</label>
                      <select
                        value={learnAbility}
                        onChange={(e) => setLearnAbility(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    {/* Communication */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Communication (1-5)</label>
                      <select
                        value={communication}
                        onChange={(e) => setCommunication(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    {/* Discipline */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Discipline & Conduct (1-5)</label>
                      <select
                        value={discipline}
                        onChange={(e) => setDiscipline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    {/* Attendance Score */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Attendance & Punctuality Score (1-5)</label>
                      <select
                        value={attScore}
                        onChange={(e) => setAttScore(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Overall Remarks & Evaluation Comments</label>
                    <textarea
                      rows="4"
                      value={evaluationRemarks}
                      onChange={(e) => setEvaluationRemarks(e.target.value)}
                      placeholder="Write summary recommendations or overall comments..."
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-900/60">
                    {appDetails.summary?.file_path ? (
                      <button
                        type="button"
                        onClick={() => window.open(appDetails.summary.file_path, '_blank')}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                      >
                        View Generated Summary PDF
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No summary compiled yet.</span>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3.5 rounded-xl gradient-brand text-xs font-bold text-white flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                    >
                      <Award className="w-4 h-4" />
                      {submitting ? 'Generating PDF...' : 'Submit Evaluation Score'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
