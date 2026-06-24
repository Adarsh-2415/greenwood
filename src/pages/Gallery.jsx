import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiGrid, FiCamera } from 'react-icons/fi';
import usePageContent from '../cms/hooks/usePageContent.js';
import SEO from '../components/seo/SEO';
import Breadcrumbs from '../components/seo/Breadcrumbs';

// Categories definitions
const categories = [
  { id: 'all', label: 'All Photos' },
  { id: 'campus', label: 'Campus & Infrastructure' },
  { id: 'academics', label: 'Academic Labs & Learning' },
  { id: 'sports', label: 'Sports & Athletics' },
  { id: 'events', label: 'Celebrations & Events' }
];

// Array of 45 images mapping the 40 new uploads + 5 slider images
export const galleryItems = [
  // Slider / Main images
  {
    id: 1,
    src: '/gallery/school_image.jpg',
    category: 'campus',
    title: 'School Campus Front View',
    description: 'Our spacious CBSE affiliated main campus building showing architectural grandeur.'
  },
  {
    id: 2,
    src: '/gallery/S1.jpg',
    category: 'campus',
    title: 'School Building View',
    description: 'Vibrant academic blocks designed for learning comfort and student safety.'
  },
  {
    id: 3,
    src: '/gallery/S2.jpg',
    category: 'academics',
    title: 'Interactive Learning Sessions',
    description: 'Students engaged in high-tech, collaborative classroom learning methodologies.'
  },
  {
    id: 4,
    src: '/gallery/S3.jpg',
    category: 'sports',
    title: 'Outdoor Play Fields',
    description: 'Extensive sports facilities supporting physical mastery and athletic teamwork.'
  },
  {
    id: 5,
    src: '/gallery/S4.jpg',
    category: 'events',
    title: 'Annual Day Celebrations',
    description: 'Students presenting diverse cultural themes on the school stage.'
  },
  // User uploaded gallery items
  {
    id: 6,
    src: '/gallery/475852311_1078258867659773_1745477012267400081_n.jpg',
    category: 'events',
    title: 'Cultural Dance Performance',
    description: 'A colorful representation of traditional dance forms during the annual functions.'
  },
  {
    id: 7,
    src: '/gallery/476138870_1078258874326439_5129546497190358996_n.jpg',
    category: 'events',
    title: 'Theme-Based Stage Performance',
    description: 'Student choir presenting theatrical compositions for guests and parents.'
  },
  {
    id: 8,
    src: '/gallery/476158807_1078258894326437_7145252019572213562_n.jpg',
    category: 'events',
    title: 'Felicitation Ceremony',
    description: 'Honoring academic toppers and gold medalists with prestigious school awards.'
  },
  {
    id: 9,
    src: '/gallery/476235910_1078258944326432_8241233402632905083_n.jpg',
    category: 'events',
    title: 'Inter-House Drama Competition',
    description: 'Creative and drama presentations demonstrating theatrical talents of students.'
  },
  {
    id: 10,
    src: '/gallery/480946908_9424619570931799_6224709536946211302_n.jpg',
    category: 'academics',
    title: 'Practical Laboratory Experiments',
    description: 'Science students observing chemical transformations under faculty supervision.'
  },
  {
    id: 11,
    src: '/gallery/484293291_9543954775664944_7864623137556454078_n.jpg',
    category: 'academics',
    title: 'Computer Resource Center',
    description: 'Students executing python coding assignments in the technology lab.'
  },
  {
    id: 12,
    src: '/gallery/484834180_9543954788998276_1596571234836515262_n.jpg',
    category: 'academics',
    title: 'Library Study Session',
    description: 'Developing reference skills and reading routines in the silent reading zone.'
  },
  {
    id: 13,
    src: '/gallery/484869461_9543954642331624_7824644525015015823_n.jpg',
    category: 'academics',
    title: 'Scientific Research Project',
    description: 'Senior school batch presenting physics scale models in the exhibition.'
  },
  {
    id: 14,
    src: '/gallery/485015441_1112500694235590_465583318981687471_n.jpg',
    category: 'sports',
    title: 'Inter-School Cricket Match',
    description: 'Greenwood cricket squad demonstrating stellar performance in the finals.'
  },
  {
    id: 15,
    src: '/gallery/485031812_1112500564235603_7469861559809913422_n.jpg',
    category: 'sports',
    title: 'Athletic Track Events',
    description: 'Junior students competing in sprinting heats on the synthetic track.'
  },
  {
    id: 16,
    src: '/gallery/485060902_1112500574235602_6330663818326931872_n.jpg',
    category: 'sports',
    title: 'Football Championship Trophy',
    description: 'Celebrating the regional trophy win with coaches and physical trainers.'
  },
  {
    id: 17,
    src: '/gallery/485138439_1112500837568909_1171834009923344545_n.jpg',
    category: 'sports',
    title: 'Basketball Team Drill',
    description: 'Practicing defense tactics and rebounds in the indoor court arena.'
  },
  {
    id: 18,
    src: '/gallery/485145618_9581308151929606_7641301265463067437_n.jpg',
    category: 'campus',
    title: 'State-of-the-Art Classroom',
    description: 'Smartboards and ergonomic seating tables enhancing learning focus.'
  },
  {
    id: 19,
    src: '/gallery/485190954_1112500570902269_8288131153090815699_n.jpg',
    category: 'campus',
    title: 'Recreational Green Parks',
    description: 'Lush gardens designed for eco-sensitization and student break times.'
  },
  {
    id: 20,
    src: '/gallery/485731599_9581308111929610_8631168577359249964_n.jpg',
    category: 'campus',
    title: 'School Entry Archway',
    description: 'Our aesthetic, security-monitored entrance gate welcoming students.'
  },
  {
    id: 21,
    src: '/gallery/485758830_1112500680902258_7731972126313446841_n.jpg',
    category: 'campus',
    title: 'Teachers Learning Center',
    description: 'The dedicated faculty arena for training seminars and lesson planning.'
  },
  {
    id: 22,
    src: '/gallery/485980888_9590200271040394_5936883891415037732_n.jpg',
    category: 'events',
    title: 'Science Fair Presentation',
    description: 'Parents and teachers reviewing innovative engineering mock projects.'
  },
  {
    id: 23,
    src: '/gallery/485981810_9590200161040405_359722123040599458_n.jpg',
    category: 'events',
    title: 'Arts & Crafts Gallery Exhibition',
    description: 'A creative showcase of clay models, paintings, and canvas designs.'
  },
  {
    id: 24,
    src: '/gallery/486054350_1116713687147624_4086885150192183137_n.jpg',
    category: 'events',
    title: 'Independence Day Parade',
    description: 'NCC cadets presenting the guard of honor during the flag hoisting.'
  },
  {
    id: 25,
    src: '/gallery/486159018_1112500714235588_8594873119287038664_n.jpg',
    category: 'academics',
    title: 'Math Olympiad Prep',
    description: 'Advanced logical reasoning and mathematics drills in our resource rooms.'
  },
  {
    id: 26,
    src: '/gallery/487089101_1121046263381033_2393694709069016100_n.jpg',
    category: 'academics',
    title: 'Biology Lab Classification',
    description: 'Students researching plant tissue specimens under light microscopes.'
  },
  {
    id: 27,
    src: '/gallery/487179822_1121046096714383_5614342915506887026_n.jpg',
    category: 'academics',
    title: 'Chemistry Volumetric Analysis',
    description: 'Performing chemical titration practices in our fully equipped labs.'
  },
  {
    id: 28,
    src: '/gallery/487696894_1123852146433778_1489242256585165569_n.jpg',
    category: 'sports',
    title: 'Yoga and Meditation Session',
    description: 'Promoting mental clarity and inner balance during physical training hours.'
  },
  {
    id: 29,
    src: '/gallery/487698226_1123852343100425_807839357526167123_n.jpg',
    category: 'sports',
    title: 'Table Tennis Matches',
    description: 'Intense inter-house table tennis tournament drills inside the gymnasium.'
  },
  {
    id: 30,
    src: '/gallery/487775176_1124345526384440_2524581491999136662_n.jpg',
    category: 'sports',
    title: 'Skating Academy Drills',
    description: 'Developing coordination and high agility drills under school coaches.'
  },
  {
    id: 31,
    src: '/gallery/487821609_1124345549717771_496302793650938709_n.jpg',
    category: 'sports',
    title: 'School Swimming Pool',
    description: 'Equipped with certified lifesavers and modern temperature control systems.'
  },
  {
    id: 32,
    src: '/gallery/487917216_1123852559767070_383639409212605712_n.jpg',
    category: 'campus',
    title: 'Modern Chemistry Lab Arena',
    description: 'Fully exhaust-regulated workspace designed for chemistry practices.'
  },
  {
    id: 33,
    src: '/gallery/487925399_1124345523051107_3121875572283714452_n.jpg',
    category: 'campus',
    title: 'Sports Hall Interior',
    description: 'Versatile synthetic indoor arena for badminton and gymnastics.'
  },
  {
    id: 34,
    src: '/gallery/488189035_1123852186433774_1583533490548750596_n.jpg',
    category: 'campus',
    title: 'School Entrance Lobby',
    description: 'Beautiful receptionist desks and trophy showcases representing glory.'
  },
  {
    id: 35,
    src: '/gallery/488216031_1123852433100416_4776950320059655080_n.jpg',
    category: 'events',
    title: 'Annual Principal Address',
    description: 'The principal welcoming governors and guests during annual day.'
  },
  {
    id: 36,
    src: '/gallery/488247985_1123852106433782_5198809109826584579_n.jpg',
    category: 'events',
    title: 'Awarding Scholarship Checks',
    description: 'Incentivizing excellence by giving annual merit-based scholarships.'
  },
  {
    id: 37,
    src: '/gallery/488251761_1123852529767073_1281476236495953361_n.jpg',
    category: 'events',
    title: 'Teachers Day Celebrations',
    description: 'Creative functions prepared by senior students for their mentors.'
  },
  {
    id: 38,
    src: '/gallery/488274134_1123852483100411_8350735656058729555_n.jpg',
    category: 'events',
    title: 'Republic Day Celebration Parade',
    description: 'School band presenting musical drills for national honors.'
  },
  {
    id: 39,
    src: '/gallery/488507646_1123852286433764_1499281791975581441_n.jpg',
    category: 'events',
    title: 'Grand Parents Day Functions',
    description: 'Bridging generations with emotional acts and stage presentations.'
  },
  {
    id: 40,
    src: '/gallery/582537847_1327890756029915_3000299894603074358_n.jpg',
    category: 'academics',
    title: 'Primary School Activity Room',
    description: 'Promoting tactile and sensory development with puzzles and blocks.'
  },
  {
    id: 41,
    src: '/gallery/584674251_1327890712696586_5992226931136141227_n.jpg',
    category: 'academics',
    title: 'Robotics Workshop Training',
    description: 'Designing electronic micro-circuits and coding robotic gears.'
  },
  {
    id: 42,
    src: '/gallery/715323451_1507909828028006_8822091589871330205_n.jpg',
    category: 'events',
    title: 'Alumni Meet Gathering',
    description: 'Welcoming former batches of graduates back to their second home.'
  },
  {
    id: 43,
    src: '/gallery/716431819_1507909751361347_6219224248670980883_n.jpg',
    category: 'events',
    title: 'Inter-School Debate Finals',
    description: 'Empowering young orators during argumentative elocution contests.'
  },
  {
    id: 44,
    src: '/gallery/716574356_1507909694694686_8252793927191446003_n.jpg',
    category: 'events',
    title: 'Annual Sports Meet Inaugural Parade',
    description: 'Houses marching in coordination representing institutional pride.'
  },
  {
    id: 45,
    src: '/gallery/716614936_1507909638028025_6100307475238447176_n.jpg',
    category: 'events',
    title: 'Closing Ceremony & Torch Run',
    description: 'Concluding the sports meets with honors and a final torch run.'
  }
];

