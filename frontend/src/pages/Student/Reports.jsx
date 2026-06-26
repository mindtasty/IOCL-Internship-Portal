// Student/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { BookOpen, Send, CheckCircle, AlertTriangle, ArrowLeft, MessageSquare, Plus, FileText } from 'lucide-react';

export default function Reports() {
  const [application, setApplication] = useState(null);
  const [reports, setReports] = useState([]);
  
  // Form state
  const [weekNum, setWeekNum] = useState('');
  const [tasks, setTasks] = useState('');
  const [learned, setLearned] = useState('');
  const [challenges, setChallenges] = useState('');
  const [commentsMsg, setCommentsMsg] = useState('');

  // Comment Thread Panel
  const [activeReport, setActiveReport] = useState(null);
  const [threadComments, setThreadComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const loadReportsData = async () => {
    try {
      const appRes = await api.get('/applications');
      const apps = appRes.data.applications;
      
      if (apps.length > 0) {
        const app = apps[0];
        setApplication(app);
        
        // Fetch reports list
        const repRes = await api.get(`/reports/${app.id}`);
        setReports(repRes.data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!weekNum || !tasks || !learned || !challenges) {
      return setError('Please fill in all required weekly card inputs.');
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post(`/reports/${application.id}`, {
        week_number: parseInt(weekNum),
        tasks_performed: tasks,
        what_learned: learned,
        challenges_faced: challenges,
        comments: commentsMsg
      });

      setSuccess(`Weekly report for Week ${weekNum} submitted successfully!`);
      // Clear form inputs
      setWeekNum('');
      setTasks('');
      setLearned('');
      setChallenges('');
      setCommentsMsg('');
      
      // Reload reports
      const repRes = await api.get(`/reports/${application.id}`);
      setReports(repRes.data.reports);
    } catch (err) {
      setError(err.message || 'Failed to submit report card.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCommentThread = async (report) => {
    setActiveReport(report);
    setNewComment('');
    try {
      const res = await api.get(`/reports/reports/${report.id}/comments`);
      setThreadComments(res.data.comments);
    } catch (err) {
      console.error('Failed to load report comments thread:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/reports/reports/${activeReport.id}/comments`, {
        comment: newComment
      });
      // Append comment locally
      setThreadComments(prev => [...prev, res.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle="Weekly Progress Updates" />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-6xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Overview
            </button>

            {loading ? (
              <div className="py-24 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !application || application.status !== 'Internship Active' ? (
              <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                <h4 className="font-bold text-slate-300 text-sm">Reports Inactive</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Weekly learning progress updates can only be submitted once your internship has been fully approved and activated.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Left Form to submit a new report */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-accent-500" />
                    New Report Card
                  </h3>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReport} className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Week Number *</label>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={weekNum}
                        onChange={(e) => setWeekNum(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tasks Performed *</label>
                      <textarea
                        rows="3"
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        placeholder="What coding/tasks did you complete this week?"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">What I Learned *</label>
                      <textarea
                        rows="3"
                        value={learned}
                        onChange={(e) => setLearned(e.target.value)}
                        placeholder="What libraries or concepts did you learn?"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Challenges Faced *</label>
                      <textarea
                        rows="3"
                        value={challenges}
                        onChange={(e) => setChallenges(e.target.value)}
                        placeholder="What blockers did you encounter?"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Comments</label>
                      <textarea
                        rows="2"
                        value={commentsMsg}
                        onChange={(e) => setCommentsMsg(e.target.value)}
                        placeholder="Additional questions/remarks for your mentor"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl gradient-brand text-xs font-semibold text-white shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Submitting...' : 'File Weekly Update'}
                    </button>
                  </form>
                </div>

                {/* 2. Middle lists of submitted reports */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-accent-500" />
                    Report Card History
                  </h3>

                  {reports.length === 0 ? (
                    <div className="text-center py-12 border border-slate-900 rounded-2xl bg-slate-900/10">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      <p className="text-xs text-slate-500">No reports filed yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((rep) => (
                        <div 
                          key={rep.id} 
                          className="glass-panel border-slate-900 rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                            <span className="font-bold text-slate-200 text-sm">Week {rep.week_number} Progress Report</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                rep.status === 'Approved' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : rep.status === 'Clarification Requested' 
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' 
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {rep.status}
                              </span>
                              <button
                                onClick={() => openCommentThread(rep)}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
                                title="Report Thread"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
                            <div>
                              <span className="font-bold text-slate-300">Tasks Completed</span>
                              <p className="mt-1 leading-relaxed text-[11px]">{rep.tasks_performed}</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-300">Key Learnings</span>
                              <p className="mt-1 leading-relaxed text-[11px]">{rep.what_learned}</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-300">Challenges Faced</span>
                              <p className="mt-1 leading-relaxed text-[11px]">{rep.challenges_faced}</p>
                            </div>
                          </div>

                          {rep.comments && (
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px]">
                              <span className="font-bold text-accent-400">Mentor Remarks:</span>
                              <p className="text-slate-400 mt-1 leading-relaxed">{rep.comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Comment thread modal sidebar */}
            {activeReport && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
                <div className="w-full max-w-md bg-slate-950 border-l border-slate-900 h-full p-6 flex flex-col justify-between animate-slide-up">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <h3 className="font-bold text-slate-200 text-sm">
                        Week {activeReport.week_number} Chat Thread
                      </h3>
                      <button
                        onClick={() => setActiveReport(null)}
                        className="text-xs text-slate-500 hover:text-white font-bold"
                      >
                        Close
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      {threadComments.length === 0 ? (
                        <p className="text-center text-xs text-slate-600 py-10">No messages in this report thread yet.</p>
                      ) : (
                        threadComments.map((c) => (
                          <div 
                            key={c.id} 
                            className={`p-3 rounded-xl text-xs max-w-[85%] ${
                              c.role_name === 'Student' 
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

                  {/* Input Form */}
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
        </main>
      </div>
    </div>
  );
}
