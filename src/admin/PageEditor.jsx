// src/admin/PageEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';
import BlockEditorModal from './components/BlockEditorModal.jsx';
import MediaPicker from './components/MediaPicker.jsx';
import BlockRenderer from '../cms/blocks/BlockRenderer.jsx';
import { galleryItems } from '../pages/Gallery.jsx';
import { 
  FiArrowLeft, FiSave, FiEye, FiEyeOff, FiTrash2, FiEdit2, 
  FiArrowUp, FiArrowDown, FiLayers, FiCheckCircle, FiPlus, 
  FiGlobe, FiAlertCircle, FiSettings, FiRefreshCw, FiCopy 
} from 'react-icons/fi';

export const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Active view: 'blocks', 'preview', 'seo', 'revisions'
  const [activeTab, setActiveTab] = useState('blocks');

  // Block Modal edit states
  const [editingBlock, setEditingBlock] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // Media picker states for page properties (Hero/OG Image)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('');

  // Description hover for add block buttons
  const [hoveredDescription, setHoveredDescription] = useState('');

  const fetchPageDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getPage(id);
      setPage(data.page);
      setBlocks(data.blocks || []);
      
      const revs = await adminApi.getRevisions(id);
      setRevisions(revs);
    } catch (err) {
      setError(err.message || 'Failed to fetch page details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageDetails();
  }, [id]);

  const handlePageFieldChange = (key, value) => {
    setPage(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePageMetadata = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await adminApi.updatePage(id, page);
      alert('Page metadata updated successfully');
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to save page properties');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish this page? All current block drafts will go live immediately.')) {
      return;
    }
    setSaving(true);
    try {
      await adminApi.publishPage(id);
      alert('Page published and live!');
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to publish page');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish this page? It will no longer be visible on the public website.')) {
      return;
    }
    setSaving(true);
    try {
      await adminApi.unpublishPage(id);
      alert('Page reverted to draft.');
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to unpublish');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (version) => {
    if (!window.confirm(`Roll back this page to version ${version}? Current state will be saved as a revision.`)) {
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.rollbackRevision(id, version);
      alert(res.message);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Rollback failed');
    } finally {
      setSaving(false);
    }
  };

  // Block CRUD updates
  const handleAddBlock = async (type) => {
    try {
      await adminApi.addBlock(id, type, {});
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to add block');
    }
  };

  const handleEditBlockClick = (block) => {
    setEditingBlock(block);
    setEditorOpen(true);
  };

  const handleSaveBlock = async (updatedData) => {
    try {
      await adminApi.updateBlock(editingBlock.id, updatedData);
      setEditorOpen(false);
      setEditingBlock(null);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to save block content');
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    try {
      await adminApi.deleteBlock(blockId);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to delete block');
    }
  };

  const handleDuplicateBlock = async (block, index) => {
    try {
      const res = await adminApi.addBlock(id, block.block_type, block.data || {});
      const newBlockId = res.block_id;

      const updatedData = await adminApi.getPage(id);
      const updatedBlocks = updatedData.blocks || [];

      const withoutNewBlock = updatedBlocks.filter(b => b.id !== newBlockId);
      const reorderedList = [
        ...withoutNewBlock.slice(0, index + 1),
        updatedBlocks.find(b => b.id === newBlockId),
        ...withoutNewBlock.slice(index + 1)
      ];

      const idsOrder = reorderedList.filter(Boolean).map(b => b.id);
      await adminApi.reorderBlocks(id, idsOrder);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to duplicate block');
    }
  };

  const handleToggleVisibility = async (blockId) => {
    try {
      await adminApi.toggleBlockVisibility(blockId);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to toggle visibility');
    }
  };

  const handleMoveBlock = async (index, direction) => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= blocks.length) return;

    const reorderedList = [...blocks];
    // Swap items
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[nextIdx];
    reorderedList[nextIdx] = temp;

    const idsOrder = reorderedList.map(b => b.id);
    try {
      await adminApi.reorderBlocks(id, idsOrder);
      fetchPageDetails();
    } catch (err) {
      alert(err.message || 'Failed to reorder blocks');
    }
  };

  const triggerMediaPicker = (field) => {
    setMediaPickerTarget(field);
    setMediaPickerOpen(true);
  };

  const handleMediaPickerSelect = async (file) => {
    if (mediaPickerTarget === 'gallery_add') {
      const galleryBlock = blocks.find(b => b.block_type === 'gallery');
      if (galleryBlock) {
        let currentImages = galleryBlock.data?.images;
        if (!Array.isArray(currentImages) || currentImages.length === 0) {
          currentImages = galleryItems.map(item => ({
            url: item.src,
            title: item.title || '',
            description: item.description || ''
          }));
        }
        const updatedImages = [
          ...currentImages,
          {
            url: file.file_url,
            title: file.title || file.filename || 'Gallery Image',
            description: file.alt_text || ''
          }
        ];
        const updatedData = {
          ...galleryBlock.data,
          images: updatedImages
        };
        try {
          setSaving(true);
          await adminApi.updateBlock(galleryBlock.id, updatedData);
          await fetchPageDetails();
        } catch (err) {
          alert('Failed to add image: ' + err.message);
        } finally {
          setSaving(false);
        }
      } else {
        alert('No gallery block found on this page.');
      }
    } else {
      handlePageFieldChange(mediaPickerTarget, file.file_url);
    }
  };

  const handleDeleteGalleryImage = async (imgUrl) => {
    if (!window.confirm('Are you sure you want to delete this image from the gallery?')) return;
    const galleryBlock = blocks.find(b => b.block_type === 'gallery');
    if (galleryBlock) {
      let currentImages = galleryBlock.data?.images;
      if (!Array.isArray(currentImages) || currentImages.length === 0) {
        currentImages = galleryItems.map(item => ({
          url: item.src,
          title: item.title || '',
          description: item.description || ''
        }));
      }
      const updatedImages = currentImages.filter(img => img.url !== imgUrl);
      const updatedData = {
        ...galleryBlock.data,
        images: updatedImages
      };
      try {
        setSaving(true);
        await adminApi.updateBlock(galleryBlock.id, updatedData);
        await fetchPageDetails();
      } catch (err) {
        alert('Failed to delete image: ' + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading editor details...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 text-red-800">
        <FiAlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-bold">Error Loading Page</h4>
          <p className="text-sm mt-1">{error || 'Page details could not be retrieved.'}</p>
          <button onClick={() => navigate('/admin/pages')} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg">
            Back to Pages List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Editor top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pages')}
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-gray-800">{page.title}</h1>
              <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${
                page.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {page.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Route: {page.route} | Version: {page.version}</p>
          </div>
        </div>

        {/* Publish/Unpublish status switch buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {page.status === 'published' ? (
            <button
              onClick={handleUnpublish}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Unpublish
            </button>
          ) : null}
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <FiGlobe />
            <span>Publish Page</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs for details views */}
      <div className="flex border-b border-gray-200 select-none">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'blocks'
              ? 'border-amber-500 text-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Page Blocks
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-amber-500 text-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Page Preview
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'seo'
              ? 'border-amber-500 text-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          SEO & Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('revisions')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'revisions'
              ? 'border-amber-500 text-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Revision History ({revisions.length})
        </button>
      </div>

      {/* TAB content: Page Blocks list */}
      {activeTab === 'blocks' && (
        page.template === 'gallery' ? (
          <div className="space-y-6">
            {/* Gallery Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-150 p-6 rounded-3xl shadow-sm gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-800">Photo Gallery Manager</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Manage and organize all images displayed on the public Gallery page.</p>
              </div>
              <button
                type="button"
                onClick={() => triggerMediaPicker('gallery_add')}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md shadow-amber-500/10"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add New Image</span>
              </button>
            </div>

            {/* Gallery Image Grid */}
            {(() => {
              const galleryBlock = blocks.find(b => b.block_type === 'gallery');
              if (!galleryBlock) {
                return (
                  <div className="p-12 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-3xl">
                    <p className="mb-4">No gallery configuration block detected for this template.</p>
                    <button
                      onClick={() => handleAddBlock('gallery')}
                      className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Initialize Gallery Block
                    </button>
                  </div>
                );
              }

              let displayImages = galleryBlock.data?.images;
              if (!Array.isArray(displayImages) || displayImages.length === 0) {
                displayImages = galleryItems.map(item => ({
                  url: item.src,
                  title: item.title || '',
                  description: item.description || ''
                }));
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {displayImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={img.url}
                        alt={img.title || 'Gallery item'}
                        className="w-full h-full object-cover"
                      />
                      {/* Delete Action Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(img.url)}
                          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-transform hover:scale-110 shadow-lg cursor-pointer animate-scaleIn"
                          title="Delete this image"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {displayImages.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                      No images in the gallery yet. Click "Add New Image" above.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {blocks.map((b, index) => (
                <div
                  key={b.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border rounded-2xl shadow-sm gap-4 transition-all hover:shadow-md ${
                    b.is_visible === 0 ? 'border-gray-200 opacity-60' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 capitalize text-sm">{b.block_type.replace('_', ' ')} Block</span>
                      {b.status === 'draft' && (
                        <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full">
                          Draft Changes
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-normal font-medium max-w-md truncate">
                      {b.block_type === 'text' ? b.data?.heading || 'Rich Text Content' : b.data?.title || 'Click Edit to manage block contents'}
                    </p>
                  </div>

                  {/* Edit and visibility actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Reordering */}
                    <button
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-500 disabled:opacity-30 cursor-pointer"
                    >
                      <FiArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-500 disabled:opacity-30 cursor-pointer"
                    >
                      <FiArrowDown className="w-4 h-4" />
                    </button>
                    {/* Visibility */}
                    <button
                      onClick={() => handleToggleVisibility(b.id)}
                      className="p-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-500 cursor-pointer"
                    >
                      {b.is_visible !== 0 ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4 text-red-500" />}
                    </button>
                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateBlock(b, index)}
                      className="p-2 hover:bg-blue-50 hover:border-blue-200 text-blue-600 border border-transparent rounded-lg transition-all cursor-pointer"
                      title="Duplicate Block"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                    {/* Edit content */}
                    <button
                      onClick={() => handleEditBlockClick(b)}
                      className="p-2 hover:bg-amber-50 hover:border-amber-200 text-amber-600 border border-transparent rounded-lg transition-all cursor-pointer"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteBlock(b.id)}
                      className="p-2 hover:bg-red-50 hover:border-red-200 text-red-600 border border-transparent rounded-lg transition-all cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {blocks.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-3xl">
                  No blocks added to this page yet. Use the selector below to insert segments.
                </div>
              )}
            </div>

            {/* Add block tools row */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h4 className="font-serif text-sm font-bold tracking-wide">Add Content Segment</h4>
                {hoveredDescription && (
                  <span className="text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-lg font-medium transition-all duration-200 animate-pulse">
                    💡 {hoveredDescription}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { type: 'text', label: 'Rich Text', desc: 'Insert formatted text paragraphs, lists, and headings.' },
                  { type: 'image', label: 'Image', desc: 'Display a single styled image banner with captions.' },
                  { type: 'gallery', label: 'Gallery', desc: 'Add a responsive photo grid displaying multiple pictures.' },
                  { type: 'pdf', label: 'PDF Banner', desc: 'Display an inline viewer for PDF and Word documents.' },
                  { type: 'video', label: 'Video Embed', desc: 'Embed a streaming video player from YouTube or video link.' },
                  { type: 'cards', label: 'Info Cards', desc: 'Insert information cards with thumbnail titles and links.' },
                  { type: 'faculty', label: 'Faculty directory', desc: 'Add profile details and photos for faculty staff.' },
                  { type: 'stats', label: 'Counter stats', desc: 'Showcase numerical metrics with titles (e.g. stats counter).' },
                  { type: 'table', label: 'Data table', desc: 'Insert grid columns and rows to show organized tables.' },
                  { type: 'notice', label: 'Notice panel', desc: 'Show styled announcement alerts (info, warning, danger).' },
                  { type: 'downloads', label: 'Downloads list', desc: 'Display list of files for user downloads.' },
                  { type: 'cta', label: 'CTA call', desc: 'Insert a high-visibility call-to-action button layout.' },
                  { type: 'spacer', label: 'Spacing divider', desc: 'Add vertical blank space separation between blocks.' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddBlock(item.type)}
                    onMouseEnter={() => setHoveredDescription(item.desc)}
                    onMouseLeave={() => setHoveredDescription('')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-750 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB content: Page Live Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 select-none">
            <FiEye className="w-4 h-4 text-amber-600" />
            <span>Draft Preview: This is a real-time visual preview of how this page's current draft content will look once published.</span>
          </div>

          <div className="border border-gray-150 rounded-2xl overflow-hidden min-h-[55vh] bg-gray-50">
            {/* Dynamic Hero Section */}
            {page.hero_title && (
              <section className="relative w-full py-16 md:py-24 bg-slate-900 text-white overflow-hidden select-none">
                {page.hero_image && (
                  <>
                    <img
                      src={page.hero_image}
                      alt={page.hero_title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />
                  </>
                )}
                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                  <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
                    {page.hero_title}
                  </h1>
                  {page.hero_subtitle && (
                    <p className="text-gray-300 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
                      {page.hero_subtitle}
                    </p>
                  )}
                </div>
              </section>
            )}

            <main className="bg-white pb-16">
              <BlockRenderer blocks={blocks} />
            </main>
          </div>
        </div>
      )}

      {/* TAB content: Page SEO & Hero details */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSavePageMetadata} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* HERO SECTION DESIGN */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1">
                <FiSettings />
                <span>Page Hero Banner</span>
              </h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Title</label>
                <input
                  type="text"
                  value={page.hero_title || ''}
                  onChange={(e) => handlePageFieldChange('hero_title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Banner Header"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Subtitle</label>
                <textarea
                  value={page.hero_subtitle || ''}
                  onChange={(e) => handlePageFieldChange('hero_subtitle', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 h-20 resize-none leading-relaxed"
                  placeholder="Add page context sub-details here..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Background Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={page.hero_image || ''}
                    onChange={(e) => handlePageFieldChange('hero_image', e.target.value)}
                    className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                    placeholder="/uploads/image/hero.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => triggerMediaPicker('hero_image')}
                    className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Choose
                  </button>
                </div>
              </div>
            </div>

            {/* SEO ENGINE DATA */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1">
                <FiGlobe />
                <span>Search Engine Optimization</span>
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={page.meta_title || ''}
                  onChange={(e) => handlePageFieldChange('meta_title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="e.g. Admission Criteria | Greenwood School"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Meta Description</label>
                <textarea
                  value={page.meta_description || ''}
                  onChange={(e) => handlePageFieldChange('meta_description', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 h-20 resize-none leading-relaxed"
                  placeholder="Brief description for search listings..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Meta Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={page.meta_keywords || ''}
                  onChange={(e) => handlePageFieldChange('meta_keywords', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="greenwood, school admission, fee structure"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Open Graph (OG) Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={page.og_image || ''}
                    onChange={(e) => handlePageFieldChange('og_image', e.target.value)}
                    className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                    placeholder="/uploads/image/seo-thumbnail.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => triggerMediaPicker('og_image')}
                    className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Choose
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Canonical URL</label>
                <input
                  type="text"
                  value={page.canonical_url || ''}
                  onChange={(e) => handlePageFieldChange('canonical_url', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://www.greenwoodschool.com/page"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              <FiSave />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>
      )}

      {/* TAB content: Page Revision Log entries */}
      {activeTab === 'revisions' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b pb-2 border-gray-100 flex items-center gap-1">
            <FiLayers />
            <span>Revisions History Logs</span>
          </h3>

          <div className="divide-y divide-gray-100">
            {revisions.map((rev) => (
              <div key={rev.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm">Version {rev.version}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-full">
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">
                    {rev.change_summary || 'Snapshot commit recorded before publication'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Saved on {new Date(rev.created_at).toLocaleString()} by {rev.revised_by_name || 'Admin'}
                  </p>
                </div>
                <button
                  onClick={() => handleRollback(rev.version)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 border border-amber-200 hover:border-amber-300 text-amber-600 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiRefreshCw />
                  <span>Restore</span>
                </button>
              </div>
            ))}
            {revisions.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                No publication revisions logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER BLOCK EDITOR DIALOG */}
      <BlockEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingBlock(null); }}
        onSave={handleSaveBlock}
        block={editingBlock}
      />

      {/* RENDER DEDICATED SITE MEDIA PICKER */}
      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaPickerSelect}
      />

    </div>
  );
};

export default PageEditor;