const Gallery = () => {
  const { blocks, loading } = usePageContent('gallery');
  const [items, setItems] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const galleryBlock = blocks.find(b => b.block_type === 'gallery');
    if (galleryBlock && galleryBlock.data?.images && galleryBlock.data.images.length > 0) {
      setItems(galleryBlock.data.images.map((img, i) => {
        // Recover original category by matching filenames
        const filename = img.url.split('/').pop();
        const originalItem = galleryItems.find(item => 
          filename.includes(item.src.split('/').pop())
        );

        return {
          id: i + 1,
          src: img.url,
          title: img.title || '',
          description: img.description || '',
          category: originalItem ? originalItem.category : 'all'
        };
      }));
    } else {
      setItems(galleryItems);
    }
  }, [blocks]);

  // Navigate lightbox index
  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prevIndex) => 
          prevIndex === 0 ? items.length - 1 : prevIndex - 1
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prevIndex) => 
          prevIndex === items.length - 1 ? 0 : prevIndex + 1
        );
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items]);

  // Trap background scroll when lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  return (
    <div className="w-full flex-1">
      <SEO 
        title="School Gallery"
        description="Explore the state-of-the-art campus, classrooms, sports facilities, and cultural events at The Greenwood Public School."
      />
      <Breadcrumbs paths={[{ label: 'Home', url: '/' }, { label: 'Gallery', url: '/gallery' }]} />
      
      {/* HERO SECTION */}
      <section className="relative w-full h-[35vh] min-h-[250px] bg-school-deepRed flex items-center justify-center select-none border-b-4 border-school-gold overflow-hidden">
        {/* Decorative subtle background radial glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-school-gold/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Centered Hero Content */}
        <div className="z-10 px-4 md:px-8 text-center text-white">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4"
            >
              <FiCamera className="text-school-gold w-3.5 h-3.5" />
              <span className="text-xxs uppercase tracking-widest text-white/90 font-medium">Campus Memories</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 drop-shadow-md"
            >
              Our School <span className="text-school-gold">Gallery</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-16 h-1 bg-school-gold rounded-full mx-auto mb-5"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="text-white/80 text-xs md:text-sm lg:text-base font-light max-w-xl mx-auto leading-relaxed drop-shadow-sm"
            >
              Explore and witness our state-of-the-art facilities, sporting milestones, and annual cultural celebrations representing the true life of Greenwood.
            </motion.p>
          </div>
        </div>
      </section>

      {/* GALLERY INTERACTIVE INTERFACE */}
      <section className="bg-white py-16 md:py-20 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* GRID OF IMAGES */}
          {loading && items.length === 0 ? (
            <div className="w-full flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-school-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 4) * 0.05 }}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setLightboxIndex(index)}
                      className="relative bg-school-light border border-school-light/60 rounded-3xl overflow-hidden shadow-xs cursor-pointer group aspect-square hover:shadow-md hover:shadow-school-gold/10 transition-all duration-300"
                    >
                      {/* Image Element */}
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500 ease-out"
                        loading="lazy"
                      />

                      {/* Dark Blur Overlay & Center Zoom Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <div className="bg-school-gold/90 text-school-dark p-3 rounded-2xl shadow-lg border border-school-gold/30 hover:scale-110 transition-transform duration-300">
                          <FiMaximize2 className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </section>

      {/* FULL-SCREEN LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] && (
          <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none">
            
            {/* Lightbox Header */}
            <div className="w-full p-4 flex justify-end z-55 bg-gradient-to-b from-black/60 to-transparent">
              {/* Close Overlay */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 bg-white/10 hover:bg-school-red text-white hover:text-white rounded-full transition-colors duration-200 cursor-pointer focus:outline-none border border-white/10 hover:border-school-red shadow-lg"
                aria-label="Close image lightbox"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Body (Image & Sliders) */}
            <div className="relative flex-1 w-full flex items-center justify-center px-4">
              
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                className="absolute left-4 z-55 p-3 rounded-full bg-white/5 hover:bg-school-gold/90 text-white hover:text-school-dark border border-white/10 hover:border-school-gold shadow-lg cursor-pointer transition-all duration-300"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              {/* Large Image Frame */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-4xl max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={items[lightboxIndex]?.src}
                  alt={items[lightboxIndex]?.title}
                  className="max-w-full max-h-[70vh] object-contain select-none pointer-events-none"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 z-55 p-3 rounded-full bg-white/5 hover:bg-school-gold/90 text-white hover:text-school-dark border border-white/10 hover:border-school-gold shadow-lg cursor-pointer transition-all duration-300"
                aria-label="Next image"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Footer Details */}
            <div className="w-full p-6 text-center z-55 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-[10px] text-school-gold tracking-widest font-semibold">
                IMAGE {lightboxIndex + 1} OF {items.length}
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Gallery;
