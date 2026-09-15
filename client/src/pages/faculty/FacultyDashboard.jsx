import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  AlertCircle,
  Clock,
  User,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [appRes, compRes] = await Promise.all([
          axiosClient.get('/appointments/my'),
          axiosClient.get('/complaints'),
        ]);

        setAppointments(appRes.data.appointments || []);
        setComplaints(compRes.data.complaints || []);
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader text="Loading faculty command dashboard..." />;
  }

  const pendingRequests = appointments.filter((a) => a.status === 'Requested');
  const acceptedAppointments = appointments.filter((a) => a.status === 'Accepted');
  const availableSlots = appointments.filter((a) => a.status === 'Available');
  const pendingGrievances = complaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 text-white p-6 sm:p-8 shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
            Faculty Academic Portal • {user?.identifier || 'Academic Staff'}
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your student consultation slots, review one-on-one booking requests, and supervise departmental grievance resolutions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/faculty/slots"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Create Available Slots</span>
            </Link>
            <Link
              to="/faculty/appointments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Review Requests ({pendingRequests.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Bookings"
          value={pendingRequests.length}
          icon={Calendar}
          color="amber"
          subtitle="Action required"
        />
        <StatCard
          title="Confirmed Sessions"
          value={acceptedAppointments.length}
          icon={CalendarCheck}
          color="brand"
          subtitle="Scheduled meetings"
        />
        <StatCard
          title="Open Slots Available"
          value={availableSlots.length}
          icon={CalendarPlus}
          color="emerald"
          subtitle="Ready for booking"
        />
        <StatCard
          title="Assigned Grievances"
          value={pendingGrievances.length}
          icon={AlertCircle}
          color="rose"
          subtitle="Department tasks"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Booking Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Pending Student Requests
              </h3>
              <p className="text-xs text-slate-400">Consultation bookings awaiting approval</p>
            </div>
            <Link
              to="/faculty/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.slice(0, 4).map((req) => (
                <div
                  key={req._id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {req.student?.name || 'Student'} ({req.student?.identifier || 'Student ID'})
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                        Agenda: {req.purpose}
                      </p>
                    </div>
                    <Badge text="Requested" variant="Requested" size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-amber-200/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {req.date} ({req.startTime} - {req.endTime})
                    </span>
                    <Link
                      to="/faculty/appointments"
                      className="font-bold text-brand-600 hover:text-brand-700"
                    >
                      Respond →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No pending appointment requests from students.
              </p>
            )}
          </div>
        </div>

        {/* Assigned Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Department Grievances</h3>
              <p className="text-xs text-slate-400">Issues assigned to your department</p>
            </div>
            <Link
              to="/faculty/complaints"
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
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                    <Badge text={c.status} variant={c.status} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Priority: <strong>{c.priority}</strong></span>
                    <span>Student: {c.submittedBy?.name || 'Student'}</span>
                    <Link
                      to="/faculty/complaints"
                      className="font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Update →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No grievances currently assigned to your department.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
