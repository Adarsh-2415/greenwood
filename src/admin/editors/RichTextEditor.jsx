// src/admin/editors/RichTextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  FiBold, FiItalic, FiUnderline, 
  FiList, FiAlignLeft, FiAlignCenter, 
  FiAlignRight, FiLink, FiChevronsLeft 
} from 'react-icons/fi';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL link:', previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-gray-50 border-b border-gray-250 select-none">
      
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-amber-500/20 text-amber-700 font-bold' : ''}`}
        title="Bold"
      >
        <FiBold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-amber-500/20 text-amber-700 font-bold' : ''}`}
        title="Italic"
      >
        <FiItalic className="w-4 h-4" />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('underline') ? 'bg-amber-500/20 text-amber-700 font-bold' : ''}`}
        title="Underline"
      >
        <FiUnderline className="w-4 h-4" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Heading 2 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-xs font-bold rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-500/20 text-amber-700' : ''}`}
        title="Heading 2"
      >
        H2
      </button>

      {/* Heading 3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 text-xs font-bold rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-amber-500/20 text-amber-700' : ''}`}
        title="Heading 3"
      >
        H3
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-amber-500/20 text-amber-700' : ''}`}
        title="Bullet List"
      >
        <FiList className="w-4 h-4" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-amber-500/20 text-amber-700' : ''}`}
        title="Add Link"
      >
        <FiLink className="w-4 h-4" />
      </button>

      {/* Unlink */}
      {editor.isActive('link') && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Remove Link"
        >
          Unlink
        </button>
      )}

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Clear format */}
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 text-xs font-bold"
        title="Clear Formatting"
      >
        Clear Format
      </button>
    </div>
  );
};

export const RichTextEditor = ({ value = '', onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 hover:text-red-700 underline font-medium'
        }
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto p-4 bg-white text-gray-800 leading-relaxed'
      }
    }
  });

  return (
    <div className="border border-gray-250 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
