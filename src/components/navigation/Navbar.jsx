import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMenu, FiX, FiMoreHorizontal } from 'react-icons/fi';
import { navigationLinks, contactInfo, getAdditionalPages } from './NavigationConfig';
import logoImg from '../../assets/logo.jpeg';
import { cmsApi } from '../../cms/api.js';

const Navbar = ({ onMobileToggle, isMobileOpen, settings = {} }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [additionalPages, setAdditionalPages] = useState([]);
  const [morePagesOpen, setMorePagesOpen] = useState(false);
  const location = useLocation();

  const formatSchoolName = (fullName) => {
    if (!fullName) return { top: 'The Greenwood', bottom: 'Public School' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      return { top: parts[0], bottom: '' };
    }
    if (parts.length >= 3) {
      const bottom = parts.slice(-2).join(' ');
      const top = parts.slice(0, -2).join(' ');
      return { top, bottom };
    } else {
      const bottom = parts[parts.length - 1];
      const top = parts.slice(0, -1).join(' ');
      return { top, bottom };
    }
  };

  const nameParts = formatSchoolName(settings.school_name);

  // Scroll handler for solid-to-glassmorphic sticky transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync Published CMS custom pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pages = await cmsApi.listPages();
        setAdditionalPages(getAdditionalPages(pages));
      } catch (err) {
        console.error("Failed to load navigation links dynamically:", err);
      }
    };
    fetchPages();
  }, [location.pathname]);

  // Closes dropdowns when routes change
  useEffect(() => {
    setActiveDropdown(null);
    setMorePagesOpen(false);
  }, [location.pathname]);

  // Determine if a dropdown item is currently active
  const isDropdownActive = (items) => {
    return items.some(item => location.pathname === item.path);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e, index, hasDropdown) => {
    if (!hasDropdown) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown(activeDropdown === index ? null : index);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
    }
  };

  return (
    <nav
      className={`w-full z-40 transition-all duration-300 ${
        isSticky
          ? 'fixed top-0 left-0 bg-white/90 backdrop-blur-md shadow-lg py-2 border-b border-school-light/20'
          : 'relative bg-white py-4 border-b border-school-light'
      }`}
      aria-label="Main Website Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-4 2xl:px-8 flex justify-between items-center gap-2 xl:gap-3">
        {/* Branding Logo Area */}
        <NavLink 
          to="/" 
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-school-red/50 rounded-lg p-0 shrink-0"
          aria-label="The Greenwood Public School Home"
        >
          <img 
            src={logoImg} 
            alt="The Greenwood Public School Logo" 
            className="h-14 md:h-16 w-auto object-contain transition-transform hover:scale-105 duration-300"
          />

          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-base md:text-lg tracking-wide text-school-deepRed leading-tight">
              {nameParts.top}
            </h1>
            {nameParts.bottom && (
              <span className="text-xxs uppercase tracking-widest text-school-gold font-semibold leading-none">
                {nameParts.bottom}
              </span>
            )}
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <ul className="hidden xl:flex items-center xl:gap-0 2xl:gap-2" role="menubar">
          {navigationLinks.map((link, index) => {
            const hasDropdown = link.hasDropdown;
            const dropdownOpen = activeDropdown === index;
            const activeClass = link.hasDropdown
              ? isDropdownActive(link.dropdownItems)
                ? 'text-school-red font-semibold'
                : 'text-school-gray'
              : location.pathname === link.path
              ? 'text-school-red font-semibold'
              : 'text-school-gray';

            return (
              <li 
                key={link.id} 
                className="relative" 
                role="none"
                onMouseEnter={() => hasDropdown && setActiveDropdown(index)}
                onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
              >
                {hasDropdown ? (
                  <button
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    onKeyDown={(e) => handleKeyDown(e, index, true)}
                    className={`flex items-center gap-0.5 px-1.5 xl:px-1 2xl:px-3 py-2 text-xs 2xl:text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200 hover:text-school-red focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md ${activeClass}`}
                    role="menuitem"
                  >
                    <span>{link.label}</span>
                    <FiChevronDown 
                      className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-school-red' : 'text-school-gray'}`} 
                      aria-hidden="true" 
                    />
                  </button>
                ) : (
                  <NavLink
                    to={link.path}
                    className={`px-1.5 xl:px-1 2xl:px-3 py-2 text-xs 2xl:text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200 hover:text-school-red focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md block relative`}
                    role="menuitem"
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? 'text-school-red font-semibold' : 'text-school-gray'}>
                          {link.label}
                        </span>
                        {/* Animated Underline Highlight */}
                        {isActive && (
                          <motion.span 
                            layoutId="activeUnderline" 
                            className="absolute bottom-0 left-2 right-2 2xl:left-3 2xl:right-3 h-0.5 bg-school-red rounded"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                )}

                {/* Submenu Dropdown Container */}
                {hasDropdown && (
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute left-0 mt-0.5 w-60 bg-white border border-school-light/60 rounded-xl shadow-xl overflow-hidden py-2 focus:outline-none z-50"
                        role="menu"
                        aria-label={`${link.label} Submenu`}
                      >
                        {link.dropdownItems.map((subItem) => (
                          <li key={subItem.id} role="none">
                            <NavLink
                                  to={subItem.path}
                                  className={({ isActive }) => 
                                    `block px-5 py-2.5 text-xs tracking-wide transition-all duration-200 border-l-2 ${
                                      isActive
                                        ? 'border-school-red bg-school-red/5 font-semibold text-school-deepRed'
                                        : 'border-transparent text-school-gray hover:border-school-gold hover:bg-school-light/40 hover:text-school-dark'
                                    }`
                                  }
                                  role="menuitem"
                                >
                                  {subItem.label}
                                </NavLink>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}

          {/* Dynamic "More Pages" Dropdown Link */}
          {additionalPages.length > 0 && (
            <li 
              className="relative" 
              role="none"
              onMouseEnter={() => setMorePagesOpen(true)}
              onMouseLeave={() => setMorePagesOpen(false)}
            >
              <button
                aria-haspopup="true"
                aria-expanded={morePagesOpen}
                onClick={() => setMorePagesOpen(!morePagesOpen)}
                className={`flex items-center justify-center p-2 text-school-gray hover:text-school-red transition-colors focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md cursor-pointer`}
                role="menuitem"
                title="More Pages"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {morePagesOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 mt-0.5 w-60 bg-white border border-school-light/60 rounded-xl shadow-xl overflow-hidden py-2 focus:outline-none z-50"
                    role="menu"
                    aria-label="More Pages Submenu"
                  >
                    {additionalPages.map((page) => (
                      <li key={page.id} role="none">
                        <NavLink
                          to={page.route}
                          className={({ isActive }) => 
                            `block px-5 py-2.5 text-xs tracking-wide transition-all duration-200 border-l-2 ${
                              isActive
                                ? 'border-school-red bg-school-red/5 font-semibold text-school-deepRed'
                                : 'border-transparent text-school-gray hover:border-school-gold hover:bg-school-light/40 hover:text-school-dark'
                            }`
                          }
                          role="menuitem"
                        >
                          {page.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )}
        </ul>

        {/* CTA Admission Button (Desktop) & Responsive Hamburger Toggle (Mobile) */}
        <div className="flex items-center gap-4 shrink-0">
          <div
            className="hidden sm:inline-flex items-center justify-center bg-school-red text-white font-medium text-xs md:text-sm tracking-wider py-2.5 px-5 rounded-full border border-school-red select-none shadow-md"
          >
            <motion.span
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-1.5"
            >
              <span>{contactInfo.ctaText}</span>
            </motion.span>
          </div>

          {/* Hamburger Trigger for Mobile Drawer */}
          <button
            onClick={onMobileToggle}
            className="xl:hidden p-2 text-school-deepRed hover:bg-school-light rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-school-red/50"
            aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? (
              <FiX className="w-6 h-6 animate-spin-once" aria-hidden="true" />
            ) : (
              <FiMenu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
