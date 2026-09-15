import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { LOST_FOUND_CATEGORIES } from '../../utils/constants';

export default function LostFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All'); // 'All', 'Lost', 'Found'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [type, setType] = useState('Lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(LOST_FOUND_CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/lost-found');
      setItems(res.data.items || []);
    } catch (err) {
      showToast('Failed to load Lost & Found items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePostItem = async (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('date', itemDate);
      formData.append('contactPhone', contactPhone);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await axiosClient.post('/lost-found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast(`${type} item listed on campus board!`, 'success');
      setItems((prev) => [res.data.item, ...prev]);
      setPostModalOpen(false);
      setTitle('');
      setLocation('');
      setDescription('');
      setImageFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveItem = async (itemId) => {
    try {
      const res = await axiosClient.put(`/lost-found/${itemId}/resolve`, {
        resolutionNote: 'Marked resolved/claimed by user.',
      });

      showToast('Item status updated to Resolved/Claimed!', 'success');
      setItems((prev) =>
        prev.map((it) => (it._id === itemId ? res.data.item : it))
      );
      if (selectedItem?._id === itemId) {
        setSelectedItem(res.data.item);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not resolve item.', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = activeType === 'All' || item.type === activeType;
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    return matchesType && matchesCategory && matchesSearch;
  });

  if (loading) {
    return <Loader text="Loading campus Lost & Found board..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Campus Lost & Found Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Report misplaced belongings or help reconnect recovered items with their owners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPostModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Type selector */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {['All', 'Lost', 'Found'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeType === t
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t} Items
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {LOST_FOUND_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, locations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isOwner = item.postedBy?._id === user?._id || user?.role === 'admin';
            const isOpen = item.status === 'Open';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <Badge text={item.type} variant={item.type} size="sm" />
                    <Badge text={item.status} variant={item.status} size="sm" />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Details →
                  </button>

                  {isOpen && isOwner && (
                    <button
                      type="button"
                      onClick={() => handleResolveItem(item._id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Claimed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No items found"
          description="There are no lost or found records matching your selected filter."
          actionText="Report Item"
          onAction={() => setPostModalOpen(true)}
        />
      )}

      {/* Report Item Modal */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title="Report Lost or Found Belonging"
        subtitle="Broadcast item details across campus boards for quick recovery."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handlePostItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('Lost')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'Lost' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              I Lost An Item
            </button>
            <button
              type="button"
              onClick={() => setType('Found')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'Found' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              I Found An Item
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue HP Pavilion Laptop Sleeve"
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
                {LOST_FOUND_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Approximate Date *
              </label>
              <input
                type="date"
                required
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library 2nd Floor"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description / Distinguishing Marks *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Color, brand name, stickers, or specific contents..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPostModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
            >
              {submitting ? 'Posting...' : 'Post to Board'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`${selectedItem.type}: ${selectedItem.title}`}
          subtitle={`Category: ${selectedItem.category}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Badge text={selectedItem.type} variant={selectedItem.type} />
              <Badge text={selectedItem.status} variant={selectedItem.status} />
            </div>

            {selectedItem.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 flex items-center justify-center bg-slate-900">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="max-h-48 object-contain"
                />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p>Location: <strong>{selectedItem.location}</strong></p>
              <p>Approximate Date: <strong>{formatDate(selectedItem.date)}</strong></p>
              <p>Reported By: <strong>{selectedItem.postedBy?.name || 'Campus Member'}</strong></p>
              {selectedItem.contactPhone && (
                <p className="flex items-center gap-1.5 text-brand-700 font-bold">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span>Call: {selectedItem.contactPhone}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
