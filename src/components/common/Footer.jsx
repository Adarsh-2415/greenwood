import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiMail, FiPhoneCall, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiTwitter } from 'react-icons/fi';
import { contactInfo } from '../navigation/NavigationConfig';
import logoImg from '../../assets/logo.jpeg';

const Footer = ({ settings = {} }) => {
  const email = settings.email || contactInfo.email;
  const phone = settings.phone || contactInfo.phone;
  const address = settings.address || contactInfo.address;

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

  return (
    <footer className="bg-school-dark text-white pt-16 pb-8 border-t-2 border-school-red">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Column 1: Brand details */}
        <div className="lg:col-span-4 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="The Greenwood Public School Logo"
              className="h-14 md:h-16 w-auto object-contain rounded-lg"
            />
            <div className="flex flex-col">
              <h2 className="font-serif font-bold text-lg tracking-wide text-white leading-tight">
                {nameParts.top}
              </h2>
              {nameParts.bottom && (
                <span className="text-[10px] uppercase tracking-widest text-school-gold font-semibold leading-none">
                  {nameParts.bottom}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-white/60 font-light leading-relaxed mt-2">
            A premium educational ecosystem dedicated to high academic standards, progressive learning technologies, character strength, and co-curricular development.
          </p>

          <span className="text-xxs text-school-gold/80 border border-school-gold/30 rounded px-2.5 py-1 bg-school-gold/5 mt-2">
            CBSE Affiliation No: 3530551 | School No: 81971
          </span>

          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4">
            {[
              { icon: <FiFacebook />, label: "Facebook", href: settings.social_facebook },
              { icon: <FiTwitter />, label: "Twitter", href: settings.social_twitter },
              { icon: <FiInstagram />, label: "Instagram", href: settings.social_instagram },
              { icon: <FiYoutube />, label: "Youtube", href: settings.social_youtube }
            ].map((soc, i) => (
              <a
                key={i}
                href={soc.href || "#"}
                target={soc.href ? "_blank" : undefined}
                rel={soc.href ? "noopener noreferrer" : undefined}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-school-red hover:text-white border border-white/10 hover:border-school-red flex items-center justify-center text-sm text-white/80 transition-all duration-300"
                aria-label={soc.label}
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="lg:col-span-2">
          <h3 className="font-serif text-sm font-bold tracking-wider text-school-gold uppercase mb-5">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2.5 text-xs text-white/60 font-light">
            <li><NavLink to="/" className="hover:text-school-red transition-colors">Home</NavLink></li>
            <li><NavLink to="/about" className="hover:text-school-red transition-colors">About Us</NavLink></li>
            <li><NavLink to="/gallery" className="hover:text-school-red transition-colors">Gallery</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-school-red transition-colors">Contact Us</NavLink></li>
          </ul>
        </div>


        {/* Column 3: Contact & Newsletter */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div>
            <h3 className="font-serif text-sm font-bold tracking-wider text-school-gold uppercase mb-5">
              Contact Details
            </h3>
            <ul className="flex flex-col gap-3 text-xs text-white/60 font-light">
              <li className="flex items-start gap-2">
                <FiMapPin className="text-school-red w-4 h-4 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <FiPhoneCall className="text-school-red w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <a href={`tel:${phone}`} className="hover:text-school-red transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-school-red">
                  <FiMail className="text-school-red w-4 h-4 shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 4: Location Map */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h3 className="font-serif text-sm font-bold tracking-wider text-school-gold uppercase mb-5">
            Campus Location
          </h3>
          <div className="w-full h-56 rounded-2xl overflow-hidden shadow-md border border-white/10 relative">
            <iframe
              title="The Greenwood Public School Campus Map"
              src={
                settings.google_maps_link && (settings.google_maps_link.includes('google.com/maps/embed') || settings.google_maps_link.includes('pb='))
                  ? settings.google_maps_link
                  : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1729.541969432853!2d77.7407193!3d29.8906819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390eb9d933232b0d%3A0x4e486b7db5e5e818!2sThe%20Greenwood%20Public%20School%20Roorkee!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              }
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <a
            href={settings.google_maps_link || "https://maps.app.goo.gl/RuE58v2uKtsqQ71U9"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-school-gold/80 hover:text-white transition-colors flex items-center gap-1 font-medium mt-1"
          >
            <span>Open in Google Maps</span>
            <span>→</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/10 mt-12 pt-6 text-center text-white/40 text-xxs font-light">
        <span>© {new Date().getFullYear()} All Copyright Reserved by {settings.school_name || "GreenWood Public School"}, Roorkee | Powered by <span className="text-school-gold font-semibold">FSIR Roorkee</span></span>
      </div>
    </footer>
  );
};

export default Footer;
