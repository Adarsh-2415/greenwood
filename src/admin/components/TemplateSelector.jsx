// src/admin/components/TemplateSelector.jsx
import React from 'react';
import { FiFileText, FiImage, FiUsers, FiBell, FiDownload, FiAward } from 'react-icons/fi';

const templates = [
  { name: 'basic', label: 'Basic Page', description: 'Simple grid with text, rich editor, and image blocks', icon: FiFileText, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { name: 'gallery', label: 'Gallery Page', description: 'Photo albums, media collages and layout columns', icon: FiImage, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { name: 'faculty', label: 'Faculty Page', description: 'Staff directory listing with designations and photos', icon: FiUsers, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
  { name: 'notice_board', label: 'Notice Board', description: 'Official notice board feeds with color codes and dates', icon: FiBell, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { name: 'downloads', label: 'Downloads Page', description: 'File download list (fees structure, documents, PDFs)', icon: FiDownload, color: 'text-rose-500 bg-rose-50 border-rose-100' },
  { name: 'achievement', label: 'Achievements', description: 'Awards, recognition galleries and scholarships', icon: FiAward, color: 'text-violet-500 bg-violet-50 border-violet-100' }
];

export const TemplateSelector = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((tpl) => {
        const Icon = tpl.icon;
        const isSelected = selected === tpl.name;

        return (
          <button
            key={tpl.name}
            type="button"
            onClick={() => onSelect(tpl.name)}
            className={`flex items-start gap-4 p-5 bg-white border rounded-2xl shadow-sm text-left transition-all cursor-pointer ${
              isSelected
                ? 'border-amber-500 ring-4 ring-amber-500/10'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className={`p-3 rounded-xl ${tpl.color.split(' ').slice(0, 2).join(' ')} border ${isSelected ? 'border-amber-500/30' : tpl.color.split(' ')[2]}`}>
              <Icon className="w-5 h-5 text-inherit" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm leading-tight">{tpl.label}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tpl.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TemplateSelector;
