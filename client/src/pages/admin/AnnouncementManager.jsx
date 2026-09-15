import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Megaphone, PlusCircle, Trash2, Pin } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('Normal');
  const [targetAudience, setTargetAudience] = useState('All');
  const [isPinned, setIsPinned] = useState(false);
  const [creating, setCreating] = useState(false);

  const { showToast } = useNotifications();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      showToast('Failed to load announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    try {
      setCreating(true);
      const res = await axiosClient.post('/announcements', {
        title,
        content,
        category,
        priority,
        targetAudience,
        isPinned,
      });

      showToast('Announcement broadcasted successfully!', 'success');
      setAnnouncements((prev) => [res.data.announcement, ...prev]);
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setIsPinned(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not publish announcement.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement broadcast?')) return;
    try {
      await axiosClient.delete(`/announcements/${id}`);
      showToast('Announcement removed.', 'info');
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      showToast('Could not delete announcement.', 'error');
    }
  };

  const columns = [
    {
      header: 'Announcement',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            {row.isPinned && <Pin className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />}
            <span className="font-bold text-slate-900 line-clamp-1">{row.title}</span>
          </div>
          <span className="text-xs text-slate-500 line-clamp-1">{row.content}</span>
        </div>
      ),
    },
    {
      header: 'Category & Audience',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{row.category}</span>
          <span className="text-slate-400">Audience: {row.targetAudience}</span>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (row) => <Badge text={row.priority} variant={row.priority} size="sm" />,
    },
    {
      header: 'Published At',
      render: (row) => (
        <span className="text-xs text-slate-400">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleDelete(row._id)}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading announcements hub..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            University Announcements & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Broadcast urgent circulars, administrative alerts, and departmental notices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Broadcast</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={announcements}
        searchKey="title"
        searchPlaceholder="Search broadcasts..."
      />

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast University Announcement"
        subtitle="Notify campus community members with target role priority"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule for Autumn Mid-Term Examinations"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Examination">Examination</option>
                <option value="Event">Event</option>
                <option value="Urgent Alert">Urgent Alert</option>
                <option value="Placement">Placement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent (Notifies Users)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="All">All University</option>
                <option value="Student">Students Only</option>
                <option value="Faculty">Faculty Only</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span>Pin to top of boards</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notice Content *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full details of notice or instructions..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
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
              {creating ? 'Broadcasting...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
