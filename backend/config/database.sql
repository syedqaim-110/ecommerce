-- =============================================
-- ECOMMERCE DATABASE SETUP - MySQL
-- Run this file to create all tables
-- =============================================

CREATE DATABASE IF NOT EXISTS ecommerce_db1;
USE ecommerce_db1;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  address TEXT,
  avatar VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  category_id INT,
  image VARCHAR(255),
  stock INT DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0,
  total_orders INT DEFAULT 0,
  shipping_info VARCHAR(100) DEFAULT 'Free Shipping',
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin User (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@ecommerce.com', '$2a$10$7Wnzj7ViURx2RSv9bNOEau5gNGWDhPtMC06HZDWG3Bu3z6/L.x4fO', 'admin');

-- Categories
INSERT IGNORE INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Home & Outdoor', 'home-outdoor', 'Home decor and outdoor products'),
('Clothing', 'clothing', 'Fashion and apparel'),
('Sports', 'sports', 'Sports and fitness equipment'),
('Books', 'books', 'Books and educational material');

-- Sample Products
INSERT IGNORE INTO products (name, slug, description, price, old_price, category_id, stock, rating, total_orders, shipping_info, is_featured) VALUES
('GoPro HERO6 4K Action Camera', 'gopro-hero6-4k', 'Professional action camera with 4K video recording', 99.50, 128.00, 1, 50, 7.5, 154, 'Free Shipping', 1),
('Samsung Galaxy S21', 'samsung-galaxy-s21', 'Latest Samsung flagship smartphone', 799.00, 999.00, 1, 30, 8.5, 89, 'Free Shipping', 1),
('Laptop Pro 15"', 'laptop-pro-15', 'High performance laptop for professionals', 1299.00, 1499.00, 1, 20, 9.0, 45, 'Free Shipping', 1),
('Wireless Headphones', 'wireless-headphones', 'Premium noise cancelling headphones', 149.00, 199.00, 1, 100, 8.0, 320, 'Free Shipping', 0),
('Smart Watch Series 6', 'smart-watch-series-6', 'Advanced smartwatch with health tracking', 299.00, 349.00, 1, 75, 7.8, 210, 'Free Shipping', 1),
('Soft Ergonomic Chair', 'soft-ergonomic-chair', 'Comfortable chair for home and office', 89.00, 120.00, 2, 40, 8.2, 95, 'Free Shipping', 0),
('Modern Sofa Set', 'modern-sofa-set', 'Elegant 3-piece sofa set for living room', 599.00, 750.00, 2, 15, 9.1, 28, 'Free Shipping', 1),
('Kitchen Mixer Pro', 'kitchen-mixer-pro', 'Professional grade kitchen stand mixer', 189.00, 250.00, 2, 60, 8.7, 142, 'Free Shipping', 0),
('Coffee Maker Deluxe', 'coffee-maker-deluxe', 'Automatic coffee maker with grinder', 129.00, 160.00, 2, 85, 8.3, 198, 'Free Shipping', 0),
('Bluetooth Speaker', 'bluetooth-speaker', 'Portable waterproof bluetooth speaker', 59.00, 80.00, 1, 200, 7.9, 450, 'Free Shipping', 0);

-- =============================================
-- FIX: Update admin password if already inserted
-- Run this if admin login is giving 500 error
-- =============================================
UPDATE users SET password = '$2a$10$7Wnzj7ViURx2RSv9bNOEau5gNGWDhPtMC06HZDWG3Bu3z6/L.x4fO' WHERE email = 'admin@ecommerce.com';

-- =============================================
-- NEW TABLES: Newsletter, Inquiries, Suppliers by Region
-- =============================================

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Send Quote / Supplier Inquiries
CREATE TABLE IF NOT EXISTS supplier_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_name VARCHAR(255) NOT NULL,
  details TEXT,
  quantity INT DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'Pcs',
  status ENUM('pending','contacted','closed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Suppliers by Region
CREATE TABLE IF NOT EXISTS region_suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  domain VARCHAR(100),
  supplier_count INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (product reviews already exists, this is general site reviews)
-- Product reviews already handled in reviews table above

-- Seed Region Suppliers
INSERT IGNORE INTO region_suppliers (country_name, country_code, domain, supplier_count, sort_order) VALUES
('Arabic Emirates', 'AE', 'shopname.ae', 321, 1),
('Australia', 'AU', 'shopname.au', 287, 2),
('United States', 'US', 'shopname.us', 1032, 3),
('Russia', 'RU', 'shopname.ru', 543, 4),
('Italy', 'IT', 'shopname.it', 219, 5),
('Denmark', 'DK', 'shopname.dk', 167, 6),
('France', 'FR', 'shopname.fr', 394, 7),
('China', 'CN', 'shopname.cn', 2341, 8),
('Great Britain', 'GB', 'shopname.co.uk', 876, 9);

-- =============================================
-- NEW TABLES: Messages, Deals, Services, Languages, Currencies
-- =============================================

-- Messages (Customer to Admin)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  sender_name VARCHAR(100),
  sender_email VARCHAR(150),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  admin_reply TEXT,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Deals & Offers (Admin managed)
CREATE TABLE IF NOT EXISTS deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  end_time DATETIME NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deal_id INT NOT NULL,
  product_id INT NOT NULL,
  discount_percent INT NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Extra Services (Admin managed)
CREATE TABLE IF NOT EXISTS extra_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Package',
  image VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Languages
CREATE TABLE IF NOT EXISTS languages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  flag_code VARCHAR(5),
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
);

-- Currencies
CREATE TABLE IF NOT EXISTS currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
);

