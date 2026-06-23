import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhoneCall, FiFileText, FiShield } from 'react-icons/fi';
import { contactInfo } from './NavigationConfig';

const Header = ({ settings = {} }) => {
  const email = settings.email || contactInfo.email;
  const phone = settings.phone || contactInfo.phone;

  return (
    <section 
      className="bg-school-deepRed text-white py-2 px-4 md:px-8 border-b border-white/10 text-xs tracking-wider transition-all duration-300 select-none z-50 relative"
      aria-label="Top Contact Information Bar"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Contact Links Info */}
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 font-light">
          <a 
            href={`mailto:${email}`} 
            className="flex items-center gap-2 hover:text-school-gold transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-school-gold rounded px-1.5 py-0.5"
            aria-label={`Send email to ${email}`}
          >
            <FiMail className="text-school-gold w-3.5 h-3.5" aria-hidden="true" />
            <span>{email}</span>
          </a>
          
          <a 
            href={`tel:${phone.replace(/\s+/g, '')}`} 
            className="flex items-center gap-2 hover:text-school-gold transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-school-gold rounded px-1.5 py-0.5"
            aria-label={`Call school at ${phone}`}
          >
            <FiPhoneCall className="text-school-gold w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            <span>{phone}</span>
          </a>
        </div>

        {/* Quick Action Buttons — hidden on mobile, shown in mobile menu instead */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/mandatory-disclosures"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-school-gold hover:text-school-dark text-white/90 font-medium text-[11px] tracking-wide px-3.5 py-1.5 rounded-full border border-white/15 hover:border-school-gold transition-all duration-300"
          >
            <FiShield className="w-3 h-3" />
            <span>Mandatory Disclosures</span>
          </Link>
          <Link
            to="/transfer-certificate"
            className="flex items-center gap-1.5 bg-school-gold hover:bg-yellow-500 text-school-dark font-medium text-[11px] tracking-wide px-3.5 py-1.5 rounded-full border border-school-gold transition-all duration-300"
          >
            <FiFileText className="w-3 h-3" />
            <span>Transfer Certificate</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Header;

