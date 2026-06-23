// src/admin/PageList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';
import TemplateSelector from './components/TemplateSelector.jsx';
import { FiPlus, FiEdit2, FiCopy, FiTrash2, FiSearch, FiExternalLink, FiX, FiAlertCircle } from 'react-icons/fi';

export const PageList = () => {
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [route, setRoute] = useState('');
  const [template, setTemplate] = useState('basic');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchPages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listPages();
      setPages(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Sync title to slug & route helper
  const handleTitleChange = (val) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
    setRoute(`/${generatedSlug}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await adminApi.createPage({ title, slug, route, template });
      setCreateOpen(false);
      // Clean form fields
      setTitle('');
      setSlug('');
      setRoute('');
      setTemplate('basic');
      // Redirect to newly created page editor
      navigate(`/admin/pages/${res.page_id}`);
    } catch (err) {
      setError(err.message || 'Failed to create page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the page "${name}"? This will delete all its blocks and content.`)) {
      return;
    }
    try {
      await adminApi.deletePage(id);
      fetchPages();
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminApi.duplicatePage(id);
      fetchPages();
    } catch (err) {
      alert(err.message || 'Failed to duplicate page');
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.route.toLowerCase().includes(search.toLowerCase())) &&
      p.route !== '/about' &&
      p.slug !== 'about' &&
      p.route !== '/contact' &&
      p.slug !== 'contact'
  );

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Manage Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, duplicate, delete, and publish pages across your website.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Page</span>
        </button>
      </div>

      {/* Search Bar / List Details */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 focus:border-amber-500/50 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-amber-500/5 placeholder-gray-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading pages...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Page Title</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Template</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{p.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.route}</td>
                    <td className="px-6 py-4 capitalize text-gray-600 font-medium">{p.template.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                        p.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(p.updated_at).toLocaleDateString()} by {p.updated_by_name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/admin/pages/${p.id}`)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 border border-gray-150 hover:border-amber-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit Page"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p.id)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-150 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Page"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <a
                        href={p.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-slate-100 text-gray-600 border border-gray-150 rounded-lg transition-colors cursor-pointer"
                        title="View Live Page"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-red-50 text-red-600 border border-gray-150 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Delete Page"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPages.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                      No matching pages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW PAGE MODAL DIALOG */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
          <div className="w-full max-w-4xl bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-800">Create New Page</h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-gray-500 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-sm">
                  <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Page Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Academic Calendar"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2.5 px-3.5 text-sm font-semibold outline-none focus:border-amber-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="academic-calendar"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl py-2.5 px-3.5 text-xs font-mono outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Target Route
                    </label>
                    <input
                      type="text"
                      placeholder="/academic-calendar"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl py-2.5 px-3.5 text-xs font-mono outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>

                {/* Template Cards Selection Grid */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Select Page Template
                  </label>
                  <TemplateSelector selected={template} onSelect={setTemplate} />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-sm rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Page & Edit'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default PageList;