-- Customer Service / Help Pages
CREATE TABLE IF NOT EXISTS help_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category ENUM('faq','shipping','returns','payment','account','other') DEFAULT 'faq',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Deals
INSERT IGNORE INTO deals (title, subtitle, end_time) VALUES
('Deals and offers', 'Hygiene equipments', DATE_ADD(NOW(), INTERVAL 4 HOUR));

INSERT IGNORE INTO deal_items (deal_id, product_id, discount_percent, sort_order)
SELECT 1, id, 25, ROW_NUMBER() OVER() FROM products WHERE is_active=1 LIMIT 5;

-- Seed Services
INSERT IGNORE INTO extra_services (title, icon, sort_order) VALUES
('Source from Industry Hubs', 'Search', 1),
('Customize Your Products', 'Package', 2),
('Fast, reliable shipping by ocean or air', 'Plane', 3),
('Product monitoring and inspection', 'ShieldCheck', 4);

-- Seed Languages
INSERT IGNORE INTO languages (code, name, native_name, flag_code, sort_order) VALUES
('en', 'English', 'English', 'US', 1),
('ur', 'Urdu', 'اردو', 'PK', 2),
('ar', 'Arabic', 'العربية', 'SA', 3),
('fr', 'French', 'Français', 'FR', 4),
('de', 'German', 'Deutsch', 'DE', 5),
('zh', 'Chinese', '中文', 'CN', 6),
('es', 'Spanish', 'Español', 'ES', 7),
('ru', 'Russian', 'Русский', 'RU', 8);

-- Seed Currencies
INSERT IGNORE INTO currencies (code, name, symbol, exchange_rate, sort_order) VALUES
('USD', 'US Dollar', '$', 1.0000, 1),
('EUR', 'Euro', '€', 0.9200, 2),
('GBP', 'British Pound', '£', 0.7900, 3),
('PKR', 'Pakistani Rupee', '₨', 278.5000, 4),
('AED', 'UAE Dirham', 'د.إ', 3.6700, 5),
('SAR', 'Saudi Riyal', '﷼', 3.7500, 6),
('CNY', 'Chinese Yuan', '¥', 7.2400, 7),
('INR', 'Indian Rupee', '₹', 83.1000, 8);

-- Seed Help Articles
INSERT IGNORE INTO help_articles (title, content, category, sort_order) VALUES
('How to place an order?', 'Browse products, add to cart, proceed to checkout and enter shipping address.', 'faq', 1),
('What payment methods are accepted?', 'We accept Cash on Delivery, Bank Transfer, and major Credit Cards.', 'payment', 2),
('How long does shipping take?', 'Standard shipping takes 3-7 business days. Express shipping 1-2 days.', 'shipping', 3),
('How to return a product?', 'You can return products within 30 days of delivery. Contact our support team.', 'returns', 4),
('How to track my order?', 'Login to your account and go to My Orders section to track your order status.', 'account', 5);

-- =============================================
-- SUPPLIER SYSTEM - Complete
-- =============================================

-- Suppliers table (separate from users)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(30),
  website VARCHAR(255),
  logo VARCHAR(255),
  is_verified TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  total_products INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Product sizes (supplier sets per product)
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_label VARCHAR(50) NOT NULL,
  stock INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product discount tiers (supplier sets)
CREATE TABLE IF NOT EXISTS product_price_tiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  min_qty INT NOT NULL,
  max_qty INT,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Messages between customer<->supplier and customer<->admin
-- Extend existing messages table with type
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type ENUM('customer_admin','customer_supplier','supplier_admin') DEFAULT 'customer_admin';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id INT DEFAULT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_type ENUM('admin','supplier') DEFAULT 'admin';

-- Chatbot conversations
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(100),
  role ENUM('user','bot') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  supplier_id INT,
  product_id INT,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Update users table to add supplier role
ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','supplier') DEFAULT 'user';

-- Help pages (full content)
ALTER TABLE help_articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
UPDATE help_articles SET slug = LOWER(REPLACE(REPLACE(title,' ','-'),'/','')) WHERE slug IS NULL;

-- Seed demo supplier user
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Demo Supplier', 'supplier@ecommerce.com', '$2a$10$7Wnzj7ViURx2RSv9bNOEau5gNGWDhPtMC06HZDWG3Bu3z6/L.x4fO', 'supplier');

INSERT IGNORE INTO suppliers (user_id, company_name, description, country, city, is_verified)
SELECT id, 'Demo Trading Co.', 'Quality products supplier', 'China', 'Shanghai', 1
FROM users WHERE email='supplier@ecommerce.com' LIMIT 1;

-- Add supplier_id to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id INT DEFAULT NULL;
ALTER TABLE products ADD FOREIGN KEY IF NOT EXISTS (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
