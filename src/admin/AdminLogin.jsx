// src/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { adminApi } from './adminApi.js';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      // Success, go to dashboard
      navigate('/admin');
      // Force reload to update Layout auth state if needed
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const data = await adminApi.forgotPassword(email);
      setSuccess(data.message || 'Reset link sent. Check uploads/password_reset_email.html if testing on localhost.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative z-10 text-white text-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🛡️</span>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            {isForgotMode ? 'Password Recovery' : 'Admin Console'}
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">
            Greenwood Public School
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-300 mb-6 animate-shake">
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 text-emerald-300 mb-6">
            <span>✅</span>
            <span className="text-xs leading-relaxed">{success}</span>
          </div>
        )}

        {isForgotMode ? (
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Your Admin Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="admin@greenwood.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/10 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-xs tracking-wider uppercase cursor-pointer mt-2"
            >
              {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-amber-500 hover:underline cursor-pointer bg-transparent border-0"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="admin@greenwood.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/10 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[10px] text-amber-500 hover:underline cursor-pointer bg-transparent border-0"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/10 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-xs tracking-wider uppercase cursor-pointer mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 border-t border-white/5 pt-6">
          <p>Protected administrative interface.</p>
          <p className="mt-1">Unauthorized access attempts are logged.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
