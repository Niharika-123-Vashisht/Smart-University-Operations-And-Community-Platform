import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  AlertCircle,
  Calendar,
  Compass,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Clock,
  MapPin,
  Megaphone,
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [compRes, appRes, annRes] = await Promise.all([
          axiosClient.get('/complaints'),
          axiosClient.get('/appointments/my'),
          axiosClient.get('/announcements'),
        ]);

        setComplaints(compRes.data.complaints || []);
        setAppointments(appRes.data.appointments || []);
        setAnnouncements(annRes.data.announcements || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader text="Loading your student overview..." />;
  }

  const openComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Confirmed'
  );
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Accepted' || a.status === 'Requested'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white p-6 sm:p-8 shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/10 text-brand-200 border border-white/20">
            Student Portal • {user?.identifier || 'Enrolled'}
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-brand-100/80 leading-relaxed">
            Track your departmental grievances in real-time, consult with academic faculty, register for campus workshops, and exchange skills with your peers.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/student/complaints/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-brand-50 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>File Grievance</span>
            </Link>
            <Link
              to="/student/appointments/book"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-700/80 text-white hover:bg-brand-700 border border-white/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Faculty Slot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Grievances"
          value={openComplaints.length}
          icon={AlertCircle}
          color="amber"
          subtitle={`${complaints.length} Total Submitted`}
        />
        <StatCard
          title="Upcoming Consultations"
          value={upcomingAppointments.length}
          icon={Calendar}
          color="brand"
          subtitle="Faculty appointments"
        />
        <StatCard
          title="Campus Announcements"
          value={announcements.length}
          icon={Megaphone}
          color="emerald"
          subtitle="Active notices"
        />
        <StatCard
          title="Resolved Complaints"
          value={complaints.filter((c) => c.status === 'Resolved' || c.status === 'Confirmed').length}
          icon={BookOpen}
          color="violet"
          subtitle="Closed grievances"
        />
      </div>

      {/* Pinned Urgent Announcements */}
      {announcements.filter((a) => a.priority === 'Urgent').length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-2">
            <Megaphone className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Priority University Broadcast:</span>
          </div>
          {announcements
            .filter((a) => a.priority === 'Urgent')
            .slice(0, 1)
            .map((ann) => (
              <div key={ann._id}>
                <h4 className="text-sm font-bold text-rose-900">{ann.title}</h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">{ann.content}</p>
              </div>
            ))}
        </div>
      )}

      {/* Two Column Layout: Grievances & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Complaints Tracker */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Recent Grievances</h3>
              <p className="text-xs text-slate-400">Live 5-stage status tracking</p>
            </div>
            <Link
              to="/student/complaints"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {complaints.length > 0 ? (
              complaints.slice(0, 4).map((c) => (
                <div
                  key={c._id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                    <Badge text={c.status} variant={c.status} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Dept: {c.department?.code || 'General'}</span>
                    <span>Priority: {c.priority}</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                You have not filed any grievances yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Upcoming Consultations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Faculty Consultations</h3>
              <p className="text-xs text-slate-400">Scheduled one-on-one sessions</p>
            </div>
            <Link
              to="/student/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 4).map((a) => (
                <div
                  key={a._id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      {a.faculty?.name || 'Faculty Member'}
                    </h4>
                    <Badge text={a.status} variant={a.status} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {a.date} ({a.startTime} - {a.endTime})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {a.meetingLocation}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">No appointments scheduled.</p>
                <Link
                  to="/student/appointments/book"
                  className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Book a consultation slot →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
