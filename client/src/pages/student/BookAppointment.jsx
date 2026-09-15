import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Building2,
  Search,
  CheckCircle,
  CalendarPlus,
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function BookAppointment() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [booking, setBooking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/users/faculty');
        setFacultyList(res.data.faculty || []);
      } catch (err) {
        showToast('Failed to load faculty directory.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const handleSelectFaculty = async (faculty) => {
    setSelectedFaculty(faculty);
    try {
      setLoadingSlots(true);
      const res = await axiosClient.get(`/appointments/faculty/${faculty._id}/slots`);
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      showToast('Could not fetch available slots for this faculty.', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      showToast('Please state the purpose of your appointment.', 'warning');
      return;
    }

    try {
      setBooking(true);
      await axiosClient.post(`/appointments/${selectedSlot._id}/book`, {
        purpose,
      });

      showToast(
        'Appointment requested successfully! Awaiting faculty acceptance.',
        'success'
      );
      // Remove booked slot from local view
      setAvailableSlots((prev) => prev.filter((s) => s._id !== selectedSlot._id));
      setSelectedSlot(null);
      setPurpose('');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Double booking collision or slot unavailable.',
        'error'
      );
    } finally {
      setBooking(false);
    }
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loader text="Loading faculty members directory..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Faculty Consultation Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse academic professors, inspect real-time available calendar slots, and schedule 1-on-1 consultations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by faculty name or department..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((f) => {
          const isSelected = selectedFaculty?._id === f._id;

          return (
            <div
              key={f._id}
              className={`bg-white rounded-2xl border p-5 shadow-card transition-all duration-200 flex flex-col justify-between ${
                isSelected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-base flex items-center justify-center shadow-sm flex-shrink-0">
                    {f.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{f.name}</h3>
                    <p className="text-xs font-semibold text-brand-600 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-500" />
                      <span>{f.department?.name || 'Department Faculty'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{f.email}</span>
                    </p>
                  </div>
                </div>

                {f.bio && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {f.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectFaculty(f)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Viewing Available Slots' : 'View Available Slots'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Faculty Slots Section */}
      {selectedFaculty && (
        <div className="mt-8 bg-white rounded-2xl border border-brand-200 p-6 shadow-card animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Live Slot Availability
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Available Consultation Slots with {selectedFaculty.name}
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200 self-start sm:self-auto">
              {availableSlots.length} slot(s) open
            </span>
          </div>

          {loadingSlots ? (
            <div className="py-10">
              <Loader text="Loading schedule..." />
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {slot.date}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Open
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.meetingLocation}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className="mt-4 w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Request Booking</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No available appointment slots at this time. Please check back later or check another faculty member.
            </div>
          )}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title="Confirm Appointment Booking"
          subtitle={`With ${selectedFaculty?.name} on ${selectedSlot.date}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleBookSlot} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{selectedSlot.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time:</span>
                <span className="font-bold text-slate-800">
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-800">{selectedSlot.meetingLocation}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Consultation Agenda / Purpose *
              </label>
              <textarea
                required
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Capstone project architecture review and query on MongoDB aggregation..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={booking}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                {booking ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>Confirm Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
