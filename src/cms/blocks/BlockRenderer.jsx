// src/cms/blocks/BlockRenderer.jsx
import React from 'react';
import DOMPurify from 'dompurify';
import { FiDownload, FiFileText, FiUser, FiInfo, FiCalendar, FiArrowRight } from 'react-icons/fi';

// 1. Text Block
const TextBlock = ({ heading, body, alignment = 'left' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment] || 'text-left';

  return (
    <div className={`w-full max-w-4xl mx-auto my-8 px-4 ${alignClass}`}>
      {heading && (
        <h2 className="font-serif text-3xl font-bold text-gray-800 mb-4 tracking-tight border-b pb-2 border-gray-100">
          {heading}
        </h2>
      )}
      {body && (
        <div
          className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
        />
      )}
    </div>
  );
};

// 2. Image Block
const ImageBlock = ({ url, caption, alt, alignment = 'center' }) => {
  const alignClass = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  }[alignment] || 'mx-auto';

  return (
    <div className={`w-full max-w-4xl my-8 px-4 flex flex-col items-center`}>
      <div className={`overflow-hidden rounded-xl shadow-md border border-gray-100 ${alignClass}`}>
        <img
          src={url}
          alt={alt || caption || 'Page Image'}
          className="max-h-[500px] w-auto object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      {caption && <p className="text-sm text-gray-500 mt-3 italic">{caption}</p>}
    </div>
  );
};

