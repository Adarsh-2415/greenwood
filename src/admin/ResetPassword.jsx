// src/admin/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from './adminApi.js';
import { FiLock, FiAlertCircle } from 'react-icons/fi';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenVal = query.get('token');
    if (!tokenVal) {
      setError('Invalid reset link: Token is missing.');
    } else {
      setToken(tokenVal);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please request a new recovery link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminApi.resetPassword(token, password);
      setSuccess(data.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden text-sm">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative z-10 text-white">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🔑</span>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Create New Password</h1>
          <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">
            Greenwood Admin Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-red-300 mb-6">
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 text-emerald-300 mb-6">
            <span>✅</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Success!</span>
              <span className="text-xs text-emerald-400">{success}</span>
              <span className="text-xxs text-emerald-500 mt-1">Redirecting to login...</span>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/10 text-white placeholder-gray-500"
                  required
                  disabled={!!error && !token}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/10 text-white placeholder-gray-500"
                  required
                  disabled={!!error && !token}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!!error && !token)}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-xs tracking-wider uppercase cursor-pointer mt-2"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="text-xs text-amber-500 hover:underline cursor-pointer bg-transparent border-0"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
