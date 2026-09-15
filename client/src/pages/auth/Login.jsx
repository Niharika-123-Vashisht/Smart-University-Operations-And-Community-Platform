import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  UserCheck,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      const target =
        location.state?.from?.pathname ||
        (user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'faculty'
          ? '/faculty/dashboard'
          : '/student/dashboard');

      navigate(target, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click demo account filler
  const fillDemoAccount = (roleType) => {
    if (roleType === 'student') {
      setEmail('student@university.edu');
      setPassword('password123');
    } else if (roleType === 'faculty') {
      setEmail('rajesh.sharma@university.edu');
      setPassword('password123');
    } else if (roleType === 'admin') {
      setEmail('admin@university.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Smart University Platform
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-400">
          Centralized Campus Operations & Academic Community Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100/20">
          {/* 1-Click Demo Accounts Banner */}
          <div className="mb-6 p-3 bg-brand-50/70 border border-brand-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>1-Click Evaluator Demo Sign In:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('student')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white hover:bg-brand-50 text-slate-700 border border-brand-200 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <GraduationCap className="w-3 h-3 text-emerald-600" />
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('faculty')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white hover:bg-brand-50 text-slate-700 border border-brand-200 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <Briefcase className="w-3 h-3 text-indigo-600" />
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-2 py-1.5 text-[11px] font-semibold bg-white hover:bg-brand-50 text-slate-700 border border-brand-200 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New student or faculty member?{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
