import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  CheckCheck,
  User,
  MessageSquare,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function FacultyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [actionId, setActionId] = useState(null);

  // Response Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [facultyNotes, setFacultyNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAccept = async (app) => {
    try {
      setActionId(app._id);
      const res = await axiosClient.put(`/appointments/${app._id}/respond`, {
        action: 'accept',
        meetingLocation: app.meetingLocation,
      });

      showToast(`Appointment with ${app.student?.name} accepted!`, 'success');
      setAppointments((prev) =>
        prev.map((a) => (a._id === app._id ? res.data.appointment : a))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not accept appointment.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for declining.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/appointments/${selectedApp._id}/respond`, {
        action: 'reject',
        rejectionReason,
      });

      showToast('Appointment request declined.', 'info');
      setAppointments((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? res.data.appointment : a))
      );
      setRejectModalOpen(false);
      setRejectionReason('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not decline appointment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/appointments/${selectedApp._id}/complete`, {
        facultyNotes,
      });

      showToast('Consultation marked completed.', 'success');
      setAppointments((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? res.data.appointment : a))
      );
      setCompleteModalOpen(false);
      setFacultyNotes('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not complete appointment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((a) => {
    // Only show appointments that have been booked by a student
    if (!a.student) return false;
    if (activeTab === 'All') return true;
    return a.status === activeTab;
  });

  if (loading) {
    return <Loader text="Loading consultation requests..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Student Consultations & Advising
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review student consultation requests, confirm appointments, and log meeting notes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Requested', 'Accepted', 'Completed', 'Rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => {
            const isRequested = app.status === 'Requested';
            const isAccepted = app.status === 'Accepted';
            const isBusy = actionId === app._id;

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {app.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{app.student?.name}</h3>
                        <p className="text-xs text-slate-500">
                          {app.student?.identifier || 'Student ID'} • {app.student?.email}
                        </p>
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
                      <span>{app.meetingLocation}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Consultation Agenda:
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">{app.purpose}</p>
                    </div>

                    {app.facultyNotes && (
                      <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                          My Notes / Instructions:
                        </span>
                        <p>{app.facultyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {isRequested && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setRejectModalOpen(true);
                        }}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccept(app)}
                        disabled={isBusy}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        {isBusy ? (
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Accept Consultation</span>
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setCompleteModalOpen(true);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark Session Completed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No consultations found"
          description="There are no student appointment requests under this tab."
        />
      )}

      {/* Reject Modal */}
      {selectedApp && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Decline Consultation Request"
          subtitle={`Student: ${selectedApp.student?.name} (${selectedApp.date})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reason for Declining *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Department meeting scheduled at this time. Please request next Tuesday slot."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? 'Submitting...' : 'Confirm Decline'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Complete Modal */}
      {selectedApp && (
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title="Complete Consultation Session"
          subtitle={`Session with ${selectedApp.student?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Follow-up Remarks / Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={facultyNotes}
                onChange={(e) => setFacultyNotes(e.target.value)}
                placeholder="e.g. Discussed chapter 4, advised student to implement test suites before next review."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? 'Marking...' : 'Mark Session Completed'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
