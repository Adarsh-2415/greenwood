// src/admin/components/MediaPicker.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi.js';
import { FiX, FiSearch, FiUpload, FiFolderPlus, FiCheck } from 'react-icons/fi';

export const MediaPicker = ({ isOpen, onClose, onSelect, categoryFilter = '' }) => {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryFilter);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listMedia(search, category, page);
      setMedia(data.media || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load media items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search, category, page]);

  // Sync category prop changes
  useEffect(() => {
    setCategory(categoryFilter);
  }, [categoryFilter]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', files[0]);
      formData.append('category', category || 'other');
      
      const res = await adminApi.uploadMedia(formData);
      if (res.uploaded && res.uploaded.length > 0) {
        // Automatically select newly uploaded file
        setSelectedFile(res.uploaded[0]);
        // Refresh library list
        setPage(1);
        fetchMedia();
      }
    } catch (err) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 select-none">
      <div className="w-full max-w-4xl bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col h-[85vh]">
        
        {/* Header bar */}
        <div className="p-6 border-b border-gray-150 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-gray-800">Select Media File</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-gray-500 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and upload row */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search library..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white border border-gray-200 focus:border-amber-500/50 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-amber-500/5 placeholder-gray-400"
              />
            </div>

            {/* Category Dropdown (if not locked by categoryFilter prop) */}
            {!categoryFilter && (
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 text-xs font-bold text-gray-600 outline-none"
              >
                <option value="">All Media</option>
                <option value="image">Images</option>
                <option value="document">Documents / PDFs</option>
                <option value="video">Videos</option>
                <option value="gallery">Gallery Photos</option>
                <option value="faculty">Faculty Photos</option>
              </select>
            )}
          </div>

          {/* Quick upload input */}
          <div className="w-full sm:w-auto">
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              <FiUpload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                accept={
                  category === 'image' ? 'image/*' :
                  category === 'document' ? 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*' :
                  category === 'certificate' ? 'application/pdf' :
                  '*'
                }
              />
            </label>
          </div>

        </div>

        {/* Media items container list */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400 text-xs font-medium">Scanning media storage...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {media.map((file) => {
                const isImage = file.file_type.startsWith('image/');
                const isPdf = file.file_type === 'application/pdf';
                const isSelected = selectedFile?.id === file.id;

                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`group relative flex flex-col bg-white border rounded-xl overflow-hidden aspect-square cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 ring-4 ring-amber-500/10'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Media thumbnail preview */}
                    <div className="flex-1 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        <img src={file.file_url} alt={file.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="text-center p-3 text-red-500">
                          <FiFolderPlus className="w-8 h-8 mx-auto" />
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mt-1">{file.file_extension}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta info header */}
                    <div className="p-2 border-t border-gray-50 bg-white text-left">
                      <span className="text-[10px] text-gray-700 font-bold block truncate">{file.original_name}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">{(file.file_size / 1024).toFixed(0)} KB</span>
                    </div>

                    {/* Selection Check Circle Overlay */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1.5 bg-amber-500 text-slate-900 font-bold rounded-full shadow-md z-10">
                        <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
              {media.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                  No media files found matching the search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions & page pagination */}
        <div className="p-6 border-t border-gray-150 bg-gray-50 flex items-center justify-between">
          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Confirm select buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 font-bold text-gray-700 text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedFile}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MediaPicker;
