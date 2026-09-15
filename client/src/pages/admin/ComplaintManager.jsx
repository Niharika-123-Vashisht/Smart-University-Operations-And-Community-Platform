import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import {
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Eye,
  Building2,
  Clock,
  Send,
  User,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../../utils/constants';

export default function ComplaintManager() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Form states for Assignment
  const [assignDept, setAssignDept] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignNote, setAssignNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes, facRes] = await Promise.all([
        axiosClient.get('/complaints'),
        axiosClient.get('/departments'),
        axiosClient.get('/users/faculty'),
      ]);

      setComplaints(compRes.data.complaints || []);
      setDepartments(deptRes.data.departments || []);
      setFacultyList(facRes.data.faculty || []);
    } catch (err) {
      showToast('Failed to load complaint management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignDept(complaint.department?._id || (departments[0]?._id || ''));
    setAssignedTo(complaint.assignedTo?._id || '');
    setPriority(complaint.priority || 'Medium');
    setAssignNote('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/complaints/${selectedComplaint._id}/assign`, {
        department: assignDept || null,
        assignedTo: assignedTo || null,
        priority,
        note: assignNote || `Assigned to department authority with priority ${priority}`,
      });

      showToast('Grievance successfully assigned!', 'success');
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaint._id ? res.data.complaint : c))
      );
      setAssignModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not assign complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'ID & Title',
      render: (row) => (
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            #{row._id.slice(-6)}
          </span>
          <span className="font-bold text-slate-900 line-clamp-1">{row.title}</span>
          <span className="text-xs text-slate-400 block">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Submitted By',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.submittedBy?.name || 'Student'}</span>
          <span className="text-xs text-slate-400">{row.submittedBy?.identifier || row.submittedBy?.email}</span>
        </div>
      ),
    },
    {
      header: 'Department / Assigned',
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-700 block">
            {row.department?.name || 'General Campus'}
          </span>
          <span className="text-xs text-slate-500">
            {row.assignedTo ? `Officer: ${row.assignedTo.name}` : 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (row) => <Badge text={row.priority} variant={row.priority} size="sm" />,
    },
    {
      header: 'Status',
      render: (row) => <Badge text={row.status} variant={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openAssignModal(row)}
            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 border border-brand-200 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Assign Department & Person"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedComplaint(row);
              setDetailsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="View Details & Audit Log"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading complaint command center..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Campus Grievance Triage Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Supervise university-wide student complaints, assign responsible personnel, prioritize issues, and review audit records.
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={complaints}
        searchKey="title"
        searchPlaceholder="Search complaints by title, keyword, or student..."
        emptyTitle="No grievances found"
        emptyDescription="All filed complaints have been reviewed."
      />

      {/* Assign Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Grievance #${selectedComplaint._id.slice(-6)}`}
          subtitle={selectedComplaint.title}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign Department *
              </label>
              <select
                value={assignDept}
                onChange={(e) => setAssignDept(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign Responsible Faculty / Officer
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- Select Faculty / Handler --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.department?.code || 'FAC'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Set Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assignment Note / Instructions
              </label>
              <input
                type="text"
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                placeholder="e.g. Inspect site immediately and coordinate with hostel warden"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Details & Audit Trail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Grievance Audit Trail #${selectedComplaint._id.slice(-6)}`}
          subtitle={selectedComplaint.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Submitted By:</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedComplaint.submittedBy?.name} ({selectedComplaint.submittedBy?.email})
                </span>
              </div>
              <Badge text={selectedComplaint.status} variant={selectedComplaint.status} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.resolutionNotes && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-0.5">Resolution Notes:</h4>
                <p className="text-xs text-emerald-800">{selectedComplaint.resolutionNotes}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Audit Timeline History
              </h4>
              <div className="space-y-2.5 pl-2 border-l-2 border-brand-200">
                {selectedComplaint.statusHistory?.map((h, i) => (
                  <div key={i} className="relative pl-3 text-xs">
                    <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
                    <div className="flex justify-between">
                      <strong className="text-slate-800">{h.status}</strong>
                      <span className="text-[10px] text-slate-400">{formatDateTime(h.timestamp)}</span>
                    </div>
                    {h.note && <p className="text-slate-500 mt-0.5">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
