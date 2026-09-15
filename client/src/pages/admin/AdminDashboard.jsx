import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  Users,
  AlertCircle,
  Compass,
  Search,
  Star,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/analytics/dashboard');
        setAnalytics(res.data.analytics || null);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Computing MongoDB analytics aggregation pipelines..." />;
  }

  if (!analytics) {
    return <div className="p-8 text-center text-slate-500">Analytics data unavailable.</div>;
  }

  // Color constants for charts
  const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#0d9488'];
  const statusPieData = Object.entries(analytics.complaints?.statusBreakdown || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white p-6 sm:p-8 shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Executive Intelligence • Real-time MongoDB Aggregations
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            University Operations & Command Center
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Centralized institutional intelligence monitoring student grievances, departmental workloads, faculty consultations, and campus community engagement.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campus Users"
          value={analytics.users?.total || 0}
          icon={Users}
          color="brand"
          subtitle={`${analytics.users?.byRole?.student || 0} Students, ${analytics.users?.byRole?.faculty || 0} Faculty`}
        />
        <StatCard
          title="Grievances Logged"
          value={analytics.complaints?.total || 0}
          icon={AlertCircle}
          color="amber"
          subtitle={`${analytics.complaints?.statusBreakdown?.Resolved || 0} Resolved`}
        />
        <StatCard
          title="Events & Workshops"
          value={analytics.events?.totalEvents || 0}
          icon={Compass}
          color="emerald"
          subtitle={`${analytics.events?.totalRegistrations || 0} Total Registrations`}
        />
        <StatCard
          title="Campus Feedback Score"
          value={`${analytics.feedback?.averageRating || 0} / 5.0`}
          icon={Star}
          color="violet"
          subtitle={`${analytics.feedback?.totalSubmissions || 0} Student Reviews`}
        />
      </div>

      {/* Recharts Row 1: Monthly Complaint Trends & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend AreaChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Grievance Filing vs Resolution Trends
              </h3>
              <p className="text-xs text-slate-400">Velocity of campus complaints over time</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600">
              6-Month Trend
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.complaints?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Grievances Filed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Cases"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#resolvedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut/PieChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Current Grievance Stages</h3>
            <p className="text-xs text-slate-400">Distribution across 5-stage lifecycle</p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {statusPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[idx % STATUS_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <strong className="text-slate-800">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Department Workload & Feedback Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload BarChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Departmental Grievance Workloads</h3>
            <p className="text-xs text-slate-400">Total complaints routed to each department</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.complaints?.departmentBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Total Complaints" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Rating Distribution BarChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Platform Satisfaction Ratings</h3>
            <p className="text-xs text-slate-400">Student & faculty sentiment distribution</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.feedback?.ratingDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  dataKey="star"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Reviews" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
