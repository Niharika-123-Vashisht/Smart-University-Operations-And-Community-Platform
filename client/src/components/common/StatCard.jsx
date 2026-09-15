import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive,
  color = 'brand',
  subtitle,
}) {
  const colorSchemes = {
    brand: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-300',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
    },
    violet: {
      bg: 'bg-violet-50 text-violet-600',
      border: 'hover:border-violet-300',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600',
      border: 'hover:border-sky-300',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.brand;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-card transition-all duration-200 hover:shadow-elevated ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
