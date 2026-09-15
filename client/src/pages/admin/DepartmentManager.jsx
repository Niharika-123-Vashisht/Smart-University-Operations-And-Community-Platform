import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { Building2, PlusCircle, Trash2, Mail, MapPin } from 'lucide-react';

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [creating, setCreating] = useState(false);

  const { showToast } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, facRes] = await Promise.all([
        axiosClient.get('/departments'),
        axiosClient.get('/users/faculty'),
      ]);
      setDepartments(deptRes.data.departments || []);
      setFacultyList(facRes.data.faculty || []);
    } catch (err) {
      showToast('Failed to load academic departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      showToast('Please provide both department name and code.', 'warning');
      return;
    }

    try {
      setCreating(true);
      const res = await axiosClient.post('/departments', {
        name,
        code: code.toUpperCase(),
        description,
        contactEmail,
        officeLocation,
        headOfDepartment: headOfDepartment || null,
      });

      showToast('Academic department added successfully!', 'success');
      setDepartments((prev) => [...prev, res.data.department]);
      setCreateModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setContactEmail('');
      setOfficeLocation('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add department.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this department?')) return;
    try {
      await axiosClient.delete(`/departments/${id}`);
      showToast('Department removed.', 'info');
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      showToast('Could not delete department.', 'error');
    }
  };

  const columns = [
    {
      header: 'Department & Code',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
            {row.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Head of Department (HOD)',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.headOfDepartment?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Contact & Location',
      render: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <p className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.contactEmail || 'N/A'}</span>
          </p>
          <p className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{row.officeLocation || 'N/A'}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleDeleteDepartment(row._id)}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading department records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Academic Departments Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage academic divisions, assign HOD professors, and configure contact offices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        searchKey="name"
        searchPlaceholder="Search departments..."
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Academic Department"
        subtitle="Configure department metadata and assign head professor"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Civil & Environmental Engineering"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CEE"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign HOD
              </label>
              <select
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">-- Select Faculty --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="dept@university.edu"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Office Location
            </label>
            <input
              type="text"
              value={officeLocation}
              onChange={(e) => setOfficeLocation(e.target.value)}
              placeholder="e.g. Block C, Room 202"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
            >
              {creating ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
