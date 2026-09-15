import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  FilePlus,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Users,
  Compass,
  Search,
  BookOpen,
  HelpCircle,
  Megaphone,
  Building2,
  BarChart3,
  MessageSquareHeart,
  X,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/complaints', label: 'My Complaints', icon: AlertCircle },
    { to: '/student/complaints/new', label: 'File Grievance', icon: FilePlus },
    { to: '/student/appointments/book', label: 'Book Faculty Slot', icon: CalendarPlus },
    { to: '/student/appointments', label: 'My Appointments', icon: CalendarCheck },
    { to: '/events', label: 'Campus Events', icon: Compass },
    { to: '/lost-found', label: 'Lost & Found', icon: Search },
    { to: '/skills', label: 'Skill Exchange', icon: BookOpen },
    { to: '/skills/requests', label: 'Help Requests Board', icon: HelpCircle },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/slots', label: 'Manage Time Slots', icon: CalendarPlus },
    { to: '/faculty/appointments', label: 'Consultations', icon: CalendarCheck },
    { to: '/faculty/complaints', label: 'Assigned Complaints', icon: AlertCircle },
    { to: '/events', label: 'Campus Events', icon: Compass },
    { to: '/lost-found', label: 'Lost & Found', icon: Search },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
    { to: '/admin/complaints', label: 'Complaint Center', icon: AlertCircle },
    { to: '/admin/events', label: 'Event Manager', icon: Compass },
    { to: '/admin/announcements', label: 'Announcements Hub', icon: Megaphone },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/lost-found', label: 'Lost & Found', icon: Search },
    { to: '/admin/feedback', label: 'Platform Feedback', icon: MessageSquareHeart },
  ];

  const navLinks =
    role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand heading */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">UniPlatform</span>
              <span className="text-[10px] text-brand-400 font-medium tracking-wide uppercase">
                {role} Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom user badge */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-700/60 border border-brand-500/30 text-brand-300 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.identifier || user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
