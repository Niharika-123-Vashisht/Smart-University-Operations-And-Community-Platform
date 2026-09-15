import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import DataTable from '../../components/common/DataTable';
import { Star, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotifications();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/feedback');
      setFeedbacks(res.data.feedbacks || []);
      setAverageRating(res.data.averageRating || 0);
    } catch (err) {
      showToast('Failed to load platform feedback submissions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/feedback/${id}`);
      showToast('Feedback removed.', 'info');
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      showToast('Could not delete feedback.', 'error');
    }
  };

  const columns = [
    {
      header: 'Rating & Category',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < row.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-800 ml-1">({row.rating}/5)</span>
          </div>
          <span className="text-xs text-brand-600 font-medium">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Comment',
      render: (row) => (
        <p className="text-xs text-slate-700 max-w-md leading-relaxed">{row.comment}</p>
      ),
    },
    {
      header: 'Submitted By',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{row.user?.name || 'Anonymous'}</span>
          <span className="text-slate-400 capitalize">{row.user?.role || 'User'}</span>
        </div>
      ),
    },
    {
      header: 'Date',
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
    return <Loader text="Loading feedback submissions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Platform Feedback & Satisfaction Scores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review student sentiment, comments on campus facilities, and institutional satisfaction.
          </p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Average Score:
          </span>
          <span className="text-xl font-bold text-brand-600 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            {averageRating} / 5.0
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={feedbacks}
        searchKey="comment"
        searchPlaceholder="Search comments..."
      />
    </div>
  );
}
