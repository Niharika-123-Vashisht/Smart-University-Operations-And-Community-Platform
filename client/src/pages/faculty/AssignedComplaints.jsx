import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Send,
  Eye,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [note, setNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/complaints');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      showToast('Failed to load grievances.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (newStatus === 'Resolved' && !resolutionNotes.trim()) {
      showToast('Please provide resolution notes before resolving.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        note,
        resolutionNotes,
      });

      showToast(`Complaint status updated to "${newStatus}"!`, 'success');
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaint._id ? res.data.complaint : c))
      );
      setUpdateModalOpen(false);
      setNote('');
      setResolutionNotes('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading assigned grievances..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Departmental Grievance Resolution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track issues assigned to your department, update remediation progress, and submit official resolution notes.
        </p>
      </div>

      {complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      #{c._id.slice(-6)}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{c.title}</h3>
                    <Badge text={c.status} variant={c.status} size="sm" />
                    <Badge text={c.priority} variant={c.priority} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedComplaint(c);
                      setNewStatus(c.status === 'Assigned' ? 'In Progress' : 'Resolved');
                      setUpdateModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Update Resolution</span>
                  </button>
                </div>
              </div>

              {/* Submitter & Department Info */}
              <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Student: <strong>{c.submittedBy?.name || 'Student'}</strong> ({c.submittedBy?.identifier || 'ID'})
                  </span>
                  <span>Category: <strong>{c.category}</strong></span>
                </div>
                <span>Submitted: {formatDateTime(c.createdAt)}</span>
              </div>

              {c.resolutionNotes && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <span className="font-bold block mb-0.5">Recorded Resolution:</span>
                  <p>{c.resolutionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No grievances assigned"
          description="Your department has no outstanding complaints assigned at this time."
        />
      )}

      {/* Update Status Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          title={`Update Grievance #${selectedComplaint._id.slice(-6)}`}
          subtitle={selectedComplaint.title}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="In Progress">In Progress (Remediation Underway)</option>
                <option value="Resolved">Resolved (Work Finished & Verified)</option>
              </select>
            </div>

            {newStatus === 'Resolved' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Resolution Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail actions taken, repairs performed, or policy adjustments..."
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Progress Remarks / Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Electrician team dispatched to the site"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
