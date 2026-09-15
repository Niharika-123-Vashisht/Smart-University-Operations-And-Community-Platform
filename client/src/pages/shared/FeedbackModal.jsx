import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Star, Send } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('Platform Experience');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter your comments.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post('/feedback', {
        rating,
        category,
        comment,
      });

      showToast('Thank you! Your feedback has been submitted.', 'success');
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Platform Feedback & Suggestions"
      subtitle="Help us improve university operations by sharing your thoughts."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating stars */}
        <div className="text-center py-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Overall Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {rating === 5 && 'Outstanding Experience'}
            {rating === 4 && 'Very Good'}
            {rating === 3 && 'Average'}
            {rating === 2 && 'Needs Improvement'}
            {rating === 1 && 'Poor'}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="Platform Experience">Platform Experience</option>
            <option value="Campus Facilities">Campus Facilities</option>
            <option value="Academic Services">Academic Services</option>
            <option value="Hostel & Mess">Hostel & Mess</option>
            <option value="Events & Activities">Events & Activities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Comments & Feedback
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience or suggestion for campus operations..."
            required
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            {submitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Feedback</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
