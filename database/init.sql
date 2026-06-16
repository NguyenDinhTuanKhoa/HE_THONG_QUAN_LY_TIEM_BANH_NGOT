-- =============================================
-- Quản Lý Tiệm Bánh Database Schema
-- =============================================

USE qlchbn;

-- Disable foreign key checks for table creation
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. ACCOUNTS TABLE (Admin/Staff Management)
-- =============================================
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'manager', 'staff') NOT NULL,
    phone VARCHAR(15),
    avatar VARCHAR(500),
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'banned', 'pending') DEFAULT 'active',

    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

ALTER TABLE accounts AUTO_INCREMENT = 1000;

-- =============================================
-- 2. CUSTOMERS TABLE
-- =============================================
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    avatar VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'banned', 'pending') DEFAULT 'active',

    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_full_name (full_name)
);

ALTER TABLE customers AUTO_INCREMENT = 10000;

-- =============================================
-- 3. CATEGORIES TABLE
-- =============================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',

    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_featured (is_featured),

    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =============================================
-- 4. PRODUCTS TABLE
-- =============================================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL,
    cost_price DECIMAL(10,2) NULL,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    weight DECIMAL(8,2) NULL,
    dimensions VARCHAR(100) NULL,
    category_id INT NOT NULL,
    featured_image VARCHAR(500),
    gallery TEXT, -- JSON array of image URLs
    ingredients TEXT,
    nutritional_info TEXT, -- JSON object
    allergen_info TEXT,
    preparation_time INT NULL, -- in minutes
    shelf_life INT NULL, -- in days
    storage_instructions TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'out_of_stock', 'discontinued') DEFAULT 'active',

    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_category_id (category_id),
    INDEX idx_price (price),
    INDEX idx_status (status),
    INDEX idx_stock_quantity (stock_quantity),
    INDEX idx_is_featured (is_featured),
    INDEX idx_is_bestseller (is_bestseller),
    INDEX idx_rating_average (rating_average),
    INDEX idx_created_at (created_at),

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- =============================================
-- 5. ORDERS TABLE
-- =============================================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    customer_address TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'e_wallet') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    delivery_method ENUM('pickup', 'delivery') NOT NULL,
    delivery_date DATE NULL,
    delivery_time VARCHAR(20) NULL,
    delivery_notes TEXT,
    coupon_code VARCHAR(50) NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') DEFAULT 'pending',

    INDEX idx_order_number (order_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_delivery_method (delivery_method),
    INDEX idx_created_at (created_at),
    INDEX idx_delivery_date (delivery_date),

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

ALTER TABLE orders AUTO_INCREMENT = 100000;

-- =============================================
-- 6. ORDER_ITEMS TABLE
-- =============================================
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_options TEXT, -- JSON for customizations
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- =============================================
-- 7. COUPONS TABLE
-- =============================================
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    used_count INT DEFAULT 0,
    usage_limit_per_customer INT DEFAULT 1,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    applicable_products TEXT, -- JSON array of product IDs
    applicable_categories TEXT, -- JSON array of category IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',

    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_valid_from (valid_from),
    INDEX idx_valid_until (valid_until),
    INDEX idx_type (type)
);

-- =============================================
-- 8. COUPON_USAGE TABLE
-- =============================================
DROP TABLE IF EXISTS coupon_usage;
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_coupon_id (coupon_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_id (order_id),
    INDEX idx_used_at (used_at),

    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,

    UNIQUE KEY unique_coupon_order (coupon_id, order_id)
);

-- =============================================
-- 9. MESSAGES TABLE
-- =============================================
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(15),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('contact', 'complaint', 'suggestion', 'order_inquiry') DEFAULT 'contact',
    order_id INT NULL,
    replied_by INT NULL,
    reply_message TEXT NULL,
    replied_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',

    INDEX idx_customer_id (customer_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_order_id (order_id),

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (replied_by) REFERENCES accounts(id) ON DELETE SET NULL
);

