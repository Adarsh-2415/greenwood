// src/admin/HomepageManager.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import MediaPicker from './components/MediaPicker.jsx';
import { 
  FiHome, FiArrowUp, FiArrowDown, FiCheckCircle, FiXCircle, 
  FiEdit3, FiSave, FiAlertCircle, FiPlus, FiTrash2, FiImage 
} from 'react-icons/fi';

export const HomepageManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Selected section to edit its content JSON
  const [editingSection, setEditingSection] = useState(null);
  const [editContent, setEditContent] = useState(null);

  // Media picker hooks
  const [mediaTarget, setMediaTarget] = useState(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listHomepageSections();
      // Ensure we seed initial sections if database is completely empty
      if (data.length === 0) {
        // Seed some defaults dynamically
        const defaults = [
          { key: 'hero_slider', name: 'Hero Slideshow Banner', content: { slides: [{ url: '', title: '', description: '' }] } },
          { key: 'admissions_banner', name: 'Admissions Open Banner', content: { message: 'Admissions Open From LKG To Class X.', button_text: 'Apply For Admissions', button_link: '/contact' } },
          { key: 'welcome_text', name: 'Welcome Message Intro', content: { title: 'Welcome to The Greenwood Public School', body: 'Experience educational excellence.' } },
          { key: 'achievements', name: 'Latest Achievements Counter', content: { title: 'Our Proud Moments', items: [{ number: '1200+', label: 'Students' }] } }
        ];
        
        for (const item of defaults) {
          await adminApi.updateHomepageSection(item.key, { is_enabled: 1, content: item.content });
        }
        const updated = await adminApi.listHomepageSections();
        setSections(updated);
      } else {
        setSections(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch homepage sections configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = async (section) => {
    const isEnabled = section.is_enabled ? 0 : 1;
    try {
      await adminApi.updateHomepageSection(section.section_key, {
        is_enabled: isEnabled,
        content: section.content
      });
      fetchSections();
    } catch (err) {
      alert(err.message || 'Failed to toggle section status');
    }
  };

  const handleMove = async (index, direction) => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[nextIdx];
    reordered[nextIdx] = temp;

    const keysOrder = reordered.map(s => s.section_key);
    try {
      await adminApi.saveHomepageSectionsOrder(keysOrder);
      fetchSections();
    } catch (err) {
      alert(err.message || 'Failed to save sections sorting');
    }
  };

  const handleEditClick = (section) => {
    setEditingSection(section);
    setEditContent(section.content || {});
  };

  const handleEditContentChange = (key, value) => {
    setEditContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateHomepageSection(editingSection.section_key, {
        is_enabled: editingSection.is_enabled,
        content: editContent
      });
      setEditingSection(null);
      fetchSections();
      alert('Homepage section configuration saved!');
    } catch (err) {
      alert(err.message || 'Failed to save content configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePickerCallback = (url) => {
    if (mediaTarget) {
      const { index, key } = mediaTarget;
      // Array field
      if (index !== undefined) {
        const list = [...editContent[key]];
        list[index].url = url;
        handleEditContentChange(key, list);
      } else {
        // Flat field
        handleEditContentChange(key, url);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading landing layout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Header bar */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Homepage Layout Section Manager</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable homepage sections, reorder segments, and configure their dynamic variables.
        </p>
      </div>

      {/* Main Sections table/list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b pb-2 border-gray-100 flex items-center gap-1.5">
            <FiHome />
            <span>Active Sections Layout</span>
          </h3>

          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div
                key={sec.section_key}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border rounded-2xl shadow-sm gap-4 transition-all hover:shadow-md ${
                  !sec.is_enabled ? 'border-gray-250 opacity-60' : 'border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm leading-tight">{sec.section_name}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded-full border ${
                      sec.is_enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {sec.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Key identifier: {sec.section_key}</p>
                </div>

                {/* Reordering and configuration triggers */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-500 disabled:opacity-30 cursor-pointer"
                  >
                    <FiArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-500 disabled:opacity-30 cursor-pointer"
                  >
                    <FiArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(sec)}
                    className={`p-2 rounded-lg border border-transparent transition-colors cursor-pointer ${
                      sec.is_enabled
                        ? 'hover:bg-red-50 text-red-500'
                        : 'hover:bg-emerald-50 text-emerald-500'
                    }`}
                    title={sec.is_enabled ? 'Disable section' : 'Enable section'}
                  >
                    {sec.is_enabled ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditClick(sec)}
                    className="p-2 hover:bg-amber-50 hover:border-amber-200 text-amber-600 border border-transparent rounded-lg transition-all cursor-pointer"
                    title="Configure content variables"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION JSON EDITOR WORKSPACE */}
        <div className="space-y-4">
          {editingSection ? (
            <form onSubmit={handleSaveContent} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 text-sm">
              <div className="flex items-center justify-between border-b pb-2 border-gray-50">
                <h3 className="font-serif font-bold text-gray-800">Edit Settings: {editingSection.section_name}</h3>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="text-xs text-gray-400 font-bold hover:text-gray-650 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* DYNAMIC FORMS TAILORED FOR HERO SLIDER */}
              {editingSection.section_key === 'hero_slider' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-1 border-gray-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Slider Images</label>
                    <button
                      type="button"
                      onClick={() => {
                        const list = editContent.slides || [];
                        handleEditContentChange('slides', [...list, { url: '', title: '', description: '' }]);
                      }}
                      className="text-xs font-bold text-amber-500 flex items-center gap-0.5 cursor-pointer"
                    >
                      <FiPlus />
                      <span>Add Slide</span>
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {(editContent.slides || []).map((slide, i) => (
                      <div key={i} className="p-4 bg-gray-50 border rounded-2xl relative space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Slide Image URL"
                            value={slide.url}
                            onChange={(e) => {
                              const list = [...editContent.slides];
                              list[i].url = e.target.value;
                              handleEditContentChange('slides', list);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTarget({ index: i, key: 'slides' });
                              setMediaOpen(true);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <FiImage className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Header Title"
                          value={slide.title || ''}
                          onChange={(e) => {
                            const list = [...editContent.slides];
                            list[i].title = e.target.value;
                            handleEditContentChange('slides', list);
                          }}
                          className="w-full bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                        />
                        <textarea
                          placeholder="Subtitle Description"
                          value={slide.description || ''}
                          onChange={(e) => {
                            const list = [...editContent.slides];
                            list[i].description = e.target.value;
                            handleEditContentChange('slides', list);
                          }}
                          className="w-full bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none h-12 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const list = editContent.slides.filter((_, idx) => idx !== i);
                            handleEditContentChange('slides', list);
                          }}
                          className="text-red-500 hover:text-red-650 absolute top-2 right-2 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC FORMS TAILORED FOR ADMISSIONS BANNER */}
              {editingSection.section_key === 'admissions_banner' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Banner Notification Text</label>
                    <input
                      type="text"
                      value={editContent.message || ''}
                      onChange={(e) => handleEditContentChange('message', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Button Display Text</label>
                    <input
                      type="text"
                      value={editContent.button_text || ''}
                      onChange={(e) => handleEditContentChange('button_text', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Button Redirect URL</label>
                    <input
                      type="text"
                      value={editContent.button_link || ''}
                      onChange={(e) => handleEditContentChange('button_link', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FORMS TAILORED FOR WELCOME INTRO */}
              {editingSection.section_key === 'welcome_text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Intro Title</label>
                    <input
                      type="text"
                      value={editContent.title || ''}
                      onChange={(e) => handleEditContentChange('title', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Intro Description Body</label>
                    <textarea
                      value={editContent.body || ''}
                      onChange={(e) => handleEditContentChange('body', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none h-24 resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* RETAIN STATS ITEMS */}
              {editingSection.section_key === 'achievements' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Achievements Heading</label>
                    <input
                      type="text"
                      value={editContent.title || ''}
                      onChange={(e) => handleEditContentChange('title', e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  <FiSave />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm text-center text-gray-400 text-sm py-16">
              Click the edit pencil icon on any active section to modify its variables and images.
            </div>
          )}
        </div>

      </div>

      {/* RENDER DEDICATED MEDIA PICKER */}
      <MediaPicker
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handlePickerCallback}
        categoryFilter="gallery"
      />

    </div>
  );
};

export default HomepageManager;
