// src/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import {
  FiGrid,
  FiFileText,
  FiImage,
  FiHome,
  FiAward,
  FiSettings,
  FiDatabase,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX,
  FiMail,
  FiLock
} from 'react-icons/fi';

export const AdminLayout = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected Route Logic
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FiGrid },
    { path: '/admin/pages', label: 'Manage Pages', icon: FiFileText },
    { path: '/admin/media', label: 'Media Library', icon: FiImage },
    { path: '/admin/certificates', label: 'Transfer Certificates', icon: FiAward },
    { path: '/admin/settings', label: 'Global Settings', icon: FiSettings },
    { path: '/admin/contact-submissions', label: 'Contact Inquiries', icon: FiMail },
    { path: '/admin/change-password', label: 'Change Password', icon: FiLock }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* MOBILE NAV BAR */}
      <header className="md:hidden w-full bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏫</span>
          <span className="font-serif font-bold text-lg tracking-tight">Greenwood Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-white"
        >
          {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </header>

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform md:translate-x-0 transition-transform duration-300 md:static flex flex-col shrink-0 border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="text-3xl">🏫</span>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">Greenwood</h2>
            <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Module</p>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="mx-4 my-6 p-4 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-lg uppercase shadow-inner">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate leading-tight">{user?.name}</h4>
            <span className="text-[10px] text-gray-400 capitalize font-medium">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action buttons footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FiExternalLink className="w-4 h-4" />
              <span>Public Website</span>
            </div>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-sm font-semibold tracking-wide transition-colors cursor-pointer text-left"
          >
            <FiLogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY for mobile view drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-45 md:hidden"
        />
      )}

      {/* WORKSPACE CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
