import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Search,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import { COMPLAINT_STATUSES } from '../../utils/constants';

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { showToast } = useNotifications();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/complaints');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      showToast('Failed to load your complaints list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleConfirmResolution = async (complaintId) => {
    try {
      setConfirming(true);
      const res = await axiosClient.put(`/complaints/${complaintId}/confirm`, {
        note: 'Student confirmed satisfactory resolution via portal.',
      });

      showToast('Resolution confirmed! Grievance successfully closed.', 'success');
      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? res.data.complaint : c))
      );
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint(res.data.complaint);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not confirm resolution.', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStepIndex = (status) => {
    return COMPLAINT_STATUSES.indexOf(status);
  };

  if (loading) {
    return <Loader text="Loading your grievances..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Grievance Redressal Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit, monitor status transitions, and verify resolution of campus complaints
          </p>
        </div>
        <Link
          to="/student/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Grievance</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', ...COMPLAINT_STATUSES].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grievances..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Complaints List with 5-Stage Stepper */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const currentIdx = getStepIndex(item.status);

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        #{item._id.slice(-6)}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <Badge text={item.status} variant={item.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                    {item.status === 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => handleConfirmResolution(item._id)}
                        disabled={confirming}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Resolution</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComplaint(item);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Timeline & Details</span>
                    </button>
                  </div>
                </div>

                {/* 5-Stage Visual Workflow Stepper */}
                <div className="mt-4 pt-2">
                  <div className="grid grid-cols-5 gap-1 relative">
                    {COMPLAINT_STATUSES.map((stepName, sIdx) => {
                      const isCompleted = sIdx <= currentIdx;
                      const isCurrent = sIdx === currentIdx;

                      return (
                        <div key={stepName} className="text-center relative">
                          <div
                            className={`h-1.5 rounded-full mb-2 transition-all ${
                              isCompleted ? 'bg-brand-600' : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`text-[10px] block leading-tight font-semibold truncate ${
                              isCurrent
                                ? 'text-brand-700 font-bold'
                                : isCompleted
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {stepName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-3">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span>Priority: <strong>{item.priority}</strong></span>
                    <span>Department: <strong>{item.department?.name || 'General Campus'}</strong></span>
                  </div>
                  <span>Submitted on: {formatDateTime(item.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No grievances match this view"
          description="Try selecting a different status filter or search keyword."
          actionText="Submit Grievance"
          onAction={() => (window.location.href = '/student/complaints/new')}
        />
      )}

      {/* Details & Status Audit Trail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Complaint Audit Log #${selectedComplaint._id.slice(-6)}`}
          subtitle={selectedComplaint.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Status & Priority Badge Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <Badge text={selectedComplaint.status} variant={selectedComplaint.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Priority:</span>
                <Badge text={selectedComplaint.priority} variant={selectedComplaint.priority} />
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Resolution Information if present */}
            {selectedComplaint.resolutionNotes && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authority Resolution Remarks:</span>
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {selectedComplaint.resolutionNotes}
                </p>
                {selectedComplaint.resolvedAt && (
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Resolved at: {formatDateTime(selectedComplaint.resolvedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Status History Audit Trail */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Historical Workflow Transitions
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-brand-200">
                {selectedComplaint.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{hist.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(hist.timestamp)}
                      </span>
                    </div>
                    {hist.note && <p className="text-xs text-slate-500 mt-0.5">{hist.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              {selectedComplaint.status === 'Resolved' && (
                <button
                  type="button"
                  onClick={() => handleConfirmResolution(selectedComplaint._id)}
                  disabled={confirming}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Satisfactory Resolution</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
