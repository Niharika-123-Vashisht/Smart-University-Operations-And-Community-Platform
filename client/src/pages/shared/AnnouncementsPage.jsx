import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Megaphone, Pin, Search, Calendar, User } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/announcements');
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        showToast('Failed to load announcements feed.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((ann) => {
    const matchesCategory =
      selectedCategory === 'All' || ann.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ann.title.toLowerCase().includes(query) ||
      ann.content.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <Loader text="Loading campus notice boards..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Campus Circulars & Official Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Stay informed about academic schedules, emergency notices, and institutional circulars.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Academic', 'Examination', 'Administrative', 'Event', 'Urgent Alert'].map(
            (cat) => (
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
            )
          )}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Feed List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const isUrgent = ann.priority === 'Urgent';

            return (
              <div
                key={ann._id}
                className={`rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all ${
                  isUrgent
                    ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <span className="p-1 rounded-md bg-brand-100 text-brand-700" title="Pinned">
                          <Pin className="w-3.5 h-3.5 fill-brand-700" />
                        </span>
                      )}
                      <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                      <Badge text={ann.priority} variant={ann.priority} size="sm" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {ann.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(ann.createdAt)}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Issued by: <strong>{ann.author?.name || 'Administration'}</strong>
                  </span>
                  <span>Target Audience: <strong>{ann.targetAudience}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No circulars found"
          description="There are no announcements matching your filter."
        />
      )}
    </div>
  );
}
