// src/admin/SiteSettings.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import RichTextEditor from './editors/RichTextEditor.jsx';
import MediaPicker from './components/MediaPicker.jsx';
import { FiSave, FiSettings, FiImage, FiGrid, FiMail, FiMapPin, FiPhone, FiAlertCircle } from 'react-icons/fi';

export const SiteSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Media picker states
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getSettings();
      // adminApi.getSettings() already returns a key-value object
      setSettings(data || {});
    } catch (err) {
      setError(err.message || 'Failed to fetch global settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings(settings);
      alert('Global settings saved successfully');
      fetchSettings();
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Retrieving site variables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Header bar */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Global Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure contact info, address details, social profiles, maps, and the principal message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
        
        {/* LEFT COLUMN: School and Contact Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1.5">
              <FiSettings />
              <span>General School Profile</span>
            </h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">School Name</label>
              <input
                type="text"
                value={settings.school_name || ''}
                onChange={(e) => handleChange('school_name', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                placeholder="The Greenwood Public School"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Contact Phone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiPhone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-amber-500/50"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Contact Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-amber-500/50"
                    placeholder="info@greenwood.edu"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mailing Address</label>
              <div className="relative">
                <span className="absolute left-3 top-4 text-gray-400">
                  <FiMapPin className="w-4 h-4" />
                </span>
                <textarea
                  value={settings.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-amber-500/50 h-20 resize-none leading-relaxed"
                  placeholder="Greenwood Campus, Civil Lines, Road 4..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Google Maps Link</label>
              <input
                type="text"
                value={settings.google_maps_link || ''}
                onChange={(e) => handleChange('google_maps_link', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* Social Channels Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1.5">
              <FiGrid />
              <span>Social Media Profiles</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Facebook URL</label>
                <input
                  type="text"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={settings.social_instagram || ''}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">YouTube Channel</label>
                <input
                  type="text"
                  value={settings.social_youtube || ''}
                  onChange={(e) => handleChange('social_youtube', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Twitter / X URL</label>
                <input
                  type="text"
                  value={settings.social_twitter || ''}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Principal & Trustee details + submit button */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Principal Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1.5">
              <FiImage />
              <span>Principal Profile Desk</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Principal Name</label>
              <input
                type="text"
                value={settings.principal_name || ''}
                onChange={(e) => handleChange('principal_name', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                placeholder="e.g. Dr. Sarah Greenwood"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Principal Desk Message</label>
              <textarea
                value={settings.principal_message || ''}
                onChange={(e) => handleChange('principal_message', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 h-28 resize-none leading-relaxed text-xs"
                placeholder="Welcome address from principal..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Principal Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.principal_photo || ''}
                  onChange={(e) => handleChange('principal_photo', e.target.value)}
                  className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="/uploads/faculty/principal.jpg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget('principal_photo');
                    setMediaOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Choose
                </button>
              </div>
            </div>
          </div>

          {/* Trustee Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1.5">
              <FiImage />
              <span>Trustee Profile Desk</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Trustee Name</label>
              <input
                type="text"
                value={settings.trustee_name || ''}
                onChange={(e) => handleChange('trustee_name', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                placeholder="e.g. Shri. Rajesh Greenwood"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Trustee Message</label>
              <textarea
                value={settings.trustee_message || ''}
                onChange={(e) => handleChange('trustee_message', e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 h-28 resize-none leading-relaxed text-xs"
                placeholder="Welcome address from trustee..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Trustee Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.trustee_photo || ''}
                  onChange={(e) => handleChange('trustee_photo', e.target.value)}
                  className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="/uploads/faculty/trustee.jpg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget('trustee_photo');
                    setMediaOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Choose
                </button>
              </div>
            </div>
          </div>

          {/* Submit details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              <FiSave />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>

        </div>

      </form>

      {/* RENDER MEDIA PICKER MODAL */}
      <MediaPicker
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(file) => handleChange(mediaTarget, file.file_url)}
        categoryFilter="faculty"
      />

    </div>
  );
};

export default SiteSettings;
