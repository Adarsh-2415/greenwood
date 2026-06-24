import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DOMAIN = 'https://www.greenwoodroorkee.org';

const SEO = ({
  title,
  description = "Welcome to The Greenwood Public School. Nurturing excellence and integrity. Admissions open for the academic batch 2026-27.",
  image = "/logo.jpeg",
  type = "website",
  canonicalUrl,
  schema
}) => {
  const location = useLocation();
  const url = canonicalUrl || `${DOMAIN}${location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${DOMAIN}${image}`;
  const fullTitle = title ? `${title} | The Greenwood Public School` : "The Greenwood Public School";

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured Data Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
