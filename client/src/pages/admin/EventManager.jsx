import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import {
  Compass,
  PlusCircle,
  Trash2,
  Users,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import { EVENT_CATEGORIES } from '../../utils/constants';

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [department, setDepartment] = useState('');
  const [creating, setCreating] = useState(false);

  const { showToast } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evRes, deptRes] = await Promise.all([
        axiosClient.get('/events'),
        axiosClient.get('/departments'),
      ]);
      setEvents(evRes.data.events || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !venue || !startDate || !endDate) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    try {
      setCreating(true);
      const res = await axiosClient.post('/events', {
        title,
        description,
        category,
        venue,
        startDate,
        endDate,
        capacity: Number(capacity),
        department: department || null,
      });

      showToast('Event created and published successfully!', 'success');
      setEvents((prev) => [res.data.event, ...prev]);
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setVenue('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create event.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axiosClient.delete(`/events/${id}`);
      showToast('Event removed.', 'info');
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      showToast('Could not delete event.', 'error');
    }
  };

  const columns = [
    {
      header: 'Event Title & Category',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-brand-600 font-semibold">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Date & Venue',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.venue}</p>
          <p className="text-slate-400">{formatDateTime(row.startDate)}</p>
        </div>
      ),
    },
    {
      header: 'Capacity & Enrolled',
      render: (row) => {
        const count = row.registeredCount || row.registeredStudents?.length || 0;
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-800">{count}</span> / {row.capacity} seats
          </div>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedEvent(row);
              setAttendeesModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Attendees</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteEvent(row._id)}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading campus event management portal..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            University Events & Workshops Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organize symposia, enforce attendee caps, and view registered student rosters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={events}
        searchKey="title"
        searchPlaceholder="Search events..."
      />

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Campus Event"
        subtitle="Create workshops, seminars or tournaments with attendee capacity limits."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Robotics National Symposium 2026"
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
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Max Capacity (Seats) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Venue / Auditorium *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Central Auditorium Hall A"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of speakers, topics, and prerequisites..."
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
              {creating ? 'Publishing...' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendees Modal */}
      {selectedEvent && (
        <Modal
          isOpen={attendeesModalOpen}
          onClose={() => setAttendeesModalOpen(false)}
          title={`Registered Attendees (${selectedEvent.registeredStudents?.length || 0})`}
          subtitle={selectedEvent.title}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {selectedEvent.registeredStudents?.length > 0 ? (
              selectedEvent.registeredStudents.map((r, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-800 block">
                      {r.student?.name || 'Registered Student'}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {r.student?.identifier || r.student?.email || 'Enrolled'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(r.registeredAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No students have registered for this event yet.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
