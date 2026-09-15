import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  User,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/appointments/my');
        setAppointments(res.data.appointments || []);
      } catch (err) {
        showToast('Failed to load appointments.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    if (activeFilter === 'All') return true;
    return a.status === activeFilter;
  });

  if (loading) {
    return <Loader text="Loading your scheduled appointments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Faculty Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor the status of your faculty consultations and view meeting location notes
          </p>
        </div>
        <Link
          to="/student/appointments/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Requested', 'Accepted', 'Completed', 'Rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                      {app.faculty?.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{app.faculty?.name}</h3>
                      <p className="text-xs text-slate-500">{app.faculty?.email}</p>
                    </div>
                  </div>
                  <Badge text={app.status} variant={app.status} size="sm" />
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span className="font-semibold text-slate-800">{app.date}</span>
                    <span className="text-slate-400">•</span>
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      {app.startTime} – {app.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Venue: <strong>{app.meetingLocation}</strong></span>
                  </div>

                  {app.purpose && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Agenda:
                      </span>
                      <p className="text-slate-700 leading-relaxed">{app.purpose}</p>
                    </div>
                  )}

                  {/* Rejection reason or faculty remarks */}
                  {app.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
                        Decline Reason:
                      </span>
                      <p className="leading-relaxed">{app.rejectionReason}</p>
                    </div>
                  )}

                  {app.facultyNotes && (
                    <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-800 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                        Faculty Instructions:
                      </span>
                      <p className="leading-relaxed">{app.facultyNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-right">
                Requested on: {formatDateTime(app.createdAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No appointments found"
          description="You don't have any appointments matching this filter."
          actionText="Book Consultation"
          onAction={() => (window.location.href = '/student/appointments/book')}
        />
      )}
    </div>
  );
}
