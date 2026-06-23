// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';
import { FiFileText, FiImage, FiAward, FiSettings, FiPlus, FiArrowRight, FiUpload } from 'react-icons/fi';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ pages: 0, media: 0, certificates: 0 });
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Load pages count & recent items
        const pageData = await adminApi.listPages();
        setStats(prev => ({ ...prev, pages: pageData.length }));
        setRecentPages(pageData.slice(0, 4));

        // Load media count
        const mediaData = await adminApi.listMedia('', '', 1);
        setStats(prev => ({ ...prev, media: mediaData.total || 0 }));

        // Load certificates count
        const certData = await adminApi.listCertificates('', 1);
        setStats(prev => ({ ...prev, certificates: certData.total || 0 }));

      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Create New Page', description: 'Instantiate from templates', icon: FiPlus, path: '/admin/pages', color: 'bg-emerald-500 shadow-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-50' },
    { label: 'Upload Certificate', description: 'Add new PDF and student credentials', icon: FiUpload, path: '/admin/certificates', color: 'bg-indigo-500 shadow-indigo-500/10 text-indigo-600 border-indigo-100 hover:bg-indigo-50' },
    { label: 'Add Media File', description: 'Upload images, maps or folders', icon: FiImage, path: '/admin/media', color: 'bg-amber-500 shadow-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-50' },
    { label: 'Manage Contact Settings', description: 'Modify addresses and principal message', icon: FiSettings, path: '/admin/settings', color: 'bg-rose-500 shadow-rose-500/10 text-rose-600 border-rose-100 hover:bg-rose-50' }
  ];

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Gathering statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header bar */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to the administrative portal for The Greenwood Public School.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Pages Card */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">CMS Pages</span>
            <h2 className="text-4xl font-extrabold text-gray-800 mt-1">{stats.pages}</h2>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <FiFileText className="w-6 h-6" />
          </div>
        </div>

        {/* Media Card */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Media Library</span>
            <h2 className="text-4xl font-extrabold text-gray-800 mt-1">{stats.media}</h2>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <FiImage className="w-6 h-6" />
          </div>
        </div>

        {/* Certificates Card */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Transfer Certificates</span>
            <h2 className="text-4xl font-extrabold text-gray-800 mt-1">{stats.certificates}</h2>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <FiAward className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-xl font-bold text-gray-800">Quick Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className={`flex items-start gap-4 p-5 bg-white border rounded-2xl shadow-sm text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${act.color.split(' ').slice(2).join(' ')}`}
                >
                  <div className={`p-3 rounded-xl ${act.color.split(' ').slice(0, 2).join(' ')} bg-white border border-inherit`}>
                    <Icon className="w-5 h-5 text-inherit" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{act.label}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">{act.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Page Updates column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-gray-800">Recent Pages</h3>
            <Link to="/admin/pages" className="text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-600 flex items-center gap-1">
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {recentPages.map((p) => (
              <div key={p.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{p.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">Route: {p.route}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                  p.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
            {recentPages.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No custom pages created yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
