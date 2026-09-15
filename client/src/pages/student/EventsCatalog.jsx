import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Compass,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { EVENT_CATEGORIES } from '../../utils/constants';

export default function EventsCatalog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const { showToast } = useNotifications();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/events');
      setEvents(res.data.events || []);
    } catch (err) {
      showToast('Failed to load events catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      setProcessingId(eventId);
      const res = await axiosClient.post(`/events/${eventId}/register`);
      showToast('Successfully registered for event!', 'success');
      // Update local event state
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                isUserRegistered: true,
                registeredStudents: [...(ev.registeredStudents || []), { _id: 'me' }],
                registeredCount: (ev.registeredCount || 0) + 1,
              }
            : ev
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not register for event.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      setProcessingId(eventId);
      await axiosClient.post(`/events/${eventId}/cancel`);
      showToast('Event registration cancelled.', 'info');
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                isUserRegistered: false,
                registeredCount: Math.max(0, (ev.registeredCount || 1) - 1),
              }
            : ev
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel registration.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <Loader text="Loading campus events & workshops..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Campus Events & Workshops
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore technical symposia, guest seminars, hackathons, and sports tournaments.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', ...EVENT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events or venues..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const regCount = ev.registeredCount || ev.registeredStudents?.length || 0;
            const percentFilled = Math.min(100, Math.round((regCount / ev.capacity) * 100));
            const isFull = regCount >= ev.capacity;
            const isRegistered = ev.isUserRegistered;
            const isBusy = processingId === ev._id;

            return (
              <div
                key={ev._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      {ev.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(ev.startDate)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {ev.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{formatDateTime(ev.startDate)}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Capacity:</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {regCount} / {ev.capacity} seats ({percentFilled}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? 'bg-rose-500'
                            : percentFilled > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Register / Cancel Button */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  {isRegistered ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 py-2 px-3 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>You are Registered</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(ev._id)}
                        disabled={isBusy}
                        className="py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      >
                        {isBusy ? '...' : 'Cancel'}
                      </button>
                    </div>
                  ) : isFull ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed text-center"
                    >
                      Registration Full (Capacity Reached)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(ev._id)}
                      disabled={isBusy}
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isBusy ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Compass className="w-3.5 h-3.5" />
                      )}
                      <span>Register for Event</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No events found"
          description="There are currently no events matching your category or search term."
        />
      )}
    </div>
  );
}
