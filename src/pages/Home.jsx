import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiBookOpen, FiCompass, FiAward } from 'react-icons/fi';
import schoolImage from '../assets/school_image.jpg';
import s1 from '../assets/S1.jpg';
import s2 from '../assets/S2.jpg';
import s3 from '../assets/S3.jpg';
import s4 from '../assets/S4.jpg';

// Slider images with imported local school images
const SLIDER_IMAGES = [
  {
    url: schoolImage,
    title: 'Nurturing Global Citizens',
    description: 'Empowering young minds with innovative educational models and dynamic pedagogy.'
  },
  {
    url: s1,
    title: 'Modern Learning Spaces',
    description: 'Equipping our learners with standard resources, digital classrooms, and progressive guidance.'
  },
  {
    url: s2,
    title: 'Academic Excellence',
    description: 'Fostering critical thinking, scientific inquiry, and a passion for lifelong learning.'
  },
  {
    url: s3,
    title: 'Vibrant Campus Life',
    description: 'Fostering growth outside classrooms through multi-discipline sports, arts, and drama.'
  },
  {
    url: s4,
    title: 'Inclusive Community',
    description: 'Promoting mutual respect, cultural diversity, and holistic personality development.'
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
  };

  return (
    <div className="w-full flex-1">
      {/* HERO SECTION WITH BG SLIDER */}
      <section className="relative w-full h-[75vh] md:h-[80vh] min-h-[500px] overflow-hidden bg-black select-none">

        {/* Background Images with Crossfade Transition */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={SLIDER_IMAGES[currentSlide].url}
                alt={SLIDER_IMAGES[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gradient Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />

        {/* Hero Content Block */}
        <div className="absolute inset-0 flex items-center justify-center z-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-school-gold/20 text-school-gold border border-school-gold/30 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            >
              Admissions Open for 2026-27
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight drop-shadow-md"
            >
              Welcome to <br /> <span className="text-green-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] md:whitespace-nowrap">The Greenwood Public School</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/80 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-sm"
            >
              Nurturing excellence and integrity. Experience a premier educational ecosystem tailored to prepare creative thinkers and global leaders.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-school-red hover:bg-school-deepRed text-white font-medium text-sm tracking-wider py-3.5 px-8 rounded-full border border-school-red hover:border-school-gold shadow-lg hover:shadow-school-gold/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Apply For Admissions</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-medium text-sm tracking-wider py-3.5 px-8 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300"
              >
                Explore Campus
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Side Chevron Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-35 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer hidden md:block"
          aria-label="Previous Slide"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-35 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer hidden md:block"
          aria-label="Next Slide"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 flex items-center gap-3">
          {SLIDER_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === index ? 'bg-school-gold w-8' : 'bg-white/40 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* WELCOME SECTION */}
      <section className="bg-white py-16 md:py-24 border-b border-school-light">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-4 md:px-8 text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-deepRed mb-3 leading-tight tracking-tight">
            Welcome To <br />
            <span className="text-green-600">The Greenwood Public School</span>, Roorkee
          </h2>
          <span className="text-school-gray text-xs md:text-sm font-semibold tracking-wide block mb-6">
            [Affiliated to CBSE Board, Affiliation No: 3530551,School No:81971]
          </span>
          <div className="w-16 h-1 bg-school-gold rounded-full mx-auto mb-8" />
          <p className="text-school-gray text-sm md:text-base font-light leading-relaxed text-center">
            The Greenwood is a co-educational English medium school. Besides spacious classrooms and playgrounds, we have a computer Resource Centre, well stocked library, open-air stage and a Teachers’ Learning Center. Our teaching Methodology involves a conscious effort to apply knowledge, principles and values to more than one academic discipline simultaneously. We strive to bring out the best of each student. We focus on Creative Development, Physical Development, Personal and Social Development of our students. “Path Maker for Path Seekers” is the motto we work upon. It is a concept which greatly influences the thought process and value system of all our faculty members and staff. We strive to provide holistic modern education to the students.
          </p>
        </motion.div>
      </section>

      {/* PRINCIPAL WELCOME DESK PREVIEW */}
      <section className="bg-white py-16 md:py-24 border-b border-school-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Accent Graphic Block */}
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
              <div className="absolute inset-0 bg-gradient-to-t from-school-deepRed/85 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="font-serif font-bold text-lg leading-tight">{settings.principal_name || "The Principal"}</span>
                <span className="text-xs text-school-gold/90 font-medium tracking-wider uppercase mt-1">Principal & Founder</span>
              </div>
            </div>
            {/* Design backing grid */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-school-gold/10 -z-10 rounded-3xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-school-red/5 -z-10 rounded-3xl" />
          </motion.div>

          {/* Welcome Text block */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start"
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

      {/* CORE OFFERINGS GRID */}
      <section className="bg-school-light/60 border-t border-b border-school-light py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-school-red font-semibold text-xs uppercase tracking-widest mb-3 block">Why Choose Us</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-school-dark mb-12 leading-tight tracking-tight">
              Academic Excellence and Global Ethics
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "Preparing for Life",
                desc: "A Green Wood School prepares students for life, helping them develop an informed curiosity and a lasting passion for learning.",
                icon: <FiBookOpen className="w-8 h-8 text-school-red" />
              },
              {
                title: "Shaping the Curriculum",
                desc: "Green Wood Schools can shape a curriculum around how they want their students to learn, helping them discover new abilities and a wider world.",
                icon: <FiCompass className="w-8 h-8 text-school-red" />
              },
              {
                title: "Skills for Success",
                desc: "GPS students develop the skills they need to achieve at school, university and work.",
                icon: <FiAward className="w-8 h-8 text-school-red" />
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="bg-white border border-school-light/60 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-5">{item.icon}</div>
                <h3 className="font-serif text-lg font-bold text-school-dark mb-2">{item.title}</h3>
                <p className="text-school-gray text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
