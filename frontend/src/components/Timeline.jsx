// Timeline.jsx
import React from 'react';
import { Calendar, User } from 'lucide-react';

export default function Timeline({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        No progress logs recorded.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-800 ml-3.5 pl-6 space-y-6">
      {logs.map((log, index) => {
        const date = new Date(log.timestamp);
        const formattedDate = date.toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={log.id || index} className="relative group">
            {/* Timeline Dot Indicator */}
            <span className="absolute -left-[33px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-950 border-2 border-accent-500 timeline-active-node" />

            {/* Content Card */}
            <div className="glass-card rounded-xl p-4 border border-slate-800/60 transition-all duration-300 hover:border-slate-700/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                <h4 className="font-semibold text-sm text-slate-200">{log.action_name}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate} at {formattedTime}</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{log.description}</p>
              
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/40 text-[10px] text-slate-200">
                <User className="w-3.5 h-3.5 text-slate-200" />
                <span>By {log.first_name} {log.last_name} ({log.role_name})</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
