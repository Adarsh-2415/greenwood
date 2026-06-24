import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/seo/SEO';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import { FiEye, FiTarget, FiAward, FiCheck } from 'react-icons/fi';
import schoolImage from '../assets/school_image.jpg';
import { useSettings } from '../contexts/SettingsContext.jsx';

const About = () => {
  const { settings } = useSettings();

  return (
    <div className="w-full flex-1">
      <SEO 
        title="About Us"
        description="Learn about The Greenwood Public School, our mission, vision, and core values dedicated to academic excellence."
      />
      <Breadcrumbs paths={[{ label: 'Home', url: '/' }, { label: 'About Us', url: '/about' }]} />
      {/* HERO SECTION WITH STATIC BG IMAGE & ENTRANCE ANIMATION */}
      <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[350px] overflow-hidden bg-black select-none">
        
        {/* Animated Static Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={schoolImage}
              alt="Greenwood School Campus"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Gradient Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75 z-10" />

        {/* Centered Hero Content with Slide-Up Animation */}
        <div className="absolute inset-0 flex items-center justify-center z-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-4 drop-shadow-md"
            >
              About <span className="text-green-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">Greenwood</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-16 h-1 bg-school-gold rounded-full mx-auto mb-6"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
              className="text-white/80 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
            >
              A leading institution dedicated to preparing dynamic global citizens through transformative education.
            </motion.p>
          </div>
        </div>
      </section>

      {/* WELCOME SECTION */}
      <section className="bg-white py-16 md:py-24 border-b border-school-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Title & Highlight Badge */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col items-start"
            >
              <span className="text-school-red font-semibold text-xs uppercase tracking-widest mb-3">Our Core Philosophy</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-dark mb-6 leading-tight tracking-tight">
                Welcome to <br /> The Greenwood School
              </h2>
              <div className="w-16 h-1 bg-school-gold rounded-full mb-6" />
              
              {/* Motto Card */}
              <div className="bg-school-light border border-school-light/80 p-6 rounded-2xl shadow-sm border-l-4 border-l-school-red max-w-sm">
                <span className="text-xxs uppercase tracking-wider text-school-gold font-bold block mb-1">Our Proud Motto</span>
                <p className="font-serif text-lg font-bold text-school-deepRed italic">
                  “Path Maker for Path Seekers”
                </p>
              </div>
            </motion.div>

            {/* Right Column: Shortened Welcome Message */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <p className="text-school-gray text-base md:text-lg font-light leading-relaxed mb-6">
                At Greenwood Public School, we provide a holistic and modern co-educational learning experience. Equipped with smart classrooms, advanced computer centers, a rich library, and vast playfields, we nurture creative, physical, and personal growth.
              </p>
              <p className="text-school-gray text-base md:text-lg font-light leading-relaxed">
                Driven by our motto, <strong>“Path Maker for Path Seekers”</strong>, our multidisciplinary teaching methodology empowers every student to discover their true potential and prepare themselves to excel in school, university, and the dynamic global workspace.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* MESSAGE FROM PRINCIPAL */}
      <section className="bg-school-light/30 py-16 md:py-24 border-b border-school-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Principal Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-[360px] aspect-[4/5] bg-school-light border border-school-light/65 rounded-3xl overflow-hidden shadow-md">
              <img 
                src={settings.principal_photo || "/logo.jpeg"} 
                alt="Principal" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-deepRed/85 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
                <span className="font-serif font-bold text-lg leading-tight">{settings.principal_name || "The Principal"}</span>
                <span className="text-xs text-school-gold/90 font-medium tracking-wider uppercase mt-1">Principal & Founder</span>
              </div>
            </div>
            {/* Design backing grid */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-school-gold/10 -z-10 rounded-3xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-school-red/5 -z-10 rounded-3xl" />
          </motion.div>

          {/* Principal Message Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            <span className="text-school-red font-semibold text-xs uppercase tracking-widest mb-3">Message From Principal</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-dark mb-6 leading-tight tracking-tight">
              Leading the Way in Academic Brilliance
            </h2>
            <div className="w-16 h-1 bg-school-gold rounded-full mb-6" />
            <p className="text-school-gray text-base font-light leading-relaxed mb-6">
              "{settings.principal_message || "At Greenwood, we believe education is not merely the acquisition of facts, but the training of the mind to think critically, innovate fearlessly, and lead with empathy."}"
            </p>
            <p className="text-school-gray text-base font-light leading-relaxed">
              We welcome you to experience our progressive curriculum, high-tech environments, and warm community where child protection and student development are our highest priorities.
            </p>
          </motion.div>

        </div>
      </section>

      {/* MESSAGE FROM TRUSTEE */}
      <section className="bg-white py-16 md:py-24 border-b border-school-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Trustee Message Text (On Left for Alternating Layout) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start order-2 lg:order-1 text-left"
          >
            <span className="text-school-red font-semibold text-xs uppercase tracking-widest mb-3">Message From Trustee</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-dark mb-6 leading-tight tracking-tight">
              Nurturing Values & Holistic Development
            </h2>
            <div className="w-16 h-1 bg-school-gold rounded-full mb-6" />
            <p className="text-school-gray text-base font-light leading-relaxed mb-6">
              "{settings.trustee_message || "Value-based modern education has always been a dream. Education has to keep pace with the changing times, but should have the strong foundation based on our old value system."}"
            </p>
            <p className="text-school-gray text-base font-light leading-relaxed">
              "Sheer academic proficiency cannot determine growth, because growth cannot signify physical growth only. The object of education is to prepare the young to educate themselves throughout their lives. The Greenwood is a school that has been started with the belief and hope that everyone's dream of making a holistic individual is made a reality, supported by a perfect learning environment."
            </p>
          </motion.div>

          {/* Trustee Image (On Right for Alternating Layout) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative flex justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-[360px] aspect-[4/5] bg-school-light border border-school-light/65 rounded-3xl overflow-hidden shadow-md">
              <img 
                src={settings.trustee_photo || "/logo.jpeg"} 
                alt="Trustee" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-school-deepRed/85 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
                <span className="font-serif font-bold text-lg leading-tight">{settings.trustee_name || "The Trustee"}</span>
                <span className="text-xs text-school-gold/90 font-medium tracking-wider uppercase mt-1">Trustee & Chairperson</span>
              </div>
            </div>
            {/* Design backing grid */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-school-gold/10 -z-10 rounded-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-school-red/5 -z-10 rounded-3xl" />
          </motion.div>

        </div>
      </section>

      {/* VISION, MISSION, OBJECTIVES SECTION */}
      <section className="bg-school-light/60 py-16 md:py-24 border-b border-school-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Section Heading */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-school-red font-semibold text-xs uppercase tracking-widest mb-3 block"
            >
              Our Foundation
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-serif text-3xl md:text-4xl font-bold text-school-dark leading-tight tracking-tight"
            >
              Vision, Mission & Key Objectives
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-16 h-1 bg-school-gold rounded-full mx-auto mt-4"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border-t-4 border-t-school-gold border border-school-light/80 p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5 h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-school-gold/10 flex items-center justify-center text-school-gold shrink-0">
                <FiEye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-school-dark mb-3">Our Vision</h3>
                <p className="text-school-gray text-sm font-light leading-relaxed">
                  To be a premier center of educational excellence that nurtures creative thinkers, ethical leaders, and global citizens. We envision a learning ecosystem where academic rigor merges with character building, empowering students to confidently navigate a dynamic world and make meaningful contributions to society.
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-white border-t-4 border-t-school-red border border-school-light/80 p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5 h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-school-red/10 flex items-center justify-center text-school-red shrink-0">
                <FiTarget className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-school-dark mb-3">Our Mission</h3>
                <p className="text-school-gray text-sm font-light leading-relaxed">
                  To provide a stimulating, inclusive, and technology-driven environment where students explore their unique potential. Grounded in our motto, “Path Maker for Path Seekers”, we deliver a multidisciplinary curriculum that fosters critical thinking, social responsibility, physical wellness, and a lifelong passion for learning.
                </p>
              </div>
            </motion.div>

            {/* Objectives Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border-t-4 border-t-school-deepRed border border-school-light/80 p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5 h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-school-deepRed/10 flex items-center justify-center text-school-deepRed shrink-0">
                <FiAward className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-school-dark mb-4">Key Objectives</h3>
                <ul className="flex flex-col gap-4 text-school-gray text-xs md:text-sm font-light leading-relaxed">
                  {[
                    "To provide opportunities through stimulating, safe and supportive environment for attaining personal mastery and team spirit leading to all-round development of pupils.",
                    "To engage students in active, collaborative and technology based learning methodologies.",
                    "To enrich the lives of its pupils through encouraging their participation in the School’s varied cultural and sporting programme.",
                    "To develop the qualities of leadership with a sense of duty and discipline.",
                    "To make the parents equal partner in the process of education."
                  ].map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <FiCheck className="text-school-red w-4 h-4 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
