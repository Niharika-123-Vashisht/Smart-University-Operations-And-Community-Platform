import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  BookOpen,
  PlusCircle,
  Search,
  User,
  Clock,
  Trash2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../../utils/constants';

export default function SkillExchange() {
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState(SKILL_CATEGORIES[0]);
  const [proficiencyLevel, setProficiencyLevel] = useState('Intermediate');
  const [availability, setAvailability] = useState('Weekdays after 6 PM');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const { showToast } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myRes, allRes] = await Promise.all([
        axiosClient.get('/skills/my'),
        axiosClient.get('/skills'),
      ]);
      setMySkills(myRes.data.skills || []);
      setAllSkills(allRes.data.skills || []);
    } catch (err) {
      showToast('Failed to load skills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) {
      showToast('Please provide a skill name.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await axiosClient.post('/skills', {
        skillName,
        category,
        proficiencyLevel,
        availability,
        description,
      });

      showToast('Skill added to your profile!', 'success');
      setMySkills((prev) => [...prev, res.data.skill]);
      setAllSkills((prev) => [...prev, res.data.skill]);
      setSkillName('');
      setDescription('');
      setAddModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add skill.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await axiosClient.delete(`/skills/${id}`);
      showToast('Skill removed from profile.', 'info');
      setMySkills((prev) => prev.filter((s) => s._id !== id));
      setAllSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      showToast('Could not remove skill.', 'error');
    }
  };

  const filteredSkills = allSkills.filter(
    (s) =>
      s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loader text="Loading peer skills directory..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Student Peer Skill Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Share your expertise with fellow undergraduates or discover peers who can mentor you.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/skills/requests"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>Help Requests Board</span>
          </Link>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add My Skill</span>
          </button>
        </div>
      </div>

      {/* Section 1: My Skills Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>My Shared Skills</span>
            </h3>
            <p className="text-xs text-slate-500">Skills other students can reach out to you for</p>
          </div>
          <span className="text-xs font-bold text-brand-600 px-2.5 py-0.5 bg-brand-50 rounded-full">
            {mySkills.length} listed
          </span>
        </div>

        {mySkills.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mySkills.map((s) => (
              <div
                key={s._id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{s.skillName}</h4>
                    <Badge text={s.proficiencyLevel} variant={s.proficiencyLevel} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{s.availability}</span>
                  </p>
                  {s.description && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{s.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(s._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            You haven't listed any skills yet. Share what you are good at!
          </div>
        )}
      </div>

      {/* Section 2: Explore Peer Skills Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Community Skill Directory & Matcher
            </h2>
            <p className="text-xs text-slate-500">
              Find peers across all engineering disciplines with verified proficiencies
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills (e.g. Python, Figma)..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>
        </div>

        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((sk) => (
              <div
                key={sk._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {sk.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{sk.skillName}</h4>
                    </div>
                    <Badge text={sk.proficiencyLevel} variant={sk.proficiencyLevel} size="sm" />
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sk.description || 'Student willing to mentor and collaborate on peer projects.'}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Availability: {sk.availability}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">
                      {sk.user?.name?.charAt(0) || 'S'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                      {sk.user?.name || 'Student Peer'}
                    </span>
                  </div>

                  <Link
                    to={`/skills/requests?needed=${encodeURIComponent(sk.skillName)}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Request Help →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No skills found"
            description="Try searching with a different skill keyword."
          />
        )}
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Skill to Your Profile"
        subtitle="Offer mentoring or peer assistance to fellow university students."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React.js, Python, Digital Signal Processing"
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
                Proficiency
              </label>
              <select
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {PROFICIENCY_LEVELS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Availability Window
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Weekday evenings after 6 PM"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Brief Guidance Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention specific areas you can assist with..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
            >
              {saving ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
