import React from 'react';
import { NavLink } from 'react-router-dom';

const AdmissionBanner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-school-deepRed via-school-red to-school-deepRed border-t-2 border-school-gold/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">

        {/* Left: Announcement Text */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          {/* Pulsing dot indicator */}
          <span className="relative flex h-2.5 w-2.5 shrink-0 hidden sm:flex">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-school-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-school-gold"></span>
          </span>
          <p className="text-white text-xs md:text-sm font-medium tracking-wide">
            Admissions Open From <span className="text-school-gold font-semibold">Nursery</span> To <span className="text-school-gold font-semibold">Class XII</span>. For More Details.
          </p>
        </div>

        {/* Right: CTA Button */}
        <NavLink
          to="/contact"
          className="shrink-0 inline-flex items-center gap-2 bg-school-gold hover:bg-yellow-500 text-school-dark font-bold text-xs md:text-[13px] uppercase tracking-wider px-5 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-school-gold/25 active:scale-95"
        >
          <span>Get in Touch</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NavLink>

      </div>
    </div>
  );
};

export default AdmissionBanner;
