// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Public Components & Pages
import Header from './components/navigation/Header';
import Navbar from './components/navigation/Navbar';
import MobileMenu from './components/navigation/MobileMenu';
import Footer from './components/common/Footer';
import AdmissionBanner from './components/common/AdmissionBanner';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import TransferCertificate from './pages/TransferCertificate';
import MandatoryDisclosures from './pages/MandatoryDisclosures';

// Dynamic CMS Router Fallback
import DynamicPage from './cms/DynamicPage.jsx';

// Admin Console Components
import AdminLogin from './admin/AdminLogin.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import PageList from './admin/PageList.jsx';
import PageEditor from './admin/PageEditor.jsx';
import MediaLibrary from './admin/MediaLibrary.jsx';
import CertificateManager from './admin/CertificateManager.jsx';
import SiteSettings from './admin/SiteSettings.jsx';
import BackupRestore from './admin/BackupRestore.jsx';
import ContactSubmissions from './admin/ContactSubmissions.jsx';
import ResetPassword from './admin/ResetPassword.jsx';
import ChangePassword from './admin/ChangePassword.jsx';

import { cmsApi } from './cms/api.js';

// Scroll Helper: automatically scrolls the page to top on navigation triggers
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Generic Mock Page Layout to test routing (fallback for non-CMS pages)
const PageLayout = ({ title, subtitle }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center select-none">
      <div className="bg-school-light/60 border border-school-light rounded-3xl p-12 md:p-24 shadow-sm backdrop-blur-sm max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-school-deepRed mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-school-gray text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-1 bg-school-gold rounded-full"></div>
        </div>
      </div>
    </main>
  );
};

const AppContent = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const location = useLocation();

  // Branching: Isolate Admin interface layouts from school styling
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  useEffect(() => {
    if (!isAdminRoute) {
      cmsApi.getSettings()
        .then(setSettings)
        .catch(err => console.error('Failed to load global settings in App:', err));
    }
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pages" element={<PageList />} />
          <Route path="pages/:id" element={<PageEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="certificates" element={<CertificateManager />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="backups" element={<BackupRestore />} />
          <Route path="contact-submissions" element={<ContactSubmissions />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFDFE] text-school-dark font-poppins selection:bg-school-red/10 selection:text-school-deepRed flex flex-col">
      {/* Top info and primary navbar */}
      <header className="w-full">
        <Header settings={settings} />
        <Navbar 
          onMobileToggle={() => setIsMobileOpen(!isMobileOpen)} 
          isMobileOpen={isMobileOpen}
          settings={settings}
        />
      </header>

      {/* Mobile full-screen slide out drawer */}
      <MobileMenu 
        isOpen={isMobileOpen} 
        onClose={() => setIsMobileOpen(false)} 
        settings={settings}
      />

      {/* App routing and views */}
      <div className="flex-1 w-full relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/transfer-certificate" element={<TransferCertificate />} />
          <Route path="/mandatory-disclosures" element={<MandatoryDisclosures />} />
          
          {/* Custom routes mapped to public dynamic pages */}
          <Route path="/c/:slug" element={<DynamicPage />} />

          {/* Catch-all fallback tries to render page dynamically from DB, or defaults to layout */}
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </div>

      {/* Admission Announcement Banner */}
      <AdmissionBanner />

      {/* Global Footer */}
      <Footer settings={settings} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
