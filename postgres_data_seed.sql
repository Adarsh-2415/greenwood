-- Insert static pages (matching your previous MySQL data structure)
INSERT INTO pages (id, slug, title, route, template, status, version, hero_title, hero_subtitle, hero_image, created_at, updated_at) 
VALUES 
  (2, 'about', 'About Us', '/about', 'basic', 'published', 1, 'About Greenwood', 'A leading institution dedicated to preparing dynamic global citizens through transformative education.', 'https://shsoxgdmatrldwfinlkc.supabase.co/storage/v1/object/public/media/image/school_image.jpg', NOW(), NOW()),
  (3, 'gallery', 'Gallery', '/gallery', 'gallery', 'published', 6, 'Gallery', NULL, NULL, NOW(), NOW()),
  (4, 'contact', 'Contact Us', '/contact', 'basic', 'draft', 1, 'Contact Us', NULL, NULL, NOW(), NOW()),
  (5, 'faculty', 'Faculty & Staff', '/faculty', 'faculty', 'published', 5, 'Faculty & Staff', NULL, NULL, NOW(), NOW()),
  (6, 'mandatory-disclosures', 'Mandatory Disclosures', '/mandatory-disclosures', 'downloads', 'published', 10, 'Mandatory Disclosures', NULL, NULL, NOW(), NOW()),
  (7, 'transfer-certificate', 'Transfer Certificate Search', '/transfer-certificate', 'basic', 'draft', 1, 'Transfer Certificate Search', NULL, NULL, NOW(), NOW()),
  (8, 'administrator/fee-structure', 'Fee Structure', '/administrator/fee-structure', 'table', 'published', 10, 'Fee Structure', NULL, NULL, NOW(), NOW()),
  (9, 'administrator/category-wise-enrollment', 'Category Wise Enrollment', '/administrator/category-wise-enrollment', 'basic', 'draft', 1, 'Category Wise Enrollment', NULL, NULL, NOW(), NOW()),
  (10, 'administrator/class-wise-enrollment', 'Class Wise Enrollment', '/administrator/class-wise-enrollment', 'basic', 'draft', 1, 'Class Wise Enrollment', NULL, NULL, NOW(), NOW()),
  (11, 'administrator/senior-information', 'Senior Information', '/administrator/senior-information', 'basic', 'draft', 1, 'Senior Information', NULL, NULL, NOW(), NOW()),
  (12, 'administrator/circulars', 'Circulars & Announcements', '/administrator/circulars', 'notice_board', 'draft', 1, 'Circulars & Announcements', NULL, NULL, NOW(), NOW()),
  (13, 'academics/curriculum', 'Curriculum', '/academics/curriculum', 'basic', 'published', 4, 'Curriculum', NULL, NULL, NOW(), NOW()),
  (14, 'academics/examination-schedule', 'Examination Schedule', '/academics/examination-schedule', 'notice_board', 'published', 3, 'Examination Schedule', NULL, NULL, NOW(), NOW()),
  (15, 'academics/subject-coordinators', 'Subject Coordinators', '/academics/subject-coordinators', 'basic', 'draft', 1, 'Subject Coordinators', NULL, NULL, NOW(), NOW()),
  (16, 'academics/calendar', 'Academic Calendar', '/academics/calendar', 'downloads', 'published', 4, 'Academic Calendar', NULL, NULL, NOW(), NOW()),
  (17, 'infrastructure/campus-classrooms', 'Campus & Classrooms', '/infrastructure/campus-classrooms', 'basic', 'published', 3, 'Campus & Classrooms', NULL, NULL, NOW(), NOW()),
  (18, 'infrastructure/labs', 'Science & Tech Labs', '/infrastructure/labs', 'basic', 'draft', 1, 'Science & Tech Labs', NULL, NULL, NOW(), NOW()),
  (19, 'infrastructure/library', 'School Library', '/infrastructure/library', 'basic', 'draft', 1, 'School Library', NULL, NULL, NOW(), NOW()),
  (20, 'infrastructure/sports-complex', 'Sports Complex', '/infrastructure/sports-complex', 'basic', 'draft', 1, 'Sports Complex', NULL, NULL, NOW(), NOW()),
  (21, 'achievements/awards-scholarships', 'Awards and Scholarships', '/achievements/awards-scholarships', 'achievement', 'draft', 1, 'Awards and Scholarships', NULL, NULL, NOW(), NOW()),
  (22, 'achievements/painting-music-dance', 'Painting, Music and Dance Studio', '/achievements/painting-music-dance', 'basic', 'draft', 1, 'Painting, Music and Dance Studio', NULL, NULL, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert site settings
INSERT INTO site_settings (setting_key, setting_value, setting_group, updated_at)
VALUES
  ('principal_name', 'Mr. AMIT SINGHAL', 'principal', NOW()),
  ('principal_message', 'At Greenwood, we believe education is not merely the acquisition of facts, but the training of the mind to think critically, innovate fearlessly, and lead with empathy. Our mission is to provide an ecosystem where students discover their true potential and prepare themselves to make lasting contributions to society.', 'principal', NOW()),
  ('principal_photo', 'https://shsoxgdmatrldwfinlkc.supabase.co/storage/v1/object/public/media/faculty/1782120426_dummy.jfif', 'principal', NOW()),
  ('trustee_name', 'Dr. Shalini Pant', 'trustee', NOW()),
  ('trustee_message', 'Value-based modern education has always been a dream. Education has to keep pace with the changing times, but should have the strong foundation based on our old value system. Keeping that fact in mind, this organization was started—to cater to the needs of persons who want to bring their children up with a difference.', 'trustee', NOW()),
  ('trustee_photo', 'https://shsoxgdmatrldwfinlkc.supabase.co/storage/v1/object/public/media/faculty/1782120883_294-2947279_user-icon-female-white-passport-size-photo-clipart.png', 'trustee', NOW()),
  ('social_facebook', 'https://www.facebook.com/GreenwoodPublicSchoolRookee/', 'social', NOW()),
  ('social_youtube', 'https://www.youtube.com/@thegreenwoodpublicschool6025', 'social', NOW())
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
