import React from 'react';

const BADGE_STYLES = {
  // Complaint & Appointment Statuses
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Confirmed: 'bg-teal-50 text-teal-800 border-teal-200',
  
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Requested: 'bg-amber-50 text-amber-700 border-amber-200',
  Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Completed: 'bg-slate-100 text-slate-700 border-slate-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',

  // Priorities
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',

  // Roles
  student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',

  // Lost & Found
  Lost: 'bg-rose-50 text-rose-700 border-rose-200',
  Found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Open: 'bg-amber-50 text-amber-700 border-amber-200',

  // Skill Proficiency
  Beginner: 'bg-sky-50 text-sky-700 border-sky-200',
  Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Advanced: 'bg-violet-50 text-violet-700 border-violet-200',
  Expert: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
};

const DOT_COLORS = {
  Pending: 'bg-amber-400',
  Assigned: 'bg-blue-400',
  'In Progress': 'bg-indigo-500 animate-pulse',
  Resolved: 'bg-emerald-500',
  Confirmed: 'bg-teal-500',
  Urgent: 'bg-rose-500 animate-ping',
  Open: 'bg-amber-500',
  Available: 'bg-emerald-400',
};

export default function Badge({ text, variant, showDot = true, size = 'md' }) {
  const key = variant || text;
  const style = BADGE_STYLES[key] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = DOT_COLORS[key] || 'bg-slate-400';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${sizeClasses[size]} ${style}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {text}
    </span>
  );
}
