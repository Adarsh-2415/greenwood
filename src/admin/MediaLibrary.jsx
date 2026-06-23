// src/admin/MediaLibrary.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import { FiSearch, FiUpload, FiTrash2, FiEdit, FiX, FiCheck, FiFolder, FiImage, FiAlertTriangle } from 'react-icons/fi';
import { galleryItems } from '../pages/Gallery.jsx';

export const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Edit metadata dialog
  const [editingFile, setEditingFile] = useState(null);
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listMedia(search, category, page);
      setMedia(data.media || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load media library', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, category, page]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('files', file);
        formData.append('category', category || 'other');

        try {
          await adminApi.uploadMedia(formData);
        } catch (fileErr) {
          console.error(`Failed to upload ${file.name}:`, fileErr);
          alert(`Failed to upload ${file.name}: ${fileErr.message}`);
        }
      }
      setPage(1);
      await fetchMedia();
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (file) => {
    setEditingFile(file);
    setTitle(file.title || '');
    setAltText(file.alt_text || '');
  };

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateMedia(editingFile.id, title, altText);
      setEditingFile(null);
      fetchMedia();
    } catch (err) {
      alert(err.message || 'Failed to update file details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (file) => {
    // Check usage first
    try {
      const usageRes = await adminApi.checkMediaUsage(file.id);
      if (usageRes.used_count > 0) {
        const pageNames = usageRes.used_in.map(u => `"${u.page_title}"`).join(', ');
        alert(`Cannot delete this file. It is currently referenced in CMS page content blocks on: ${pageNames}. Remove references first.`);
        return;
      }
    } catch (err) {
      console.warn('Failed to check media usage', err);
    }

    if (!window.confirm(`Delete the file "${file.original_name}" permanently?`)) {
      return;
    }

    try {
      await adminApi.deleteMedia(file.id);
      fetchMedia();
    } catch (err) {
      alert(err.message || 'Failed to delete file');
    }
  };

  const handleSyncGallery = async () => {
    if (!window.confirm("This will securely upload all 45 local gallery images into your database. Depending on your connection, this may take 1-2 minutes. Continue?")) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const item of galleryItems) {
        try {
          const response = await fetch(item.src);
          if (!response.ok) continue;
          const blob = await response.blob();
          
          const fileName = item.src.split('/').pop() || 'gallery_image.jpg';
          const file = new File([blob], fileName, { type: blob.type });
          
          const formData = new FormData();
          formData.append('files', file);
          formData.append('category', 'gallery');
          
          await adminApi.uploadMedia(formData);
          successCount++;
        } catch (err) {
          console.error(`Failed to migrate ${item.src}`, err);
        }
      }
      alert(`Successfully migrated ${successCount} images into the Database! You can now delete them or manage them here.`);
      fetchMedia();
    } catch (err) {
      alert("Migration failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and organize media, images, brochures, and PDFs for your pages.
          </p>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={handleSyncGallery}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Import hardcoded 45 images into CMS database"
          >
            <FiUpload className="w-4 h-4 text-school-red" />
            <span>Sync Original Gallery</span>
          </button>
          
          <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer">
            <FiUpload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              multiple
              className="hidden"
              accept="*"
            />
          </label>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-gray-200 focus:border-amber-500/50 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-amber-500/5"
          />
        </div>

        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 text-xs font-bold text-gray-600 outline-none w-full sm:w-auto"
        >
          <option value="">Uncategorized (Other)</option>
          <option value="image">Images</option>
          <option value="document">Documents / PDFs</option>
          <option value="video">Videos</option>
          <option value="gallery">Gallery Photos</option>
          <option value="faculty">Faculty Photos</option>
          <option value="certificate">Transfer Certificates</option>
        </select>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="w-full h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading media items...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {media.map((file) => {
              const isImage = file.file_type.startsWith('image/');
              return (
                <div
                  key={file.id}
                  className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative group"
                >
                  {/* Thumbnail */}
                  <div className="flex-1 bg-gray-50 flex items-center justify-center aspect-square overflow-hidden border-b border-gray-50">
                    {isImage ? (
                      <img src={file.file_url} alt={file.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="text-center p-3 text-red-500">
                        <FiFolder className="w-12 h-12 mx-auto" />
                        <span className="text-xs uppercase font-extrabold text-gray-400 block mt-1">{file.file_extension}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions hover panel overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(file)}
                      className="p-2 bg-white hover:bg-amber-500 hover:text-slate-900 text-gray-800 rounded-xl transition-colors cursor-pointer"
                      title="Edit metadata"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 bg-white hover:bg-red-500 hover:text-white text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete file"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meta details below */}
                  <div className="p-3 bg-white">
                    <span className="text-xs text-gray-800 font-bold block truncate" title={file.original_name}>
                      {file.original_name}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 capitalize font-medium">{file.category}</span>
                  </div>
                </div>
              );
            })}
            {media.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                No files found in the media library.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 select-none">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-semibold mx-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDIT FILE METADATA MODAL */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
          <div className="w-full max-w-md bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="p-6 border-b border-gray-150 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-gray-800">Edit File Properties</h3>
              <button
                onClick={() => setEditingFile(null)}
                className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-gray-500 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">File URL (Read Only)</label>
                <input
                  type="text"
                  value={editingFile.file_url}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-400 rounded-xl py-2 px-3 text-xs font-mono outline-none cursor-not-allowed"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Display Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="Alt text image description..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MediaLibrary;
