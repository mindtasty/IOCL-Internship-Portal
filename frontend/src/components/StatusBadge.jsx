// StatusBadge.jsx
import React from 'react';

const STATUS_MAP = {
  'Draft': { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Draft' },
  'Submitted': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Submitted' },
  'Under HR Review': { bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Under HR Review' },
  'Modification Requested': { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'Correction Required' },
  'Resubmitted': { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Resubmitted' },
  'Forwarded To HOD': { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Pending HOD' },
  'Under HOD Review': { bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', label: 'Under HOD Review' },
  'HOD Approved': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'HOD Approved' },
  'Mentor Assigned': { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Mentor Bound' },
  'Forwarded To L&D': { bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20', label: 'Pending L&D' },
  'Under L&D Review': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Under L&D Review' },
  'L&D Approved': { bg: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'L&D Approved' },
  'Internship Active': { bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20 timeline-active-node', label: 'Active Intern' },
  'Internship Completed': { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Completed' },
  'Rejected': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Rejected' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      {config.label}
    </span>
  );
}
export { STATUS_MAP };