-- =============================================
-- 10. WEBSITE_SETTINGS TABLE
-- =============================================
DROP TABLE IF EXISTS website_settings;
CREATE TABLE website_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json', 'image') DEFAULT 'text',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- =============================================
-- 11. PRODUCT_REVIEWS TABLE (new)
-- =============================================
DROP TABLE IF EXISTS product_reviews;
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

    INDEX idx_product_id (product_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,

    UNIQUE KEY unique_customer_product_order (customer_id, product_id, order_id)
);

-- =============================================
-- 12. INVENTORY_LOGS TABLE
-- =============================================
DROP TABLE IF EXISTS inventory_logs;
CREATE TABLE inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(255),
    reference_type ENUM('order', 'purchase', 'adjustment', 'return') NULL,
    reference_id INT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_product_id (product_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference_type (reference_type),
    INDEX idx_reference_id (reference_id),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES accounts(id) ON DELETE SET NULL
);

-- =============================================
-- 13. AUDIT_LOGS TABLE
-- =============================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    user_type ENUM('account', 'customer') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NULL,
    old_values TEXT NULL, -- JSON
    new_values TEXT NULL, -- JSON
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_record_id (record_id),
    INDEX idx_created_at (created_at)
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert default accounts (Passwords: admin123, quanly123, nhanvien123)
INSERT INTO accounts (username, email, password, full_name, role, phone, created_at, status) VALUES
('admin', 'admin@tiembanh.com', '$2b$10$Ub9FTueIVuElKxzxpxMpvedLW9sysC2HqFOcj0wiQJ/oodd6WoU7K', 'Quản Trị Viên', 'admin', '0123456789', NOW(), 'active'),
('quanly', 'quanly@tiembanh.com', '$2b$10$fY7mfsFi5QcAXRkwymaRuOFNrZIQl50LCB4C3ta3WCGw44eY.W5S2', 'Quản Lý Cửa Hàng', 'manager', '0123456790', NOW(), 'active'),
('nhanvien1', 'nhanvien1@tiembanh.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Nhân Viên Bán Hàng 1', 'staff', '0123456791', NOW(), 'active'),
('nhanvien2', 'nhanvien2@tiembanh.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Nhân Viên Bán Hàng 2', 'staff', '0123456792', NOW(), 'active'),
('nhanvien3', 'nhanvien3@tiembanh.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Nhân Viên Bán Hàng 3', 'staff', '0123456793', NOW(), 'active');

-- Insert sample categories
INSERT INTO categories (name, slug, description, sort_order, is_featured, status) VALUES
('Bánh Ngọt', 'banh-ngot', 'Các loại bánh ngọt thơm ngon', 1, TRUE, 'active'),
('Bánh Mì', 'banh-mi', 'Bánh mì tươi ngon hàng ngày', 2, TRUE, 'active'),
('Bánh Kem', 'banh-kem', 'Bánh kem sinh nhật và sự kiện', 3, TRUE, 'active'),
('Đồ Uống', 'do-uong', 'Các loại đồ uống giải khát', 4, FALSE, 'active'),
('Bánh Quy', 'banh-quy', 'Bánh quy giòn tan', 5, FALSE, 'active');

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, sku, price, sale_price, stock_quantity, category_id, is_featured, status) VALUES
('Bánh Tiramisu', 'banh-tiramisu', 'Bánh Tiramisu Ý truyền thống với hương vị cà phê đậm đà', 'Bánh Tiramisu Ý truyền thống', 'CAKE001', 250000, 220000, 20, 1, TRUE, 'active'),
('Bánh Red Velvet', 'banh-red-velvet', 'Bánh Red Velvet mềm mịn với lớp kem cheese thơm ngon', 'Bánh Red Velvet mềm mịn', 'CAKE002', 280000, NULL, 15, 1, TRUE, 'active'),
('Bánh Mì Việt Nam', 'banh-mi-viet-nam', 'Bánh mì Việt Nam truyền thống với nhân thịt nguội', 'Bánh mì Việt Nam truyền thống', 'BREAD001', 25000, NULL, 50, 2, FALSE, 'active'),
('Bánh Kem Sinh Nhật', 'banh-kem-sinh-nhat', 'Bánh kem sinh nhật tùy chỉnh theo yêu cầu', 'Bánh kem sinh nhật tùy chỉnh', 'BIRTHDAY001', 350000, 320000, 10, 3, TRUE, 'active'),
('Cà Phê Đen', 'ca-phe-den', 'Cà phê đen nguyên chất hương vị đậm đà', 'Cà phê đen nguyên chất', 'DRINK001', 20000, NULL, 100, 4, FALSE, 'active');

