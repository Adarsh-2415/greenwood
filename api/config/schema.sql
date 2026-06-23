-- MySQL Schema for Greenwood Public School CMS

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'editor') DEFAULT 'editor',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    route VARCHAR(255) NOT NULL,
    template VARCHAR(50) DEFAULT 'basic',
    status ENUM('draft', 'published') DEFAULT 'draft',
    version INT DEFAULT 1,
    hero_title VARCHAR(255) NULL,
    hero_subtitle TEXT NULL,
    hero_image VARCHAR(500) NULL,
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    meta_keywords VARCHAR(500) NULL,
    og_image VARCHAR(500) NULL,
    canonical_url VARCHAR(500) NULL,
    created_by INT NULL,
    updated_by INT NULL,
    published_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_slug_status (slug, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    data JSON NOT NULL,
    status ENUM('draft', 'published') DEFAULT 'published',
    version INT DEFAULT 1,
    is_visible TINYINT(1) DEFAULT 1,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_page_order (page_id, sort_order),
    INDEX idx_page_status (page_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    version INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    hero_title VARCHAR(255) NULL,
    hero_subtitle TEXT NULL,
    hero_image VARCHAR(500) NULL,
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    meta_keywords VARCHAR(500) NULL,
    og_image VARCHAR(500) NULL,
    canonical_url VARCHAR(500) NULL,
    status ENUM('draft', 'published') NOT NULL,
    change_summary VARCHAR(500) NULL,
    revised_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (revised_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_page_version (page_id, version DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS block_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    block_id INT NOT NULL,
    page_id INT NOT NULL,
    version INT NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL,
    data JSON NOT NULL,
    status ENUM('draft', 'published') NOT NULL,
    revised_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (revised_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_block_version (block_id, version DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(150) NOT NULL,
    description TEXT NULL,
    icon VARCHAR(50) NULL,
    default_blocks JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10) NOT NULL,
    file_size INT NOT NULL,
    category ENUM('image','document','video','gallery','faculty','certificate','other') DEFAULT 'other',
    alt_text VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    usage_count INT DEFAULT 0,
    uploaded_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_extension (file_extension),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transfer_certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(200) NOT NULL,
    dob DATE NOT NULL,
    admission_number VARCHAR(100) NOT NULL,
    tc_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    pdf_path VARCHAR(500) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    uploaded_by INT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_search (student_name, dob),
    INDEX idx_tc_number (tc_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_group VARCHAR(50) DEFAULT 'general',
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_group (setting_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homepage_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL UNIQUE,
    section_name VARCHAR(100) NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    content JSON NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data for Templates
INSERT IGNORE INTO page_templates (name, label, description, icon, default_blocks) VALUES
('basic', 'Basic Page', 'A simple page with text and image blocks', 'file-text', 
 '[{"block_type":"text","data":{"heading":"Page Title","body":"<p>Add your content here...</p>","alignment":"left"}} ]'),
('gallery', 'Gallery Page', 'Image gallery with optional descriptions', 'image',
 '[{"block_type":"text","data":{"heading":"Gallery","body":"<p>Browse our collection.</p>","alignment":"center"}},{"block_type":"gallery","data":{"title":"Photo Gallery","columns":3,"images":[]}} ]'),
('faculty', 'Faculty Page', 'Faculty member cards with photos and details', 'users',
 '[{"block_type":"text","data":{"heading":"Our Faculty","body":"<p>Meet our dedicated team.</p>","alignment":"center"}},{"block_type":"faculty","data":{"title":"Teaching Staff","members":[]}} ]'),
('notice_board', 'Notice Board Page', 'List of notices and announcements', 'bell',
 '[{"block_type":"text","data":{"heading":"Notices & Circulars","body":"<p>Stay updated with important announcements.</p>","alignment":"center"}},{"block_type":"notice","data":{"title":"","date":"","body":"","type":"info"}} ]'),
('downloads', 'Downloads Page', 'Downloadable files and documents', 'download',
 '[{"block_type":"text","data":{"heading":"Downloads","body":"<p>Important documents and forms.</p>","alignment":"center"}},{"block_type":"downloads","data":{"title":"Documents","files":[]}} ]'),
('achievement', 'Achievement Page', 'Awards, scholarships and accomplishments', 'award',
 '[{"block_type":"text","data":{"heading":"Achievements","body":"<p>Our proud moments.</p>","alignment":"center"}},{"block_type":"cards","data":{"title":"Awards & Recognition","columns":3,"cards":[]}} ]');
