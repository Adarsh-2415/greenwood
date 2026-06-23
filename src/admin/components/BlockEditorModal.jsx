// src/admin/components/BlockEditorModal.jsx
import React, { useState, useEffect } from 'react';
import RichTextEditor from '../editors/RichTextEditor.jsx';
import MediaPicker from './MediaPicker.jsx';
import { FiX, FiPlus, FiTrash2, FiImage, FiFolder } from 'react-icons/fi';

export const BlockEditorModal = ({ isOpen, onClose, onSave, block }) => {
  const [data, setData] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState('');
  const [pickerCallback, setPickerCallback] = useState(null);

  useEffect(() => {
    if (block) {
      setData(block.data || {});
    } else {
      setData({});
    }
  }, [block]);

  const openPicker = (category, callback) => {
    setPickerCategory(category);
    setPickerCallback(() => callback);
    setPickerOpen(true);
  };

  const handlePickerSelect = (file) => {
    if (pickerCallback) {
      pickerCallback(file.file_url);
    }
  };

  const handleFieldChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  if (!isOpen || !block) return null;

  const type = block.block_type;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
      <div className="w-full max-w-3xl bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-150 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-gray-800 capitalize">
            Edit {type.replace('_', ' ')} Block
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-gray-500 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          
          {/* TEXT BLOCK FIELDS */}
          {type === 'text' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Heading</label>
                <input
                  type="text"
                  value={data.heading || ''}
                  onChange={(e) => handleFieldChange('heading', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Welcome to Greenwood"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Content Body</label>
                <RichTextEditor
                  value={data.body || ''}
                  onChange={(val) => handleFieldChange('body', val)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Text Alignment</label>
                <select
                  value={data.alignment || 'left'}
                  onChange={(e) => handleFieldChange('alignment', e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 font-bold text-gray-600 outline-none"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          {/* IMAGE BLOCK FIELDS */}
          {type === 'image' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image Source</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={data.url || ''}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                    placeholder="/uploads/image/filename.jpg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => openPicker('image', (url) => handleFieldChange('url', url))}
                    className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FiImage />
                    <span>Choose</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={data.alt || ''}
                  onChange={(e) => handleFieldChange('alt', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="Greenwood school campus building"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Caption (Optional)</label>
                <input
                  type="text"
                  value={data.caption || ''}
                  onChange={(e) => handleFieldChange('caption', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="Arial view of our secondary wing campus"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Alignment</label>
                <select
                  value={data.alignment || 'center'}
                  onChange={(e) => handleFieldChange('alignment', e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 font-bold text-gray-600 outline-none"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          {/* GALLERY BLOCK FIELDS */}
          {type === 'gallery' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gallery Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Sports Day Highlights"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Columns Layout</label>
                <select
                  value={data.columns || 3}
                  onChange={(e) => handleFieldChange('columns', parseInt(e.target.value))}
                  className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 font-bold text-gray-600 outline-none"
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>

              {/* Gallery Images List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Gallery Items</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.images || [];
                      handleFieldChange('images', [...list, { url: '', title: '', description: '' }]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add Image</span>
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(data.images || []).map((img, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 border rounded-2xl relative">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={img.url}
                            onChange={(e) => {
                              const list = [...data.images];
                              list[i].url = e.target.value;
                              handleFieldChange('images', list);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs font-mono outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => openPicker('gallery', (url) => {
                              const list = [...data.images];
                              list[i].url = url;
                              handleFieldChange('images', list);
                            })}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <FiImage className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Title"
                            value={img.title || ''}
                            onChange={(e) => {
                              const list = [...data.images];
                              list[i].title = e.target.value;
                              handleFieldChange('images', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Description / Alt text"
                            value={img.description || ''}
                            onChange={(e) => {
                              const list = [...data.images];
                              list[i].description = e.target.value;
                              handleFieldChange('images', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.images.filter((_, idx) => idx !== i);
                          handleFieldChange('images', list);
                        }}
                        className="text-red-500 hover:text-red-600 self-center cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PDF BLOCK FIELDS */}
          {type === 'pdf' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Document Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Syllabus 2026-27"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <input
                  type="text"
                  value={data.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="Complete syllabus details for classes LKG to X"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">PDF File Url</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={data.url || ''}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                    placeholder="/uploads/document/syllabus.pdf"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => openPicker('document', (url) => handleFieldChange('url', url))}
                    className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs uppercase px-4 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FiFolder />
                    <span>Choose</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VIDEO BLOCK FIELDS */}
          {type === 'video' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Video Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="School Annual Day"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <input
                  type="text"
                  value={data.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Video URL (YouTube or Direct Link)</label>
                <input
                  type="text"
                  value={data.url || ''}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono text-xs"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            </>
          )}

          {/* CARDS BLOCK FIELDS */}
          {type === 'cards' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Our Highlights"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Columns Layout</label>
                <select
                  value={data.columns || 3}
                  onChange={(e) => handleFieldChange('columns', parseInt(e.target.value))}
                  className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 font-bold text-gray-600 outline-none"
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>

              {/* Cards list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Cards List</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.cards || [];
                      handleFieldChange('cards', [...list, { title: '', description: '', image: '', link: '' }]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add Card</span>
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(data.cards || []).map((card, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 border rounded-2xl relative">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Card Title"
                            value={card.title}
                            onChange={(e) => {
                              const list = [...data.cards];
                              list[i].title = e.target.value;
                              handleFieldChange('cards', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Read More Link (Optional)"
                            value={card.link || ''}
                            onChange={(e) => {
                              const list = [...data.cards];
                              list[i].link = e.target.value;
                              handleFieldChange('cards', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none font-mono"
                          />
                        </div>
                        <textarea
                          placeholder="Card Description"
                          value={card.description}
                          onChange={(e) => {
                            const list = [...data.cards];
                            list[i].description = e.target.value;
                            handleFieldChange('cards', list);
                          }}
                          className="w-full bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none h-16 resize-none"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Card Image URL"
                            value={card.image || ''}
                            onChange={(e) => {
                              const list = [...data.cards];
                              list[i].image = e.target.value;
                              handleFieldChange('cards', list);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openPicker('image', (url) => {
                              const list = [...data.cards];
                              list[i].image = url;
                              handleFieldChange('cards', list);
                            })}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <FiImage className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.cards.filter((_, idx) => idx !== i);
                          handleFieldChange('cards', list);
                        }}
                        className="text-red-500 hover:text-red-600 self-center cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* FACULTY BLOCK FIELDS */}
          {type === 'faculty' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Teaching Staff"
                />
              </div>

              {/* Members list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Staff Members</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.members || [];
                      handleFieldChange('members', [...list, { name: '', designation: '', qualification: '', image: '' }]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add Member</span>
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(data.members || []).map((m, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 border rounded-2xl relative">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Name"
                            value={m.name}
                            onChange={(e) => {
                              const list = [...data.members];
                              list[i].name = e.target.value;
                              handleFieldChange('members', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Designation"
                            value={m.designation || ''}
                            onChange={(e) => {
                              const list = [...data.members];
                              list[i].designation = e.target.value;
                              handleFieldChange('members', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Qualifications"
                            value={m.qualification || ''}
                            onChange={(e) => {
                              const list = [...data.members];
                              list[i].qualification = e.target.value;
                              handleFieldChange('members', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Photo URL"
                            value={m.image || ''}
                            onChange={(e) => {
                              const list = [...data.members];
                              list[i].image = e.target.value;
                              handleFieldChange('members', list);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openPicker('faculty', (url) => {
                              const list = [...data.members];
                              list[i].image = url;
                              handleFieldChange('members', list);
                            })}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <FiImage className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.members.filter((_, idx) => idx !== i);
                          handleFieldChange('members', list);
                        }}
                        className="text-red-500 hover:text-red-600 self-center cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STATS BLOCK FIELDS */}
          {type === 'stats' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Statistics Counters</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.items || [];
                      handleFieldChange('items', [...list, { number: '', label: '' }]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add Stat</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {(data.items || []).map((stat, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Number (e.g. 1200+)"
                        value={stat.number}
                        onChange={(e) => {
                          const list = [...data.items];
                          list[i].number = e.target.value;
                          handleFieldChange('items', list);
                        }}
                        className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-bold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Students)"
                        value={stat.label}
                        onChange={(e) => {
                          const list = [...data.items];
                          list[i].label = e.target.value;
                          handleFieldChange('items', list);
                        }}
                        className="flex-1 bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.items.filter((_, idx) => idx !== i);
                          handleFieldChange('items', list);
                        }}
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TABLE BLOCK FIELDS */}
          {type === 'table' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Headers (Comma-separated)</label>
                <input
                  type="text"
                  value={(data.headers || []).join(', ')}
                  onChange={(e) => handleFieldChange('headers', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Class, Tuition Fee, Term Fee"
                />
              </div>

              {/* Rows Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Rows</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.rows || [];
                      const colCount = (data.headers || []).length || 1;
                      const newRow = Array(colCount).fill('');
                      handleFieldChange('rows', [...list, newRow]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add Row</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {(data.rows || []).map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-center">
                      {(data.headers || []).map((_, cIdx) => (
                        <div key={cIdx} className="flex-1 flex gap-1 items-center">
                          <input
                            type="text"
                            placeholder={`Col ${cIdx + 1}`}
                            value={row[cIdx] || ''}
                            onChange={(e) => {
                              const newRows = [...data.rows];
                              newRows[rIdx][cIdx] = e.target.value;
                              handleFieldChange('rows', newRows);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none min-w-[60px]"
                          />
                          <button
                            type="button"
                            onClick={() => openPicker('document', (url) => {
                              const newRows = [...data.rows];
                              newRows[rIdx][cIdx] = url;
                              handleFieldChange('rows', newRows);
                            })}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                            title="Choose uploaded document or upload new"
                          >
                            <FiFolder className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.rows.filter((_, idx) => idx !== rIdx);
                          handleFieldChange('rows', list);
                        }}
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* NOTICE BLOCK FIELDS */}
          {type === 'notice' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Notice Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Exam Timetable Announcement"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Notice Date</label>
                <input
                  type="text"
                  value={data.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50"
                  placeholder="e.g. Oct 15, 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Content Description</label>
                <RichTextEditor
                  value={data.body || ''}
                  onChange={(val) => handleFieldChange('body', val)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Notice Importance Level</label>
                <select
                  value={data.type || 'info'}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl py-1.5 px-3 font-bold text-gray-600 outline-none"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="danger">High Priority (Red)</option>
                </select>
              </div>
            </>
          )}

          {/* DOWNLOADS BLOCK FIELDS */}
          {type === 'downloads' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="Important Forms"
                />
              </div>

              {/* Files list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Documents / Resources</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = data.files || [];
                      handleFieldChange('files', [...list, { title: '', size: '', url: '' }]);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer"
                  >
                    <FiPlus />
                    <span>Add File</span>
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(data.files || []).map((file, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 border rounded-2xl relative">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Resource Display Name"
                            value={file.title}
                            onChange={(e) => {
                              const list = [...data.files];
                              list[i].title = e.target.value;
                              handleFieldChange('files', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none font-semibold"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Size Label (e.g. 240 KB)"
                            value={file.size || ''}
                            onChange={(e) => {
                              const list = [...data.files];
                              list[i].size = e.target.value;
                              handleFieldChange('files', list);
                            }}
                            className="bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="File URL link"
                            value={file.url || ''}
                            onChange={(e) => {
                              const list = [...data.files];
                              list[i].url = e.target.value;
                              handleFieldChange('files', list);
                            }}
                            className="flex-1 bg-white border border-gray-250 rounded-xl py-1.5 px-3 text-xs outline-none font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => openPicker('document', (url) => {
                              const list = [...data.files];
                              list[i].url = url;
                              handleFieldChange('files', list);
                            })}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
                          >
                            <FiFolder className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.files.filter((_, idx) => idx !== i);
                          handleFieldChange('files', list);
                        }}
                        className="text-red-500 hover:text-red-600 self-center cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CTA BLOCK FIELDS */}
          {type === 'cta' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">CTA Title Banner</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-serif font-bold text-base"
                  placeholder="Admissions Open for 2026-27"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">CTA Subtitle Description</label>
                <textarea
                  value={data.text || ''}
                  onChange={(e) => handleFieldChange('text', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none h-20 resize-none"
                  placeholder="Nurturing creative thinkers and tomorrow's leaders. Apply online now."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Button Text</label>
                  <input
                    type="text"
                    value={data.buttonText || ''}
                    onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none font-semibold"
                    placeholder="Apply Online"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Button Link / Redirect Url</label>
                  <input
                    type="text"
                    value={data.buttonLink || ''}
                    onChange={(e) => handleFieldChange('buttonLink', e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none font-mono"
                    placeholder="/contact"
                  />
                </div>
              </div>
            </>
          )}

          {/* SPACER BLOCK FIELDS */}
          {type === 'spacer' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Spacer Height (Pixels)</label>
              <input
                type="number"
                value={data.height || 40}
                onChange={(e) => handleFieldChange('height', parseInt(e.target.value))}
                className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-bold"
                min="10"
                max="200"
                required
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-150 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
            >
              Save Block Changes
            </button>
          </div>

        </form>

      </div>

      {/* Internal Media Picker Modal */}
      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        categoryFilter={pickerCategory}
      />

    </div>
  );
};

export default BlockEditorModal;
