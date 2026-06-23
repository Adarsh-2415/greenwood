// src/cms/DynamicPage.jsx
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import usePageContent from './hooks/usePageContent.js';
import BlockRenderer from './blocks/BlockRenderer.jsx';

export const DynamicPage = () => {
  const { slug } = useParams();
  const location = useLocation();

  // Resolve slug: if it's the wildcard match, get slug from path
  const resolvedSlug = slug || location.pathname.substring(1) || 'home';

  const { page, blocks, loading, error } = usePageContent(resolvedSlug);

  // Dynamic SEO Injection
  useEffect(() => {
    if (page) {
      // Set Document Title
      document.title = page.meta_title || `${page.title} | The Greenwood Public School`;

      // Set Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = page.meta_description || 'Welcome to The Greenwood Public School';

      // Set Meta Keywords
      let metaKey = document.querySelector('meta[name="keywords"]');
      if (!metaKey) {
        metaKey = document.createElement('meta');
        metaKey.name = 'keywords';
        document.head.appendChild(metaKey);
      }
      metaKey.content = page.meta_keywords || 'school, education, Greenwood';

      // Set Open Graph Image
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.content = page.og_image || '';

      // Set Canonical Link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = page.canonical_url || window.location.href;
    }
  }, [page]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-white border border-gray-150 p-8 rounded-3xl shadow-sm">
          <span className="text-4xl mb-4 block">📄</span>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The page you are looking for does not exist or has not been published yet.
          </p>
          <a
            href="/"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
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

      {/* Page Content Rendered dynamically */}
      <main className="flex-1 bg-white pb-16">
        <BlockRenderer blocks={blocks} />
      </main>
    </div>
  );
};

export default DynamicPage;
