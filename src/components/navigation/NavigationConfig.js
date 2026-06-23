/**
 * Navigation Configuration for The Greenwood Public School.
 * This file serves as the centralized source of truth for the header and navigation menus.
 * Future CMS integrations can replace this static configuration with dynamic API data.
 */

export const contactInfo = {
  email: "greenwoodroorkee@gmail.com",
  phone: "+91-8755195353",
  alternatePhone: "+91-8755205353",
  address: "Chudiyala Railway Station, Roorkee(Uttarakhand)-247667",
  admissionYear: "2026-27",
  ctaText: "Admissions Open 2026-27",
  ctaLink: "/admissions"
};

export const navigationLinks = [
  {
    id: "home",
    label: "Home",
    path: "/",
    hasDropdown: false
  },
  {
    id: "about",
    label: "About Us",
    path: "/about",
    hasDropdown: false
  },
  {
    id: "administrator",
    label: "Administrator",
    path: "#",
    hasDropdown: true,
    dropdownItems: [
      { id: "fee-structure", label: "Fee Structure", path: "/administrator/fee-structure" },
      { id: "category-wise-enrollment", label: "Category Wise Enrollment", path: "/administrator/category-wise-enrollment" },
      { id: "class-wise-enrollment", label: "Class Wise Enrollment", path: "/administrator/class-wise-enrollment" },
      { id: "senior-information", label: "Senior Information", path: "/administrator/senior-information" },
      { id: "circulars", label: "Circulars", path: "/administrator/circulars" }
    ]
  },
  {
    id: "academics",
    label: "Academics",
    path: "#",
    hasDropdown: true,
    dropdownItems: [
      { id: "curriculum", label: "Curriculum", path: "/academics/curriculum" },
      { id: "examination-schedule", label: "Examination Schedule", path: "/academics/examination-schedule" },
      { id: "subject-coordinators", label: "Subject Coordinators", path: "/academics/subject-coordinators" },
      { id: "academic-calendar", label: "Academic Calendar", path: "/academics/calendar" }
    ]
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    path: "#",
    hasDropdown: true,
    dropdownItems: [
      { id: "campus-classrooms", label: "Campus & Classrooms", path: "/infrastructure/campus-classrooms" },
      { id: "labs", label: "Science & Tech Labs", path: "/infrastructure/labs" },
      { id: "library", label: "School Library", path: "/infrastructure/library" },
      { id: "sports-complex", label: "Sports Complex", path: "/infrastructure/sports-complex" }
    ]
  },
  {
    id: "faculty-staff",
    label: "Faculty & Staff",
    path: "/faculty",
    hasDropdown: false
  },
  {
    id: "achievements",
    label: "Achievements",
    path: "#",
    hasDropdown: true,
    dropdownItems: [
      { id: "awards-scholarships", label: "Awards and Scholarships", path: "/achievements/awards-scholarships" },
      { id: "painting-music-dance", label: "Painting, Music and Dance Studio", path: "/achievements/painting-music-dance" }
    ]
  },
  {
    id: "gallery",
    label: "Gallery",
    path: "/gallery",
    hasDropdown: false
  },
  {
    id: "contact-us",
    label: "Contact Us",
    path: "/contact",
    hasDropdown: false
  }
];

export const getAdditionalPages = (dynamicPages = []) => {
  const staticPaths = new Set([
    '/',
    '/about',
    '/faculty',
    '/gallery',
    '/contact',
    '/administrator/fee-structure',
    '/administrator/category-wise-enrollment',
    '/administrator/class-wise-enrollment',
    '/administrator/senior-information',
    '/administrator/circulars',
    '/academics/curriculum',
    '/academics/examination-schedule',
    '/academics/subject-coordinators',
    '/academics/calendar',
    '/infrastructure/campus-classrooms',
    '/infrastructure/labs',
    '/infrastructure/library',
    '/infrastructure/sports-complex',
    '/achievements/awards-scholarships',
    '/achievements/painting-music-dance',
    '/transfer-certificate',
    '/mandatory-disclosures'
  ]);

  return dynamicPages.filter(page => page.route && !staticPaths.has(page.route));
};
