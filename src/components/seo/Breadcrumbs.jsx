import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const DOMAIN = 'https://www.greenwoodroorkee.org';

const Breadcrumbs = ({ paths = [] }) => {
  if (!paths || paths.length === 0) return null;

  // Generate BreadcrumbList Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": paths.map((path, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": path.label,
      "item": path.url.startsWith('/') ? `${DOMAIN}${path.url}` : path.url
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="w-full bg-gray-50/50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ol className="flex items-center space-x-2 text-xs md:text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {paths.map((path, index) => {
              const isLast = index === paths.length - 1;
              const isHome = index === 0 && path.url === '/';

              return (
                <li key={index} className="flex items-center">
                  {isHome ? (
                    <Link to="/" className="text-school-red hover:text-school-deepRed flex items-center transition-colors">
                      <FiHome className="w-4 h-4" />
                    </Link>
                  ) : isLast || path.url === '#' ? (
                    <span className={isLast ? "text-school-dark font-semibold" : "text-gray-500"}>
                      {path.label}
                    </span>
                  ) : (
                    <Link to={path.url} className="text-school-red hover:text-school-deepRed transition-colors">
                      {path.label}
                    </Link>
                  )}

                  {!isLast && (
                    <FiChevronRight className="w-4 h-4 mx-2 text-gray-300 shrink-0" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
