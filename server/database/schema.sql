-- POS Sales Tracker Database Schema
-- Created for Entertainment Business Management System

CREATE DATABASE IF NOT EXISTS pos_sales_tracker;
USE pos_sales_tracker;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(500) DEFAULT NULL,
    role ENUM('super_admin', 'administrator', 'regular_user') NOT NULL DEFAULT 'regular_user',
    can_delete BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_view_all BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'pending', 'disabled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    city_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_city (city_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- POS Table
CREATE TABLE IF NOT EXISTS pos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location_id INT NOT NULL,
    city_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_location (location_id),
    INDEX idx_city (city_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User_POS Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS user_pos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pos_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pos (user_id, pos_id),
    INDEX idx_user (user_id),
    INDEX idx_pos (pos_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Types Table
CREATE TABLE IF NOT EXISTS sales_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    attachment_applicable BOOLEAN DEFAULT FALSE,
    attachment_required BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Entries Table
CREATE TABLE IF NOT EXISTS sales_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pos_id INT NOT NULL,
    entry_date DATE NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_user_pos_date (user_id, pos_id, entry_date),
    INDEX idx_user (user_id),
    INDEX idx_pos (pos_id),
    INDEX idx_date (entry_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Entry Details Table
CREATE TABLE IF NOT EXISTS sales_entry_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_entry_id INT NOT NULL,
    sales_type_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    attachment_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_entry_id) REFERENCES sales_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (sales_type_id) REFERENCES sales_types(id) ON DELETE RESTRICT,
    INDEX idx_entry (sales_entry_id),
    INDEX idx_type (sales_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Data

-- Insert default cities
INSERT INTO cities (name, status) VALUES
('Mumbai', 'active'),
('Delhi', 'active'),
('Bangalore', 'active');

-- Insert default locations
INSERT INTO locations (name, city_id, status) VALUES
('Phoenix Mall', 1, 'active'),
('Inorbit Mall', 1, 'active'),
('Select City Walk', 2, 'active'),
('DLF Mall', 2, 'active'),
('Orion Mall', 3, 'active'),
('Forum Mall', 3, 'active');

-- Insert default POS terminals
INSERT INTO pos (name, location_id, city_id, status) VALUES
('POS-MUM-PHX-01', 1, 1, 'active'),
('POS-MUM-PHX-02', 1, 1, 'active'),
('POS-MUM-INO-01', 2, 1, 'active'),
('POS-DEL-SCW-01', 3, 2, 'active'),
('POS-DEL-DLF-01', 4, 2, 'active'),
('POS-BLR-ORI-01', 5, 3, 'active'),
('POS-BLR-FOR-01', 6, 3, 'active');

-- Insert default sales types
INSERT INTO sales_types (name, attachment_applicable, attachment_required, status) VALUES
('Cash Sales', TRUE, FALSE, 'active'),
('Bank Deposit', TRUE, TRUE, 'active'),
('Coupon Sales', TRUE, FALSE, 'active'),
('Card Payment', TRUE, FALSE, 'active'),
('UPI Payment', FALSE, FALSE, 'active');

-- Insert demo users (passwords are hashed for: admin123, manager123, user123)
-- Note: In production, use proper password hashing with bcrypt
INSERT INTO users (name, email, password_hash, role, can_delete, can_edit, can_view_all, status) VALUES
('Super Admin', 'admin@playzone.com', '$2a$10$27GPouZF90gL2chzm7gW9OPOgcQJuSKMq3rp9q4xKYu9/He5ToLqy', 'super_admin', TRUE, TRUE, TRUE, 'active'),
('Manager User', 'manager@playzone.com', '$2a$10$4XjtzQvNNnChKxpZjClcFOZJt8CkFJNhUJDh4u4NKCOEJsYxFDt3O', 'administrator', FALSE, TRUE, TRUE, 'active'),
('Regular User', 'user@playzone.com', '$2a$10$kXp.W5BUpe9pvNuPw677U.W8IVPamqZDzT1Wx1YLQ2VCPmyS0sU96', 'regular_user', FALSE, FALSE, FALSE, 'active');

-- Assign POS to users
INSERT INTO user_pos (user_id, pos_id) VALUES
(3, 1), -- Regular user assigned to POS 1
(3, 2), -- Regular user assigned to POS 2
(2, 1), -- Manager assigned to POS 1
(2, 2), -- Manager assigned to POS 2
(2, 3); -- Manager assigned to POS 3

-- Sample sales entries for demonstration
INSERT INTO sales_entries (user_id, pos_id, entry_date, status) VALUES
(3, 1, CURDATE(), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'submitted'),
(3, 2, CURDATE(), 'submitted');

-- Sample sales entry details
INSERT INTO sales_entry_details (sales_entry_id, sales_type_id, amount) VALUES
(1, 1, 15000.00),
(1, 2, 25000.00),
(1, 3, 5000.00),
(2, 1, 18000.00),
(2, 2, 22000.00),
(2, 3, 6000.00),
(3, 1, 12000.00),
(3, 2, 28000.00),
(3, 3, 4500.00);

-- Create views for easier querying

-- View for complete sales entry information
CREATE OR REPLACE VIEW v_sales_entries_complete AS
SELECT 
    se.id,
    se.entry_date,
    se.submitted_at,
    se.status,
    u.name AS user_name,
    u.email AS user_email,
    p.name AS pos_name,
    l.name AS location_name,
    c.name AS city_name,
    SUM(sed.amount) AS total_amount
FROM sales_entries se
JOIN users u ON se.user_id = u.id
JOIN pos p ON se.pos_id = p.id
JOIN locations l ON p.location_id = l.id
JOIN cities c ON p.city_id = c.id
LEFT JOIN sales_entry_details sed ON se.id = sed.sales_entry_id
GROUP BY se.id, se.entry_date, se.submitted_at, se.status, 
         u.name, u.email, p.name, l.name, c.name;

-- View for sales breakdown by type
CREATE OR REPLACE VIEW v_sales_by_type AS
SELECT 
    se.entry_date,
    c.name AS city_name,
    l.name AS location_name,
    p.name AS pos_name,
    st.name AS sales_type,
    sed.amount,
    sed.attachment_path
FROM sales_entry_details sed
JOIN sales_entries se ON sed.sales_entry_id = se.id
JOIN sales_types st ON sed.sales_type_id = st.id
JOIN pos p ON se.pos_id = p.id
JOIN locations l ON p.location_id = l.id
JOIN cities c ON p.city_id = c.id
WHERE se.status = 'submitted';

-- Indexes for better performance
CREATE INDEX idx_entry_date_status ON sales_entries(entry_date, status);
CREATE INDEX idx_amount ON sales_entry_details(amount);

COMMIT;
