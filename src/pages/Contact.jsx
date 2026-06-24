import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhoneCall, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { contactInfo } from '../components/navigation/NavigationConfig';
import { useSettings } from '../contexts/SettingsContext.jsx';
import emailjs from '@emailjs/browser';
import SEO from '../components/seo/SEO';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import { cmsApi } from '../cms/api.js';

const Contact = () => {
  const { settings } = useSettings();

  const email = settings.email || contactInfo.email;
  const phone = settings.phone || contactInfo.phone;
  const address = settings.address || contactInfo.address;
  const mapsLink = settings.google_maps_link || "https://maps.app.goo.gl/RuE58v2uKtsqQ71U9";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: '' }));
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (captchaCode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background styling matching theme
      ctx.fillStyle = '#F8F9FA'; // school-light
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines (noise)
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(166, 27, 36, ${0.1 + Math.random() * 0.15})`; // deepRed accent
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      // Draw background dots (noise)
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = `rgba(212, 175, 55, ${0.15 + Math.random() * 0.25})`; // gold accent
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw captcha code
      ctx.font = 'bold 22px "Poppins", sans-serif';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < captchaCode.length; i++) {
        const char = captchaCode[i];
        const x = 15 + i * 22 + Math.random() * 3;
        const y = canvas.height / 2 + (Math.random() * 6 - 3);
        const angle = (Math.random() * 24 - 12) * Math.PI / 180;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Alternate colors
        ctx.fillStyle = i % 2 === 0 ? '#A61B24' : '#111111';
        ctx.fillText(char, -8, 0);
        ctx.restore();
      }
    }
  }, [captchaCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear field error on key press
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 10-digit Phone Validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits';
      }
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    // Captcha Validation
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Verification code is required';
    } else if (captchaInput.trim().toUpperCase() !== captchaCode) {
      newErrors.captcha = 'Incorrect verification code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Regenerate captcha if validation fails and captcha was incorrect or empty
      if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== captchaCode) {
        generateCaptcha();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit to Supabase Database
      await cmsApi.submitContact(formData);
      
      // 2. Send Email alert via EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_default';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

      if (templateId && publicKey) {
        const emailParams = {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          to_email: email // Sends to dynamic admin email from database settings
        };
        await emailjs.send(serviceId, templateId, emailParams, publicKey);
      }

      setIsSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to submit contact query. Please try again.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setCaptchaInput('');
    setErrors({});
    setIsSuccess(false);
    // Fresh captcha code
    setTimeout(() => {
      generateCaptcha();
    }, 50);
  };

  return (
    <div className="w-full flex-1">
      <SEO 
        title="Contact Us"
        description="Get in touch with The Greenwood Public School administration. Find our location, phone numbers, and admission inquiries."
      />
      <Breadcrumbs paths={[{ label: 'Home', url: '/' }, { label: 'Contact Us', url: '/contact' }]} />
      {/* HERO SECTION WITH SOLID BG & ENTRANCE ANIMATION */}
      <section className="relative w-full h-[35vh] min-h-[280px] overflow-hidden bg-school-deepRed flex items-center justify-center border-b-4 border-school-gold">

        {/* Glow Radial Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(223,37,49,0.2),transparent_50%)]" />

        {/* Centered Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4 md:px-8 select-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-md"
          >
            Contact <span className="text-school-gold">Greenwood</span>
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
            Get in touch with our admissions coordinators and administrative offices. We are here to answer your queries.
          </motion.p>
        </div>
      </section>

      {/* DUAL COLUMN CONTENT SECTION */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column: Official Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col gap-6"
            >
              <div>
                <span className="text-school-red font-semibold text-xs uppercase tracking-widest mb-2 block">Reach Out</span>
                <h2 className="font-serif text-3xl font-bold text-school-dark mb-4 leading-tight tracking-tight">
                  Contact Information
                </h2>
                <div className="w-12 h-1 bg-school-gold rounded-full mb-6" />
                <p className="text-school-gray text-sm font-light leading-relaxed mb-6">
                  For enrollment inquiries, faculty job applications, and general school feedback, please connect with our administrative desk using the contact channels below.
                </p>
              </div>

              {/* Cards Wrapper */}
              <div className="flex flex-col gap-4">
                {/* Address Card */}
                <div className="bg-school-light border border-school-light/80 p-5 rounded-2xl flex items-start gap-4 hover:shadow-xs hover:border-school-gold/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-school-red/10 flex items-center justify-center text-school-red shrink-0">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-school-dark mb-1">Campus Location</h3>
                    <p className="text-school-gray text-xs font-light leading-relaxed mb-2">
                      {address}
                    </p>
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xxs text-school-gold hover:text-school-deepRed font-semibold transition-colors inline-block"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-school-light border border-school-light/80 p-5 rounded-2xl flex items-start gap-4 hover:shadow-xs hover:border-school-gold/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-school-gold/10 flex items-center justify-center text-school-gold shrink-0">
                    <FiPhoneCall className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-school-dark mb-1">Call Desk</h3>
                    <div className="flex flex-col gap-1 text-school-gray text-xs font-light">
                      <a href={`tel:${phone}`} className="hover:text-school-red transition-colors inline-block">
                        Primary: {phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-school-light border border-school-light/80 p-5 rounded-2xl flex items-start gap-4 hover:shadow-xs hover:border-school-gold/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-school-red/10 flex items-center justify-center text-school-red shrink-0">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-school-dark mb-1">E-Mail</h3>
                    <a href={`mailto:${email}`} className="text-school-gray text-xs font-light hover:text-school-red transition-colors break-all">
                      {email}
                    </a>
                  </div>
                </div>


              </div>
            </motion.div>

            {/* Right Column: Contact Us Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 bg-white border border-school-light/90 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div>
                      <h3 className="font-serif text-xl font-bold text-school-dark mb-2">Send a Message</h3>
                      <p className="text-xxs text-school-gray/80 uppercase tracking-widest font-medium">Fields marked with * are required</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-semibold text-school-dark">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs ${errors.name ? 'border-school-red' : 'border-school-light/80'
                            }`}
                        />
                        {errors.name && (
                          <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.name}
                          </span>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-school-dark">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="parent@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs ${errors.email ? 'border-school-red' : 'border-school-light/80'
                            }`}
                        />
                        {errors.email && (
                          <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Phone Field */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="phone" className="text-xs font-semibold text-school-dark">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="e.g. +91 98765 43210"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs ${errors.phone ? 'border-school-red' : 'border-school-light/80'
                            }`}
                        />
                        {errors.phone && (
                          <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.phone}
                          </span>
                        )}
                      </div>

                      {/* Subject Field */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="subject" className="text-xs font-semibold text-school-dark">Subject *</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          placeholder="Inquiry Topic"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs ${errors.subject ? 'border-school-red' : 'border-school-light/80'
                            }`}
                        />
                        {errors.subject && (
                          <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="message" className="text-xs font-semibold text-school-dark">Your Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        placeholder="Write details of your query..."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs resize-none ${errors.message ? 'border-school-red' : 'border-school-light/80'
                          }`}
                      />
                      {errors.message && (
                        <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                          <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Captcha Field */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label htmlFor="captchaInput" className="text-xs font-semibold text-school-dark">Verification Code *</label>
                      <div className="flex items-center gap-3">
                        <div className="relative border border-school-light/100 rounded-2xl overflow-hidden h-12 w-40 shrink-0 shadow-inner bg-school-light">
                          <canvas 
                            ref={canvasRef} 
                            width="160" 
                            height="48" 
                            className="w-full h-full block"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          disabled={isSubmitting}
                          className="w-12 h-12 rounded-2xl bg-school-light hover:bg-school-gold/10 border border-school-light/85 hover:border-school-gold/30 flex items-center justify-center text-school-gray hover:text-school-gold transition-all duration-300 active:scale-95 disabled:opacity-50 shrink-0"
                          title="Generate new verification code"
                        >
                          <FiRefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                        </button>
                        <input
                          type="text"
                          id="captchaInput"
                          name="captchaInput"
                          placeholder="Type code"
                          value={captchaInput}
                          onChange={(e) => {
                            setCaptchaInput(e.target.value);
                            if (errors.captcha) {
                              setErrors((prev) => ({ ...prev, captcha: '' }));
                            }
                          }}
                          disabled={isSubmitting}
                          maxLength="6"
                          className={`flex-1 px-4 py-3 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-xs h-12 ${
                            errors.captcha ? 'border-school-red' : 'border-school-light/85'
                          }`}
                        />
                      </div>
                      {errors.captcha && (
                        <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                          <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.captcha}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full mt-2 bg-school-deepRed text-white font-semibold py-3 px-6 rounded-2xl hover:bg-school-red transition-all duration-300 shadow-md shadow-school-red/10 flex items-center justify-center gap-2 text-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                      <FiCheckCircle className="w-10 h-10" />
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-school-dark mb-2">Message Sent Successfully!</h3>
                    <p className="text-school-gray text-xs font-light leading-relaxed max-w-sm mb-6">
                      Thank you for contacting Greenwood Public School, <strong>{formData.name}</strong>. Our admissions officer or administrative supervisor will get back to you shortly at <strong>{formData.email}</strong>.
                    </p>

                    {/* Summary of Message */}
                    <div className="w-full bg-school-light border border-school-light/80 p-5 rounded-2xl text-left text-xs mb-8 flex flex-col gap-2">
                      <span className="font-semibold text-xxs uppercase tracking-wider text-school-gold block border-b border-school-light/100 pb-1.5 mb-1.5">Submitted Details Preview</span>
                      <p className="text-school-dark"><strong>Subject:</strong> {formData.subject}</p>
                      <p className="text-school-dark"><strong>Phone:</strong> {formData.phone}</p>
                      <p className="text-school-gray leading-relaxed italic mt-2 border-t border-school-light/100 pt-2 font-light">"{formData.message}"</p>
                    </div>

                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-school-dark text-white rounded-2xl text-xs hover:bg-school-gray transition-colors"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
