// src/admin/TCOperatorLayout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import CertificateManager from './CertificateManager.jsx';
import { FiLogOut, FiAward } from 'react-icons/fi';

const TCOperatorLayout = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Role verification and protected access guard
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
      } else if (user?.role !== 'tc_operator' && user?.role !== 'super_admin') {
        // If they are not a TC Operator or Super Admin, send them back to login
        navigate('/admin/login');
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'tc_operator' && user?.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* TOP HEADER */}
      <header className="w-full bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏫</span>
          <div>
            <h2 className="font-serif font-bold text-base md:text-lg leading-tight">The Greenwood Public School</h2>
            <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">TC Operator Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-850 border border-slate-850 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-sm uppercase">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="text-left leading-none">
              <span className="block text-xs font-bold text-gray-200">{user?.name}</span>
              <span className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5 block">TC Operator</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-red-500/20 hover:border-red-500/30 cursor-pointer"
          >
            <FiLogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* DEDICATED WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        <div className="mb-6 flex items-center gap-2 text-slate-650">
          <FiAward className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold tracking-wide uppercase">Transfer Certificate Management</span>
        </div>
        
        {/* Reusing existing CertificateManager component directly */}
        <CertificateManager />
      </main>
    </div>
  );
};

export default TCOperatorLayout;
