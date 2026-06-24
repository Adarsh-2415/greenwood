import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/seo/SEO';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import usePageContent from '../cms/hooks/usePageContent.js';
import BlockRenderer from '../cms/blocks/BlockRenderer.jsx';

const MandatoryDisclosures = () => {
  const { page, blocks, loading, error } = usePageContent('mandatory-disclosures');

  return (
    <div className="w-full flex-1 bg-gray-50/50">
      <SEO 
        title="Mandatory Public Disclosures"
        description="View the mandatory public disclosures, school certificates, and official documentation for The Greenwood Public School as per CBSE guidelines."
      />
      <Breadcrumbs paths={[{ label: 'Home', url: '/' }, { label: 'Mandatory Disclosures', url: '/mandatory-disclosures' }]} />
      {/* HERO SECTION */}
      <section className="relative w-full h-[35vh] min-h-[280px] overflow-hidden bg-school-deepRed flex items-center justify-center border-b-4 border-school-gold">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(223,37,49,0.2),transparent_50%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4 md:px-8 select-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-md"
          >
            Mandatory <span className="text-school-gold">Disclosures</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-16 h-1 bg-school-gold rounded-full mx-auto mb-5"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="text-white/80 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
          >
            Mandatory information disclosures as per CBSE regulations and Right to Education (RTE) Act compliance.
          </motion.p>
        </div>
      </section>

      {/* CONTENT SECTION — Dynamic Blocks */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-school-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error || !blocks || blocks.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <p className="text-gray-400 text-sm">No disclosures published yet.</p>
            </div>
          ) : (
            <BlockRenderer blocks={blocks} />
          )}
        </div>
      </section>
    </div>
  );
};

export default MandatoryDisclosures;
