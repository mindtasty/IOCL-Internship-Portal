// Student/ApplicationForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
  FileUp, Save, Send, AlertTriangle, CheckCircle,
  FileText, ArrowLeft, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

// ── Inline calendar date picker ──────────────────────────────────────────────
function DatePickerInput({ label, value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const handleDayClick = (day) => {
    const d = new Date(year, month, day);
    onChange(d.toISOString().split('T')[0]);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const formatDisplay = (val) => {
    if (!val) return 'Select date';
    const d = new Date(val + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}{required && ' *'}
      </label>
      <button
        type="button"
        onClick={() => { setViewDate(selectedDate || new Date()); setOpen(!open); }}
        className="w-full px-4 py-3 rounded-xl glass-input text-xs flex items-center gap-2 text-left"
      >
        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
        <span className={value ? 'text-slate-100' : 'text-slate-500'}>{formatDisplay(value)}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button" onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-100">{monthNames[month]} {year}</span>
            <button
              type="button" onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth()    === month &&
                selectedDate.getDate()     === day;
              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth()    === month &&
                new Date().getDate()     === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`text-xs py-1.5 rounded-lg transition-colors font-medium
                    ${isSelected
                      ? 'bg-accent-600 text-white'
                      : isToday
                        ? 'bg-slate-800 text-accent-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ApplicationForm() {
  const [internshipTitle, setInternshipTitle] = useState('');
  const [startDate, setStartDate]             = useState('');
  const [endDate, setEndDate]                 = useState('');
  const [deptId, setDeptId]                   = useState('');
  const [departments, setDepartments]         = useState([]);

  const [resume,         setResume]         = useState(null);
  const [noc,            setNoc]            = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [other,          setOther]          = useState(null);

  const [existingApp,  setExistingApp]  = useState(null);
  const [rejectedDocs, setRejectedDocs] = useState([]);

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const deptsRes = await api.get('/admin/departments');
        setDepartments(deptsRes.data.departments);

        const appsRes = await api.get('/applications');
        const apps = appsRes.data.applications;

        if (apps.length > 0) {
          const app = apps[0];
          if (app.status === 'Modification Requested' || app.status === 'Draft') {
            setExistingApp(app);
            setInternshipTitle(app.internship_title);
            setStartDate(app.start_date.split('T')[0]);
            setEndDate(app.end_date.split('T')[0]);
            setDeptId(app.department_id);

            const detailRes = await api.get(`/applications/${app.id}`);
            const docs = detailRes.data.documents;
            setRejectedDocs(docs.filter((doc) => doc.status === 'Rejected'));
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to init application form:', err);
      }
    };
    initializeForm();
  }, [navigate]);

  const handleSubmit = async (e, isDraftSubmit) => {
    e.preventDefault();
    if (!internshipTitle || !startDate || !endDate || !deptId) {
      return setError('Please fill in all required fields.');
    }
    if (!existingApp && (!resume || !noc || !recommendation)) {
      return setError('Please upload all mandatory documents (Resume, NOC, Recommendation Letter).');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('company_name',    'Indian Oil Corporation Limited');
    formData.append('internship_title', internshipTitle);
    formData.append('start_date',      startDate);
    formData.append('end_date',        endDate);
    formData.append('department_id',   deptId);
    formData.append('is_draft',        isDraftSubmit ? 'true' : 'false');

    if (resume)         formData.append('resume',         resume);
    if (noc)            formData.append('noc',            noc);
    if (recommendation) formData.append('recommendation', recommendation);
    if (other)          formData.append('other',          other);

    try {
      if (existingApp?.status === 'Modification Requested') {
        await api.put(`/applications/${existingApp.id}/resubmit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Application resubmitted successfully! Tracking progress...');
      } else {
        await api.post('/applications', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess(isDraftSubmit ? 'Draft saved successfully!' : 'Application filed successfully! Tracking progress...');
      }
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to process application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={existingApp?.status === 'Modification Requested' ? 'Correct Application' : 'Apply for Internship'} />

        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
          <div className="max-w-3xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Overview
            </button>

            {existingApp?.status === 'Modification Requested' && rejectedDocs.length > 0 && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>HR Correction Requested — please re-upload the files marked below:</span>
                </div>
                <ul className="list-disc list-inside pl-2 space-y-1 text-slate-300">
                  {rejectedDocs.map((doc) => (
                    <li key={doc.id}>
                      <span className="font-semibold text-orange-400">{doc.document_type}</span>
                      {doc.remarks ? ` — ${doc.remarks}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form className="glass-panel border-slate-950/40 rounded-3xl p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-200 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-slate-500" />
                  Internship Profile Information
                </h3>

                {/* Internship title — full width */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Internship Title *
                  </label>
                  <input
                    type="text"
                    value={internshipTitle}
                    onChange={(e) => setInternshipTitle(e.target.value)}
                    placeholder="e.g. Research Assistant Intern"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                    required
                  />
                </div>

                {/* Dates + Department */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DatePickerInput
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    required
                  />
                  <DatePickerInput
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    required
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Academic Department *
                    </label>
                    <select
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs bg-slate-900"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document uploads */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <h3 className="font-bold text-sm text-slate-200 pb-2 flex items-center gap-2">
                  <FileUp className="w-4.5 h-4.5 text-slate-500" />
                  Upload Documents (PDF Only)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Resume/CV *',                  setter: setResume,         key: 'resume' },
                    { label: 'College NOC (No Objection) *', setter: setNoc,            key: 'noc'    },
                    { label: 'Recommendation Letter *',      setter: setRecommendation, key: 'rec'    },
                    { label: 'Other Support Files (Optional)', setter: setOther,         key: 'other'  },
                  ].map(({ label, setter, key }) => (
                    <div key={key} className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2 text-center">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {label}
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setter(e.target.files[0])}
                        accept=".pdf"
                        className="text-xs text-slate-500 w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-900">
                {!existingApp && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save as Draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl gradient-brand text-xs font-semibold text-white inline-flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Processing...' : existingApp?.status === 'Modification Requested' ? 'Resubmit Corrected File' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}