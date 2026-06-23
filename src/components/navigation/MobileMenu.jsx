import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX, FiPhoneCall, FiMail, FiShield, FiFileText } from 'react-icons/fi';
import { navigationLinks, contactInfo, getAdditionalPages } from './NavigationConfig';
import logoImg from '../../assets/logo.jpeg';
import { cmsApi } from '../../cms/api.js';

const MobileMenu = ({ isOpen, onClose, settings = {} }) => {
  const [openAccordions, setOpenAccordions] = useState({});
  const [additionalPages, setAdditionalPages] = useState([]);
  const [morePagesAccordionOpen, setMorePagesAccordionOpen] = useState(false);
  const location = useLocation();

  const email = settings.email || contactInfo.email;
  const phone = settings.phone || contactInfo.phone;

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

  // Dynamic Navigation Link Syncing
  useEffect(() => {
    if (!isOpen) return;
    const fetchPages = async () => {
      try {
        const pages = await cmsApi.listPages();
        setAdditionalPages(getAdditionalPages(pages));
      } catch (err) {
        console.error("Failed to load mobile navigation links dynamically:", err);
      }
    };
    fetchPages();
  }, [isOpen, location.pathname]);

  // Close menu and reset accordions on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Trap body scroll when menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeIn',
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 280,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-school-light flex items-center justify-between">
              {/* Responsive Logo */}
              <div className="flex items-center gap-2">
                <img 
                  src={logoImg} 
                  alt="The Greenwood Public School Logo" 
                  className="h-12 w-auto object-contain" 
                />
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-sm tracking-wide text-school-deepRed leading-tight">
                    {nameParts.top}
                  </span>
                  {nameParts.bottom && (
                    <span className="text-xxs uppercase tracking-widest text-school-gold font-semibold leading-none">
                      {nameParts.bottom}
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-school-deepRed hover:bg-school-light rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-school-red/50"
                aria-label="Close navigation menu"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Navigation Nodes List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <nav className="flex flex-col gap-1" aria-label="Mobile links list">
                {navigationLinks.map((link) => {
                  const hasDropdown = link.hasDropdown;
                  const isAccordionOpen = !!openAccordions[link.id];

                  return (
                    <motion.div key={link.id} variants={itemVariants} className="border-b border-school-light/40 py-1">
                      {hasDropdown ? (
                        <div>
                          <button
                            onClick={() => toggleAccordion(link.id)}
                            className="flex items-center justify-between w-full py-3.5 text-base font-medium text-school-gray hover:text-school-red transition-colors focus:outline-none select-none"
                            aria-expanded={isAccordionOpen}
                            aria-controls={`mobile-menu-${link.id}`}
                          >
                            <span>{link.label}</span>
                            <FiChevronDown
                              className={`w-5 h-5 text-school-gray/80 transition-transform duration-300 ${
                                isAccordionOpen ? 'rotate-180 text-school-red' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isAccordionOpen && (
                              <motion.div
                                id={`mobile-menu-${link.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden bg-school-light/40 rounded-lg"
                              >
                                <ul className="pl-4 pr-2 py-2 flex flex-col gap-1">
                                  {link.dropdownItems.map((subItem) => (
                                    <li key={subItem.id}>
                                      <NavLink
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                          `block py-3 px-4 text-sm rounded-md transition-colors ${
                                            isActive
                                              ? 'bg-school-red/10 text-school-deepRed font-medium border-l-2 border-school-red'
                                              : 'text-school-gray hover:text-school-dark hover:bg-school-light/60'
                                          }`
                                        }
                                      >
                                        {subItem.label}
                                      </NavLink>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <NavLink
                          to={link.path}
                          className={({ isActive }) =>
                            `block py-3.5 text-base font-medium transition-colors ${
                              isActive
                                ? 'text-school-red font-semibold'
                                : 'text-school-gray hover:text-school-red'
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      )}
                    </motion.div>
                  );
                })}

                {/* Additional Pages "More Pages" Mobile Accordion */}
                {additionalPages.length > 0 && (
                  <motion.div variants={itemVariants} className="border-b border-school-light/40 py-1">
                    <div>
                      <button
                        onClick={() => setMorePagesAccordionOpen(!morePagesAccordionOpen)}
                        className="flex items-center justify-between w-full py-3.5 text-base font-medium text-school-gray hover:text-school-red transition-colors focus:outline-none select-none"
                        aria-expanded={morePagesAccordionOpen}
                        aria-controls="mobile-menu-more-pages"
                      >
                        <span>More Pages</span>
                        <FiChevronDown
                          className={`w-5 h-5 text-school-gray/80 transition-transform duration-300 ${
                            morePagesAccordionOpen ? 'rotate-180 text-school-red' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {morePagesAccordionOpen && (
                          <motion.div
                            id="mobile-menu-more-pages"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden bg-school-light/40 rounded-lg"
                          >
                            <ul className="pl-4 pr-2 py-2 flex flex-col gap-1">
                              {additionalPages.map((page) => (
                                <li key={page.id}>
                                  <NavLink
                                    to={page.route}
                                    className={({ isActive }) =>
                                      `block py-3 px-4 text-sm rounded-md transition-colors ${
                                        isActive
                                          ? 'bg-school-red/10 text-school-deepRed font-medium border-l-2 border-school-red'
                                          : 'text-school-gray hover:text-school-dark hover:bg-school-light/60'
                                      }`
                                    }
                                  >
                                    {page.title}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </nav>
            </div>

            {/* Bottom Panel (Quick Actions, Admissions Button and Contact) */}
            <div className="p-6 bg-school-light/50 border-t border-school-light flex flex-col gap-4">
              {/* Quick Action Buttons */}
              <div className="flex gap-2">
                <NavLink
                  to="/mandatory-disclosures"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-school-light hover:border-school-gold text-school-dark font-medium text-xs tracking-wide py-2.5 px-3 rounded-full transition-all duration-300"
                >
                  <FiShield className="w-3.5 h-3.5 text-school-red" />
                  <span>Mandatory Disclosures</span>
                </NavLink>
                <NavLink
                  to="/transfer-certificate"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-school-gold hover:bg-yellow-500 text-school-dark font-medium text-xs tracking-wide py-2.5 px-3 rounded-full transition-all duration-300"
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Transfer Certificate</span>
                </NavLink>
              </div>

              <div
                className="w-full bg-school-red text-white text-center font-medium tracking-wide py-3.5 px-6 rounded-full border border-school-red shadow-md select-none"
              >
                {contactInfo.ctaText}
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-school-gray pl-1 font-light">
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 hover:text-school-red">
                  <FiPhoneCall className="w-3.5 h-3.5 text-school-red" />
                  <span>{phone}</span>
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-school-red">
                  <FiMail className="w-3.5 h-3.5 text-school-red" />
                  <span>{email}</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