-- Insert sample customers (Password: customer123)
INSERT INTO customers (email, password, full_name, phone, address, status) VALUES
('customer1@gmail.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Nguyễn Văn A', '0987654321', '123 Đường ABC, Quận 1, TP.HCM', 'active'),
('customer2@gmail.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Trần Thị B', '0987654322', '456 Đường DEF, Quận 2, TP.HCM', 'active'),
('customer3@gmail.com', '$2b$10$evrjT7SiPAtFTqnAbfIfPulh/YH86Bog8.wwHWGY9e6J.YWEAtEsW', 'Lê Văn C', '0987654323', '789 Đường GHI, Quận 3, TP.HCM', 'active');

-- Insert website settings
INSERT INTO website_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Tiệm Bánh Ngọt', 'text', 'Tên website', TRUE),
('site_description', 'Tiệm bánh ngọt chất lượng cao', 'text', 'Mô tả website', TRUE),
('contact_email', 'contact@tiembanh.com', 'text', 'Email liên hệ', TRUE),
('contact_phone', '0123456789', 'text', 'Số điện thoại liên hệ', TRUE),
('contact_address', '123 Đường ABC, Quận 1, TP.HCM', 'text', 'Địa chỉ liên hệ', TRUE),
('business_hours', '{"monday": "8:00-22:00", "tuesday": "8:00-22:00", "wednesday": "8:00-22:00", "thursday": "8:00-22:00", "friday": "8:00-22:00", "saturday": "8:00-22:00", "sunday": "8:00-20:00"}', 'json', 'Giờ hoạt động', TRUE),
('delivery_fee', '20000', 'number', 'Phí giao hàng', TRUE),
('free_delivery_threshold', '200000', 'number', 'Miễn phí giao hàng từ', TRUE),
('tax_rate', '10', 'number', 'Thuế VAT (%)', FALSE),
('currency', 'VND', 'text', 'Đơn vị tiền tệ', TRUE);

-- Insert sample coupons
INSERT INTO coupons (code, name, description, type, value, minimum_amount, usage_limit, valid_from, valid_until, status) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10.00, 100000, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active'),
('FREESHIP', 'Miễn phí giao hàng', 'Miễn phí giao hàng cho đơn từ 150k', 'fixed_amount', 20000, 150000, 200, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active');

-- Create views for reporting
CREATE OR REPLACE VIEW order_summary AS
SELECT
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

CREATE OR REPLACE VIEW product_performance AS
SELECT
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    p.view_count,
    p.rating_average,
    p.rating_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
GROUP BY p.id, p.name, p.price, p.stock_quantity, p.view_count, p.rating_average, p.rating_count
ORDER BY total_sold DESC;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update product rating when review is added/updated
DELIMITER //
CREATE TRIGGER update_product_rating_after_review_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET
        rating_average = (
            SELECT AVG(rating)
            FROM product_reviews
            WHERE product_id = NEW.product_id AND status = 'approved'
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = NEW.product_id AND status = 'approved'
        )
    WHERE id = NEW.product_id;
END//

-- Update stock quantity when order item is created
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO inventory_logs (product_id, type, quantity, previous_stock, new_stock, reason, reference_type, reference_id)
    SELECT
        NEW.product_id,
        'out',
        NEW.quantity,
        stock_quantity + NEW.quantity,
        stock_quantity,
        'Order sale',
        'order',
        NEW.order_id
    FROM products WHERE id = NEW.product_id;
END//

DELIMITER ;

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Composite indexes for common queries
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_products_featured_status ON products(is_featured, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- Full-text search indexes
ALTER TABLE products ADD FULLTEXT(name, description, short_description);
ALTER TABLE customers ADD FULLTEXT(full_name, email);

COMMIT;
