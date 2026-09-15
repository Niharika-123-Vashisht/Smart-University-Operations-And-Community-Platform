import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarPlus,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';

export default function SlotManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTomorrowStr());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [meetingLocation, setMeetingLocation] = useState('Faculty Cabin');
  const [creating, setCreating] = useState(false);

  const { showToast } = useNotifications();

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/appointments/my');
      setSlots(res.data.appointments || []);
    } catch (err) {
      showToast('Failed to load slots.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      showToast('Please specify date and time range.', 'warning');
      return;
    }

    try {
      setCreating(true);
      const res = await axiosClient.post('/appointments/slots', {
        date,
        startTime,
        endTime,
        meetingLocation,
      });

      showToast('Time slot opened and made available for students!', 'success');
      setSlots((prev) => [res.data.slot, ...prev]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create time slot.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await axiosClient.delete(`/appointments/${slotId}`);
      showToast('Slot removed from schedule.', 'info');
      setSlots((prev) => prev.filter((s) => s._id !== slotId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot remove active slot.', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading your consultation slots..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Faculty Schedule & Slot Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Publish consultation time slots to prevent double-booking and streamline student advising.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create New Slot Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CalendarPlus className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Add Available Time Slot</h3>
          </div>

          <form onSubmit={handleCreateSlot} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Meeting Location / Cabin
              </label>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="e.g. Faculty Cabin 304 or Google Meet link"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {creating ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CalendarPlus className="w-4 h-4" />
              )}
              <span>Publish Slot</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Slots Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              My Published Schedule ({slots.length})
            </h3>
            <span className="text-xs text-slate-500">
              {slots.filter((s) => s.status === 'Available').length} currently open
            </span>
          </div>

          {slots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((s) => {
                const isAvailable = s.status === 'Available';

                return (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {s.date}
                        </span>
                        <Badge text={s.status} variant={s.status} size="sm" />
                      </div>

                      <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {s.startTime} – {s.endTime}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.meetingLocation}</span>
                        </p>
                      </div>

                      {s.student && (
                        <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Booked Student:
                          </span>
                          <p className="font-semibold text-slate-800">{s.student.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{s.purpose}</p>
                        </div>
                      )}
                    </div>

                    {isAvailable && (
                      <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(s._id)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Slot</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No consultation slots published"
              description="Use the form on the left to add available time slots for your students."
            />
          )}
        </div>
      </div>
    </div>
  );
}
