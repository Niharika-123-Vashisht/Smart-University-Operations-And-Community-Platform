import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  User,
  Search,
  HandHelping,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import { SKILL_CATEGORIES } from '../../utils/constants';

export default function HelpRequestsBoard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const prefilledSkill = searchParams.get('needed') || '';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // 'all' or 'my'
  const [searchQuery, setSearchQuery] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(!!prefilledSkill);

  // New Request Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(SKILL_CATEGORIES[0]);
  const [skillNeeded, setSkillNeeded] = useState(prefilledSkill);
  const [urgency, setUrgency] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const { showToast } = useNotifications();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/help-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      showToast('Failed to load help requests board.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !skillNeeded.trim() || !description.trim()) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.post('/help-requests', {
        title,
        category,
        skillNeeded,
        urgency,
        description,
      });

      showToast('Help request posted! Peers with this skill were notified.', 'success');
      setRequests((prev) => [res.data.request, ...prev]);
      setTitle('');
      setDescription('');
      setPostModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      setActionId(id);
      const res = await axiosClient.put(`/help-requests/${id}/accept`);
      showToast('You accepted to help this student! Contact details unlocked.', 'success');
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? res.data.request : r))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not accept request.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleCompleteRequest = async (id) => {
    try {
      setActionId(id);
      const res = await axiosClient.put(`/help-requests/${id}/complete`, {
        resolutionNote: 'Completed collaboratively between peer students.',
      });
      showToast('Help request marked completed! Great teamwork.', 'success');
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? res.data.request : r))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not complete request.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const isMy =
      r.student?._id === user?._id || r.acceptedBy?._id === user?._id;
    if (activeView === 'my' && !isMy) return false;

    const query = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      r.skillNeeded.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Loader text="Loading peer help board..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Peer Assistance & Help Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Collaborate on coursework, debug tricky code, and exchange academic guidance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPostModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask for Peer Help</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Open Requests
          </button>
          <button
            type="button"
            onClick={() => setActiveView('my')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'my'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Activity & Claims
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic or skill needed..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Help Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isAuthor = req.student?._id === user?._id;
            const isAcceptedByMe = req.acceptedBy?._id === user?._id;
            const isOpen = req.status === 'Open';
            const isBusy = actionId === req._id;

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                      Skill: {req.skillNeeded}
                    </span>
                    <Badge text={req.urgency} variant={req.urgency} size="sm" />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2 leading-snug">
                    {req.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{req.student?.name || 'Student'}</strong>
                    </span>
                    <Badge text={req.status} variant={req.status} size="sm" />
                  </div>

                  {req.acceptedBy && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                        Assisting Peer:
                      </span>
                      <p className="font-semibold">{req.acceptedBy.name}</p>
                      <p className="text-[11px] text-emerald-700">{req.acceptedBy.email}</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  {isOpen && !isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req._id)}
                      disabled={isBusy}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isBusy ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HandHelping className="w-4 h-4" />
                      )}
                      <span>I Can Help With This</span>
                    </button>
                  )}

                  {isOpen && isAuthor && (
                    <div className="py-2 text-center text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                      Waiting for a peer to accept
                    </div>
                  )}

                  {req.status === 'Accepted' && (isAuthor || isAcceptedByMe) && (
                    <button
                      type="button"
                      onClick={() => handleCompleteRequest(req._id)}
                      disabled={isBusy}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Solved / Completed</span>
                    </button>
                  )}

                  {req.status === 'Completed' && (
                    <div className="py-2 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      ✓ Successfully Resolved
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No help requests found"
          description="Have a question or stuck on a concept? Post a request to the community!"
          actionText="Post Request"
          onAction={() => setPostModalOpen(true)}
        />
      )}

      {/* New Help Request Modal */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title="Post Peer Help Request"
        subtitle="Connect with students who have listed this skill in their profile."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need assistance resolving React state re-rendering glitch"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {SKILL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Low">Low (General Query)</option>
                <option value="Medium">Medium (Coursework)</option>
                <option value="High">High (Upcoming Deadline)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Skill Needed *
            </label>
            <input
              type="text"
              required
              value={skillNeeded}
              onChange={(e) => setSkillNeeded(e.target.value)}
              placeholder="e.g. React, MongoDB, Calculus, Digital Circuits"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              What do you need help with? *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what you are trying to solve and where you are stuck..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPostModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
            >
              {submitting ? 'Broadcasting...' : 'Post Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
