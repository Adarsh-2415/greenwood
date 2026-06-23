// src/cms/hooks/usePageContent.js
import { useState, useEffect } from 'react';
import { cmsApi } from '../api.js';

export const usePageContent = (slug) => {
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cmsApi.getPage(slug);
        setPage(data.page);
        setBlocks(data.blocks || []);
      } catch (err) {
        setError(err.message || 'Failed to load page content.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  return { page, blocks, loading, error };
};
export default usePageContent;
