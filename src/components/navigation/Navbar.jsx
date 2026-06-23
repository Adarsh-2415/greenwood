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

  const schoolName = settings.school_name || "The Greenwood Public School";

  // Scroll handler for solid-to-glassmorphic sticky transition
  useEffect(() => {
    const handleScroll = () => {
      // The Brand Header is approx 120px tall, so we make it sticky after it scrolls past
      if (window.scrollY > 80) {
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
    <div className="w-full flex flex-col z-40 bg-white">
      {/* 2. Brand Header (Scrolls naturally) */}
      <div className="w-full border-b border-school-light/60 py-4 md:py-6">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
          <NavLink 
            to="/" 
            className="flex items-center gap-4 md:gap-5 focus:outline-none focus:ring-2 focus:ring-school-red/50 rounded-xl p-1 shrink-0 group"
            aria-label="The Greenwood Public School Home"
          >
            <img 
              src={logoImg} 
              alt="The Greenwood Public School Logo" 
              className="h-16 md:h-20 lg:h-24 w-auto object-contain transition-transform group-hover:scale-105 duration-300 drop-shadow-sm rounded-full"
            />
            <div className="flex flex-col text-left justify-center">
              <h1 className="font-serif font-bold text-2xl md:text-3xl lg:text-[32px] tracking-tight text-green-600 leading-tight whitespace-nowrap">
                {schoolName}
              </h1>
              <span className="text-xs md:text-sm uppercase tracking-widest text-school-gold font-semibold leading-none mt-1.5">
                Path Maker for Path Seekers
              </span>
            </div>
          </NavLink>
        </div>
      </div>

      {/* 3. Navigation Bar (Sticky with CSS sticky to prevent layout jumps) */}
      <nav
        className={`w-full z-50 transition-all duration-300 sticky top-0 border-b ${
          isSticky
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3 border-school-light/30'
            : 'bg-white py-3 md:py-4 border-school-light'
        }`}
        aria-label="Main Website Navigation"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex justify-between items-center gap-4 xl:gap-8">
          
          {/* Mobile/Tablet Context (When sticky, show mini brand identity so users aren't lost) */}
          <div className="flex xl:hidden items-center gap-3">
            {isSticky && (
              <NavLink to="/" className="flex items-center gap-2 focus:outline-none rounded-lg">
                <img src={logoImg} alt="Logo" className="h-9 w-auto rounded-full shadow-sm" />
                <span className="font-serif font-bold text-school-deepRed text-sm md:text-base whitespace-nowrap">
                  Greenwood
                </span>
              </NavLink>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <ul className="hidden xl:flex items-center justify-start flex-1 gap-1 2xl:gap-3" role="menubar">
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
                      className={`flex items-center gap-0.5 px-2 2xl:px-3 py-2 text-sm 2xl:text-base font-medium tracking-wide whitespace-nowrap transition-colors duration-200 hover:text-school-red focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md ${activeClass}`}
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
                      className={`px-2 2xl:px-3 py-2 text-sm 2xl:text-base font-medium tracking-wide whitespace-nowrap transition-colors duration-200 hover:text-school-red focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md block relative`}
                      role="menuitem"
                    >
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? 'text-school-red font-semibold' : 'text-school-gray'}>
                            {link.label}
                          </span>
                          {isActive && (
                            <motion.span 
                              layoutId="activeUnderline" 
                              className="absolute bottom-0 left-2 right-2 h-0.5 bg-school-red rounded"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  )}

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
                                  `block px-5 py-2.5 text-sm tracking-wide transition-all duration-200 border-l-2 ${
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

            {/* Dynamic "More Pages" */}
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
                  className={`flex items-center justify-center p-2 px-3 text-school-gray hover:text-school-red transition-colors focus:outline-none focus:ring-2 focus:ring-school-red/30 rounded-md cursor-pointer`}
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
                              `block px-5 py-2.5 text-sm tracking-wide transition-all duration-200 border-l-2 ${
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

          {/* CTA Admission Button & Responsive Hamburger Toggle */}
          <div className="flex items-center gap-3 shrink-0 ml-auto xl:ml-0">
            <NavLink
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center bg-school-red hover:bg-school-deepRed text-white font-medium text-sm md:text-base tracking-wider py-2.5 px-6 rounded-full border border-school-red select-none shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
            >
              <motion.span
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-1.5"
              >
                <span>{contactInfo.ctaText}</span>
              </motion.span>
            </NavLink>

            {/* Hamburger Trigger for Mobile Drawer */}
            <button
              onClick={onMobileToggle}
              className="xl:hidden p-2 text-school-deepRed hover:bg-school-light rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-school-red/50 border border-school-light/80 shadow-sm"
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
    </div>
  );
};

export default Navbar;
