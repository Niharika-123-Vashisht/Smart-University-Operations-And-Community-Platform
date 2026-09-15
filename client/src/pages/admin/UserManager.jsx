import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Users, Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit fields
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [uRes, dRes] = await Promise.all([
        axiosClient.get('/users'),
        axiosClient.get('/departments'),
      ]);
      setUsers(uRes.data.users || []);
      setDepartments(dRes.data.departments || []);
    } catch (err) {
      showToast('Failed to load user directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setRole(user.role);
    setDepartment(user.department?._id || '');
    setIdentifier(user.identifier || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/users/${selectedUser._id}`, {
        role,
        department: department || null,
        identifier,
      });

      showToast('User record updated.', 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? res.data.user : u))
      );
      setEditModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      showToast('User deleted.', 'info');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      showToast('Could not delete user.', 'error');
    }
  };

  const columns = [
    {
      header: 'Name & Email',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-xs text-slate-500">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => <Badge text={row.role} variant={row.role} size="sm" />,
    },
    {
      header: 'Department / ID',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {row.department?.name || 'Unassigned'}
          </span>
          <span className="text-slate-400">{row.identifier || 'No ID assigned'}</span>
        </div>
      ),
    },
    {
      header: 'Registered At',
      render: (row) => (
        <span className="text-xs text-slate-400">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteUser(row._id)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading user management directory..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Campus User Accounts & Roles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage enrolled students, academic faculty, and administrative permissions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users by name, email, or identifier..."
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit User: ${selectedUser.name}`}
          subtitle={selectedUser.email}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Role Permission
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- No Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Roll Number / Employee ID
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
