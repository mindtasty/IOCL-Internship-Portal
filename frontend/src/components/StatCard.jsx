// StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, description }) {
  // Map color codes to gradients
  const gradients = {
    blue: 'from-blue-600/15 to-indigo-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-600/15 to-teal-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/15 to-orange-600/5 border-amber-500/20 text-amber-400',
    rose: 'from-rose-600/15 to-red-600/5 border-rose-500/20 text-rose-400',
    violet: 'from-violet-600/15 to-purple-600/5 border-violet-500/20 text-violet-400',
    cyan: 'from-cyan-600/15 to-sky-600/5 border-cyan-500/20 text-cyan-400',
  };

  const selectedGradient = gradients[colorClass] || gradients.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${selectedGradient} p-5 card-hover shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-bold font-display mt-1.5">{value}</h3>
          {description && <p className="text-[11px] text-slate-300 mt-1">{description}</p>}
        </div>
        
        <div className={`p-3 rounded-xl bg-slate-900/60 border border-white/5`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative radial lighting effect */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-current opacity-5 blur-2xl rounded-full pointer-events-none" />
    </div>
  );
}