// 3. Gallery Block
const GalleryBlock = ({ title, columns = 3, images = [] }) => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      {title && (
        <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-amber-500 pl-3">
          {title}
        </h3>
      )}
      <div className={`grid gap-6 ${cols}`}>
        {(images || []).map((img, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white aspect-square flex flex-col"
          >
            <div className="flex-1 overflow-hidden">
              <img
                src={img.url}
                alt={img.alt || img.title || 'Gallery Item'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {(img.title || img.description) && (
              <div className="p-4 bg-white border-t border-gray-50">
                {img.title && <h4 className="font-medium text-gray-800 text-sm">{img.title}</h4>}
                {img.description && <p className="text-xs text-gray-500 mt-1">{img.description}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. PDF Block
const PDFBlock = ({ title, description, url }) => {
  const isPDF = url && url.toLowerCase().split('?')[0].endsWith('.pdf');
  const isWord = url && (url.toLowerCase().split('?')[0].endsWith('.docx') || url.toLowerCase().split('?')[0].endsWith('.doc'));

  const absoluteUrl = url ? (url.startsWith('http') ? url : window.location.origin + url) : '';
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <FiFileText className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-gray-800">{title || 'Document'}</h4>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <FiDownload />
          <span>View / Download</span>
        </a>
      </div>
      {url && isPDF && (
        <div className="w-full h-[600px] border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white">
          <iframe
            src={`${url}#toolbar=0`}
            title={title || 'PDF Preview'}
            className="w-full h-full border-none"
          />
        </div>
      )}
      {url && isWord && (
        <div className="w-full h-[600px] border border-gray-200 rounded-2xl overflow-hidden shadow-md bg-white flex flex-col">
          {window.location.hostname === 'localhost' && (
            <div className="bg-amber-50 text-amber-800 p-3.5 text-xs border-b border-amber-100 font-medium select-none">
              💡 <b>Localhost Preview Notice:</b> The Word document preview will load via Microsoft Office Web Viewer once the website is published and hosted live on the internet.
            </div>
          )}
          <iframe
            src={officeViewerUrl}
            title={title || 'Word Document Preview'}
            className="w-full h-full border-none"
          />
        </div>
      )}
    </div>
  );
};

// 5. Video Block
const VideoBlock = ({ url, title, description }) => {
  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return '';
    // YouTube short url
    if (videoUrl.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1].split('?')[0]}`;
    }
    // YouTube watch URL
    if (videoUrl.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(videoUrl).search);
      return `https://www.youtube.com/embed/${urlParams.get('v')}`;
    }
    // direct link
    return videoUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="w-full max-w-4xl mx-auto my-10 px-4">
      {title && <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">{title}</h3>}
      {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
      
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-150 bg-black">
        {url.includes('youtube.com') || url.includes('youtu.be') ? (
          <iframe
            src={embedUrl}
            title={title || 'Video Player'}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        ) : (
          <video src={url} controls className="absolute inset-0 w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
};

// 6. Cards Block
const CardsBlock = ({ title, columns = 3, cards = [] }) => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      {title && (
        <h3 className="font-serif text-2xl font-semibold text-gray-800 mb-8 border-l-4 border-amber-500 pl-3">
          {title}
        </h3>
      )}
      <div className={`grid gap-6 ${cols}`}>
        {(cards || []).map((card, index) => (
          <div
            key={index}
            className="flex flex-col bg-white border border-gray-150 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {card.image && (
              <div className="h-48 overflow-hidden bg-gray-100">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="font-serif font-bold text-lg text-gray-800 mb-2">{card.title}</h4>
              <p className="text-sm text-gray-600 mb-4 flex-1">{card.description}</p>
              {card.link && (
                <a
                  href={card.link}
                  className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 mt-2 gap-1 group"
                >
                  <span>Read More</span>
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Faculty Block
const FacultyBlock = ({ title, members = [] }) => {
  return (
    <div className="w-full max-w-6xl mx-auto my-12 px-4">
      {title && (
        <h3 className="font-serif text-2xl font-bold text-gray-800 mb-8 text-center">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {(members || []).map((member, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border-2 border-amber-500 bg-gray-50 flex items-center justify-center text-gray-400">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-10 h-10" />
              )}
            </div>
            <h4 className="font-serif font-bold text-gray-800 text-base">{member.name}</h4>
            {member.designation && <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mt-1">{member.designation}</p>}
            {member.qualification && <p className="text-xs text-gray-500 mt-1 italic">{member.qualification}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. Stats Block
const StatsBlock = ({ items = [] }) => {
  return (
    <div className="w-full bg-slate-900 my-12 py-10 text-white">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {(items || []).map((stat, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-4xl md:text-5xl font-extrabold text-amber-500 tracking-tight mb-2">
              {stat.number}
            </span>
            <span className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Table Block
const TableBlock = ({ headers = [], rows = [] }) => {
  const isLinkColumn = (headerText) => {
    if (!headerText) return false;
    const lower = String(headerText).toLowerCase();
    return lower.includes('link') || lower.includes('website') || lower.includes('url');
  };

  const isUploadedUrl = (str) => {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase().includes('greenwoodroorkee.org') && trimmed.toLowerCase().replace(/\/+$/, '') === 'http://greenwoodroorkee.org') {
      return false;
    }
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/uploads/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 overflow-x-auto">
      <table className="w-full min-w-[500px] border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-150">
        <thead>
          <tr className="bg-slate-900 text-white text-left font-serif text-sm">
            {(headers || []).map((h, i) => (
              <th key={i} className="px-6 py-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
          {(rows || []).map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
              {(row || []).map((cell, cIdx) => {
                const cellStr = String(cell || '').trim();
                const headerText = headers[cIdx] || '';

                if (isUploadedUrl(cellStr)) {
                  if (isLinkColumn(headerText)) {
                    return (
                      <td key={cIdx} className="px-6 py-4">
                        <a
                          href={cellStr}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          <FiFileText className="w-3.5 h-3.5" />
                          <span>Click to View</span>
                        </a>
                      </td>
                    );
                  } else {
                    return (
                      <td key={cIdx} className="px-6 py-4">
                        <a
                          href={cellStr}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 underline font-medium break-all"
                        >
                          {cellStr}
                        </a>
                      </td>
                    );
                  }
                } else if (isLinkColumn(headerText)) {
                  return (
                    <td key={cIdx} className="px-6 py-4 text-gray-400 font-semibold italic">
                      N/A
                    </td>
                  );
                }

                return <td key={cIdx} className="px-6 py-4">{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 10. Notice Block
const NoticeBlock = ({ title, date, body, type = 'info' }) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 icon-bg-blue-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-bg-amber-100',
    danger: 'bg-red-50 border-red-200 text-red-800 icon-bg-red-100'
  }[type] || 'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className={`flex items-start gap-4 p-5 rounded-2xl border shadow-sm ${colors.split(' ')[0]} ${colors.split(' ')[1]}`}>
        <div className="p-3 bg-white/80 rounded-xl border border-inherit mt-0.5">
          <FiInfo className="w-5 h-5 text-inherit" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <h4 className="font-serif font-bold text-base text-gray-800">{title || 'Notice'}</h4>
            {date && (
              <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <FiCalendar />
                {date}
              </span>
            )}
          </div>
          <div
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
          />
        </div>
      </div>
    </div>
  );
};

// 11. Downloads Block
const DownloadsBlock = ({ title, files = [] }) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      {title && (
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="divide-y divide-gray-150 border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        {(files || []).map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 border border-amber-150 text-amber-600 rounded-lg">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-medium text-gray-800 text-sm block">{file.title}</span>
                {file.size && <span className="text-xs text-gray-400 font-semibold">{file.size}</span>}
              </div>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 cursor-pointer"
            >
              <FiDownload />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// 12. CTA Block
const CTABlock = ({ title, text, buttonText, buttonLink }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4">
      <div className="bg-gradient-to-r from-red-800 to-amber-700 text-white rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <h3 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{title}</h3>
        {text && <p className="text-white/80 max-w-xl mx-auto text-base font-light mb-8 leading-relaxed">{text}</p>}
        {buttonText && buttonLink && (
          <a
            href={buttonLink}
            className="inline-block bg-white hover:bg-amber-500 hover:text-white text-gray-900 font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg cursor-pointer transform hover:scale-[1.03]"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
};

// 13. Spacer Block
const SpacerBlock = ({ height = 40 }) => {
  return <div style={{ height: `${height}px` }} className="w-full" />;
};

// Master Renderer Mapper
export const BlockRenderer = ({ blocks = [] }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="cms-content-wrapper">
      {blocks.map((block) => {
        const { id, block_type, data, is_visible } = block;

        // Skip if not visible
        if (is_visible === 0 || is_visible === false) return null;

        const blockData = data || {};

        switch (block_type) {
          case 'text':
            return <TextBlock key={id} {...blockData} />;
          case 'image':
            return <ImageBlock key={id} {...blockData} />;
          case 'gallery':
            return <GalleryBlock key={id} {...blockData} />;
          case 'pdf':
            return <PDFBlock key={id} {...blockData} />;
          case 'video':
            return <VideoBlock key={id} {...blockData} />;
          case 'cards':
            return <CardsBlock key={id} {...blockData} />;
          case 'faculty':
            return <FacultyBlock key={id} {...blockData} />;
          case 'stats':
            return <StatsBlock key={id} {...blockData} />;
          case 'table':
            return <TableBlock key={id} {...blockData} />;
          case 'notice':
            return <NoticeBlock key={id} {...blockData} />;
          case 'downloads':
            return <DownloadsBlock key={id} {...blockData} />;
          case 'cta':
            return <CTABlock key={id} {...blockData} />;
          case 'spacer':
            return <SpacerBlock key={id} {...blockData} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlockRenderer;
