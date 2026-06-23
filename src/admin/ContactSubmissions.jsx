// src/admin/ContactSubmissions.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import { FiTrash2, FiMail, FiPhone, FiCalendar, FiUser, FiInfo, FiRefreshCw } from 'react-icons/fi';

export const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getContactSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.message || 'Failed to load contact inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }
    try {
      await adminApi.deleteContactSubmission(id);
      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub(null);
      }
      alert('Inquiry deleted successfully.');
    } catch (err) {
      alert(err.message || 'Failed to delete inquiry.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr.replace(/-/g, '/')); // Handle standard mysql format safely
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Retrieving contact queries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative text-sm">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>Contact Inquiries</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review user submissions, general feedback, and admissions questions sent from the website contact form.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-2">
          <span>⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <span className="text-4xl">📬</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Inquiries Found</h3>
          <p className="text-gray-500 mt-1">When visitors submit the contact form, their queries will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of submissions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xxs font-bold uppercase tracking-wider text-gray-500">
                      <th className="py-4 px-6">Sender Details</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {submissions.map((sub) => (
                      <tr 
                        key={sub.id} 
                        onClick={() => setSelectedSub(sub)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          selectedSub && selectedSub.id === sub.id ? 'bg-amber-500/5 hover:bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{sub.name}</div>
                          <div className="text-xxs text-gray-400 font-mono mt-0.5">{sub.email}</div>
                          <div className="text-xxs text-gray-400 mt-0.5">{sub.phone}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-700 truncate max-w-[200px]">
                          {sub.subject}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(sub.created_at)}
                        </td>
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete inquiry"
                          >
                            <FiTrash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Submission inspection desk */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm sticky top-6 space-y-5">
              <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2.5 border-gray-100 flex items-center gap-1.5">
                <FiInfo className="text-amber-500" />
                <span>Inquiry Inspector</span>
              </h3>

              {selectedSub ? (
                <div className="space-y-4">
                  <div>
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400">Sender Name</span>
                    <p className="font-bold text-gray-800 text-base mt-0.5 flex items-center gap-1.5">
                      <FiUser className="text-slate-400 shrink-0" />
                      <span>{selectedSub.name}</span>
                    </p>
                  </div>

                  <div>
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400">Email Address</span>
                    <a 
                      href={`mailto:${selectedSub.email}`} 
                      className="font-semibold text-amber-500 hover:text-amber-600 transition-colors mt-0.5 flex items-center gap-1.5 font-mono"
                    >
                      <FiMail className="shrink-0" />
                      <span>{selectedSub.email}</span>
                    </a>
                  </div>

                  <div>
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400">Phone Number</span>
                    <a 
                      href={`tel:${selectedSub.phone}`} 
                      className="font-semibold text-gray-800 hover:text-slate-900 transition-colors mt-0.5 flex items-center gap-1.5"
                    >
                      <FiPhone className="text-slate-400 shrink-0" />
                      <span>{selectedSub.phone}</span>
                    </a>
                  </div>

                  <div>
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400">Submission Date</span>
                    <p className="text-gray-700 mt-0.5 flex items-center gap-1.5">
                      <FiCalendar className="text-slate-400 shrink-0" />
                      <span>{formatDate(selectedSub.created_at)}</span>
                    </p>
                  </div>

                  <div className="border-t border-gray-50 pt-4">
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400 mb-1">Subject</span>
                    <div className="font-bold text-slate-900 border-b border-gray-50 pb-2">
                      {selectedSub.subject}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xxs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Message / Inquiry Details</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-light text-slate-800 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                      {selectedSub.message}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleDelete(selectedSub.id)}
                      className="w-full bg-red-500 hover:bg-red-650 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/20 text-xs tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiTrash2 />
                      <span>Delete Submission</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-3xl">👈</span>
                  <p className="mt-2 font-medium">Select any query row from the list to inspect details</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ContactSubmissions;
