// Student/Overview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import {
  FileText, ArrowRight, Calendar, Building, User, Activity,
  FileCheck, Percent, CheckCircle, HelpCircle
} from 'lucide-react';

export default function StudentOverview() {
  const [application, setApplication] = useState(null);
  const [documents, setDocuments]     = useState([]);
  const [logs, setLogs]               = useState([]);
  const [attendance, setAttendance]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  const requiredDocuments = [
    'College AICTE / UGC registration certificate',
    'Reference letter from the Institute',
    'Application form, attached with this email',
    'College Photo ID',
    'Bio-data',
    'Govt ID proof',
    'Marksheet of Last Semester',
    'NOC',
    'Passport size photo to be attached in the application format',
  ];

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const response = await api.get('/applications');
        const apps = response.data.applications;
        if (apps.length > 0) {
          const mainApp = apps[0];
          setApplication(mainApp);
          const detailRes = await api.get(`/applications/${mainApp.id}`);
          setDocuments(detailRes.data.documents);
          setLogs(detailRes.data.activityLogs);
          if (['Internship Active', 'Internship Completed'].includes(mainApp.status)) {
            const attRes = await api.get(`/attendance/${mainApp.id}`);
            setAttendance(attRes.data.summary);
          }
        }
      } catch (error) {
        console.error('Failed to load student overview:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-slide-up">
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-accent-500/10 border border-accent-500/20 text-accent-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Start Your Internship Application</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Prepare these documents first, then submit your application. After submission, you can track every approval step from HR to HOD, Mentor, and L&D in the timeline tracker.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/application/apply')}
              className="px-6 py-3.5 rounded-xl gradient-brand text-xs font-semibold text-white inline-flex items-center gap-2 shadow-lg shadow-accent-500/10 hover:brightness-110 transition-all hover:scale-[1.02] self-start md:self-center"
            >
              Start Internship Application <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <div className="bg-white rounded-2xl border border-slate-700 p-5 space-y-4">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                What to submit
              </h4>
              <div className="space-y-3">
                {requiredDocuments.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-[10px] font-bold text-accent-600">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-700 p-5 space-y-4">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                After you submit
              </h4>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>Your application will move through HR, HOD, Mentor assignment, and L&D review.</p>
                <p>You can open the timeline tracker any time to see status updates and audit history.</p>
              </div>
              <button
                onClick={() => navigate('/application/track')}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Open Tracking Timeline <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const workflowSteps = [
    { label: 'Submitted',      key: ['Submitted', 'Under HR Review', 'Resubmitted'] },
    { label: 'HR Check',       key: ['Forwarded To HOD', 'Under HOD Review'] },
    { label: 'HOD Check',      key: ['HOD Approved'] },
    { label: 'Mentor assigned',key: ['Mentor Assigned', 'Forwarded To L&D', 'Under L&D Review'] },
    { label: 'L&D Check',      key: ['L&D Approved', 'Internship Active', 'Internship Completed'] },
  ];

  const getCurrentStepIndex = () => {
    if (application.status === 'Rejected') return -1;
    if (['Internship Active', 'Internship Completed'].includes(application.status)) return 5;
    let matchedIdx = 0;
    workflowSteps.forEach((step, idx) => {
      if (step.key.includes(application.status)) matchedIdx = idx;
    });
    return matchedIdx;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header banner */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-600">Internship Track: {application.internship_title}</h2>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {application.company_name}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Start: {new Date(application.start_date).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/application/track')}
            className="px-4 py-2 rounded-lg bg-[#0d2352] border border-[#1a3a6b] text-xs font-semibold text-white transition-colors hover:bg-[#1a3a6b]"
          >
            Track Progress
          </button>
          {application.status === 'Modification Requested' && (
            <button
              onClick={() => navigate('/application/apply')}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white transition-colors"
            >
              Fix Documents & Resubmit
            </button>
          )}
        </div>
      </div>

      {/* Approval milestone stepper */}
      {!['Internship Active', 'Internship Completed', 'Rejected'].includes(application.status) && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Milestones</h4>
          <div className="flex items-center justify-between relative mt-4">
            {workflowSteps.map((step, idx) => {
              const isFinished = idx <= currentStepIndex;
              const isCurrent  = idx === currentStepIndex;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                  {idx > 0 && (
                    <div className={`absolute top-4 -left-1/2 right-1/2 h-0.5 -z-10 ${
                      idx <= currentStepIndex ? 'bg-accent-500' : 'bg-slate-700'
                    }`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    isFinished
                      ? 'bg-accent-500 border-accent-600 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  } ${isCurrent ? 'timeline-active-node' : ''}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold mt-2 ${isFinished ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Required documents checklist */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Required Documents Checklist
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requiredDocuments.map((item, index) => (
            <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-[10px] font-bold text-accent-600">
                {index + 1}
              </div>
              <p className="text-sm font-medium text-slate-200 leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active internship metrics */}
      {['Internship Active', 'Internship Completed'].includes(application.status) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {attendance && (
            <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center">
                <Percent className="w-6 h-6 text-accent-500" />
              </div>
              <div>
                <h4 className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Attendance</h4>
                <p className="text-3xl font-extrabold text-slate-600 mt-1">{attendance.attendancePercentage}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{attendance.presentDays} Present / {attendance.absentDays} Absent</p>
              </div>
            </div>
          )}

          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-accent-500">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Assigned Mentor</h4>
              <p className="text-sm font-bold text-slate-600 mt-1">
                {application.mentor_first_name ? `${application.mentor_first_name} ${application.mentor_last_name}` : 'Not assigned'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Faculty Supervisor</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-accent-500">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Weekly Reports</h4>
              <button
                onClick={() => navigate('/internship/reports')}
                className="text-xs text-slate-600 hover:text-slate-500 font-bold flex items-center gap-1.5 mt-1 transition-colors"
              >
                Submit updates <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] text-slate-400 mt-0.5">Submit progress reports</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline + Documents split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-slate-400" />
            Application Approval Timeline
          </h3>
          <div className="glass-panel rounded-2xl p-6">
            <Timeline logs={logs} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-slate-400" />
            Attached Documents
          </h3>
          <div className="glass-panel rounded-2xl p-4 divide-y divide-slate-700">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">{doc.document_type}</span>
                  <span className={`text-[10px] ${
                    doc.status === 'Approved' ? 'text-emerald-500' :
                    doc.status === 'Rejected' ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                {doc.remarks && (
                  <p className="text-[10px] text-orange-600 mt-1 bg-orange-500/10 border border-orange-500/20 rounded p-1.5">
                    Remark: {doc.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}