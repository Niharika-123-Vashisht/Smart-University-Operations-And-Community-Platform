import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useNotifications } from '../../context/NotificationContext';
import { Search, PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // Lost or Found
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (typeFilter) q.append('type', typeFilter);
      const res = await axiosClient.get(`/lost-found?${q.toString()}`);
      setItems(res.data.items || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load items.', 'error');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, typeFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Lost &amp; Found</h1>
        <Link
          to="/student/lostfound/add"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700"
        >
          <PlusCircle className="w-4 h-4" /> Add Item
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Types</option>
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-slate-500">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/student/lostfound/${item._id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-800 truncate">{item.title || item.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded ${item.type === 'Lost' ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}> {item.type}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(item.date || item.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
