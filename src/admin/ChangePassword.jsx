// src/admin/ChangePassword.jsx
import React, { useState } from 'react';
import { adminApi } from './adminApi.js';
import { FiSave, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const data = await adminApi.changePassword(currentPassword, newPassword);
      setSuccess(data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none relative text-sm">
      
      {/* Header bar */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Security Credentials</h1>
        <p className="text-sm text-gray-500 mt-1">
          Change your administrative password to keep the portal secure.
        </p>
      </div>

      <div className="max-w-xl bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-3 border-gray-50 flex items-center gap-1.5 mb-5">
          <FiLock />
          <span>Update Security Password</span>
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-2 mb-5">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-2 mb-5">
            <FiCheckCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-10 pr-3 outline-none focus:border-amber-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-10 pr-3 outline-none focus:border-amber-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-10 pr-3 outline-none focus:border-amber-500/50"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-xs tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              <FiSave />
              <span>{saving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ChangePassword;
