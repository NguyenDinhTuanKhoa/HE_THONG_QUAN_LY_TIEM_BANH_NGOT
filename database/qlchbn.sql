-- =============================================================
-- HỆ THỐNG QUẢN LÝ TIỆM BÁNH NGỌT - DATABASE
-- =============================================================
-- Import: phpMyAdmin → Import → chọn file này → Go
-- (File tự tạo database 'qlchbn', không cần tạo trước)
--
-- TÀI KHOẢN MẶC ĐỊNH SAU KHI IMPORT:
-- ┌─────────────────────────────────────────────────────────┐
-- │  NHÂN VIÊN / ADMIN  (đăng nhập tại /login)             │
-- │  Username: admin       Password: nhanvien123  (admin)   │
-- │  Username: quanly      Password: nhanvien123  (manager) │
-- │  Username: nhanvien1   Password: nhanvien123  (staff)   │
-- │  Username: nhanvien2   Password: nhanvien123  (staff)   │
-- │  Username: nhanvien3   Password: nhanvien123  (staff)   │
-- ├─────────────────────────────────────────────────────────┤
-- │  KHÁCH HÀNG  (đăng nhập tại /customer/login)           │
-- │  Email: customer1@gmail.com  Password: 123456           │
-- │  Email: customer2@gmail.com  Password: 123456           │
-- │  Email: customer3@gmail.com  Password: 123456           │
-- └─────────────────────────────────────────────────────────┘
-- =============================================================

CREATE DATABASE IF NOT EXISTS qlchbn
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE qlchbn;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- XÓA BẢNG CŨ (theo thứ tự phụ thuộc FK)
-- =============================================================
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS inventory_logs;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS website_settings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS accounts;

-- =============================================================
-- 1. ACCOUNTS — Nhân viên & quản trị
-- =============================================================
CREATE TABLE accounts (
    id            INT           PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)   UNIQUE NOT NULL,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password      VARCHAR(255)  NOT NULL,          -- bcrypt hash
    full_name     VARCHAR(255)  NOT NULL,
    role          ENUM('admin','manager','staff') NOT NULL,
    phone         VARCHAR(15),
    avatar        VARCHAR(500),
    last_login    DATETIME,
    login_attempts INT          DEFAULT 0,
    locked_until  DATETIME,
    status        ENUM('active','inactive','banned') DEFAULT 'active',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_role   (role),
    INDEX idx_status (status)
);
ALTER TABLE accounts AUTO_INCREMENT = 1000;

-- =============================================================
-- 2. CUSTOMERS — Khách hàng mua hàng
-- =============================================================
CREATE TABLE customers (
    id             INT          PRIMARY KEY AUTO_INCREMENT,
    email          VARCHAR(255) UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,           -- bcrypt hash
    full_name      VARCHAR(255) NOT NULL,
    phone          VARCHAR(15),
    address        TEXT,
    date_of_birth  DATE,
    gender         ENUM('male','female','other'),
    avatar         VARCHAR(500),
    email_verified BOOLEAN      DEFAULT FALSE,
    last_login     DATETIME,
    login_attempts INT          DEFAULT 0,
    locked_until   DATETIME,
    status         ENUM('active','inactive','banned') DEFAULT 'active',
    created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_phone      (phone),
    INDEX idx_status     (status),
    INDEX idx_full_name  (full_name),
    INDEX idx_created_at (created_at)
);
ALTER TABLE customers AUTO_INCREMENT = 10000;

-- =============================================================
-- 3. CATEGORIES — Danh mục sản phẩm
-- =============================================================
CREATE TABLE categories (
    id          INT          PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image       VARCHAR(500),
    sort_order  INT          DEFAULT 0,
    is_featured BOOLEAN      DEFAULT FALSE,
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_slug       (slug),
    INDEX idx_status     (status),
    INDEX idx_sort_order (sort_order)
);

-- =============================================================
-- 4. PRODUCTS — Sản phẩm
-- =============================================================
CREATE TABLE products (
    id                   INT            PRIMARY KEY AUTO_INCREMENT,
    name                 VARCHAR(255)   NOT NULL,
    slug                 VARCHAR(255)   UNIQUE NOT NULL,
    description          TEXT,
    short_description    VARCHAR(500),
    sku                  VARCHAR(100)   UNIQUE,
    price                DECIMAL(10,2)  NOT NULL,
    sale_price           DECIMAL(10,2),
    cost_price           DECIMAL(10,2),
    stock_quantity       INT            DEFAULT 0,
    min_stock_level      INT            DEFAULT 0,
    category_id          INT            NOT NULL,
    featured_image       VARCHAR(500),
    gallery              TEXT,           -- JSON array ảnh phụ
    ingredients          TEXT,
    nutritional_info     TEXT,           -- JSON
    allergen_info        TEXT,
    preparation_time     INT,            -- phút
    shelf_life           INT,            -- ngày
    storage_instructions TEXT,
    is_featured          BOOLEAN        DEFAULT FALSE,
    is_bestseller        BOOLEAN        DEFAULT FALSE,
    view_count           INT            DEFAULT 0,
    rating_average       DECIMAL(3,2)   DEFAULT 0.00,
    rating_count         INT            DEFAULT 0,
    status               ENUM('active','inactive','out_of_stock','discontinued') DEFAULT 'active',
    created_at           DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category_id   (category_id),
    INDEX idx_price         (price),
    INDEX idx_status        (status),
    INDEX idx_is_featured   (is_featured),
    INDEX idx_is_bestseller (is_bestseller),
    INDEX idx_created_at    (created_at),

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- =============================================================
-- 5. ORDERS — Đơn hàng
-- =============================================================
CREATE TABLE orders (
    id               INT           PRIMARY KEY AUTO_INCREMENT,
    order_number     VARCHAR(50)   UNIQUE NOT NULL,
    customer_id      INT           NOT NULL,
    customer_name    VARCHAR(255)  NOT NULL,
    customer_email   VARCHAR(255)  NOT NULL,
    customer_phone   VARCHAR(15)   NOT NULL,
    customer_address TEXT          NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL,
    tax_amount       DECIMAL(10,2) DEFAULT 0.00,
    discount_amount  DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount  DECIMAL(10,2) DEFAULT 0.00,
    total_amount     DECIMAL(10,2) NOT NULL,
    payment_method   ENUM('cash','card','bank_transfer','e_wallet') NOT NULL,
    payment_status   ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
    delivery_method  ENUM('pickup','delivery') NOT NULL,
    delivery_date    DATE,
    delivery_time    VARCHAR(20),
    delivery_notes   TEXT,
    coupon_code      VARCHAR(50),
    notes            TEXT,
    status           ENUM('pending','confirmed','preparing','ready','delivering','delivered','cancelled') DEFAULT 'pending',
    created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_customer_id    (customer_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status         (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at     (created_at),
    INDEX idx_delivery_date  (delivery_date),

    -- Composite indexes hay dùng
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_date_status     (created_at, status),

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);
ALTER TABLE orders AUTO_INCREMENT = 100000;

-- =============================================================
-- 6. ORDER_ITEMS — Chi tiết đơn hàng
-- =============================================================
CREATE TABLE order_items (
    id              INT           PRIMARY KEY AUTO_INCREMENT,
    order_id        INT           NOT NULL,
    product_id      INT           NOT NULL,
    product_name    VARCHAR(255)  NOT NULL,   -- snapshot tại thời điểm đặt
    product_sku     VARCHAR(100),
    quantity        INT           NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(10,2) NOT NULL,
    product_options TEXT,                      -- JSON tuỳ chọn (size, flavour...)
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id   (order_id),
    INDEX idx_product_id (product_id),

    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)  ON DELETE RESTRICT
);

-- =============================================================
-- 7. COUPONS — Mã giảm giá
-- =============================================================
CREATE TABLE coupons (
    id                      INT           PRIMARY KEY AUTO_INCREMENT,
    code                    VARCHAR(50)   UNIQUE NOT NULL,
    name                    VARCHAR(255)  NOT NULL,
    description             TEXT,
    type                    ENUM('percentage','fixed_amount') NOT NULL,
    value                   DECIMAL(10,2) NOT NULL,
    minimum_amount          DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount        DECIMAL(10,2),       -- NULL = không giới hạn
    usage_limit             INT,                 -- NULL = không giới hạn
    used_count              INT           DEFAULT 0,
    usage_limit_per_customer INT          DEFAULT 1,
    valid_from              DATETIME      NOT NULL,
    valid_until             DATETIME      NOT NULL,
    applicable_products     TEXT,                -- JSON array product IDs
    applicable_categories   TEXT,                -- JSON array category IDs
    status                  ENUM('active','inactive','expired') DEFAULT 'active',
    created_at              DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_code        (code),
    INDEX idx_status      (status),
    INDEX idx_valid_from  (valid_from),
    INDEX idx_valid_until (valid_until)
);

-- =============================================================
-- 8. COUPON_USAGE — Lịch sử dùng mã giảm giá
-- =============================================================
CREATE TABLE coupon_usage (
    id              INT           PRIMARY KEY AUTO_INCREMENT,
    coupon_id       INT           NOT NULL,
    customer_id     INT           NOT NULL,
    order_id        INT           NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at         DATETIME      DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_coupon_order (coupon_id, order_id),

    INDEX idx_coupon_id   (coupon_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_id    (order_id),

    FOREIGN KEY (coupon_id)   REFERENCES coupons(id)    ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id)  ON DELETE CASCADE,
    FOREIGN KEY (order_id)    REFERENCES orders(id)     ON DELETE CASCADE
);

-- =============================================================
-- 9. MESSAGES — Tin nhắn liên hệ từ khách hàng
-- =============================================================
CREATE TABLE messages (
    id              INT          PRIMARY KEY AUTO_INCREMENT,
    customer_id     INT,                         -- NULL nếu chưa đăng nhập
    customer_name   VARCHAR(255) NOT NULL,
    customer_email  VARCHAR(255) NOT NULL,
    customer_phone  VARCHAR(15),
    subject         VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    type            ENUM('contact','complaint','suggestion','order_inquiry') DEFAULT 'contact',
    order_id        INT,
    replied_by      INT,                         -- account ID trả lời
    reply_message   TEXT,
    replied_at      DATETIME,
    status          ENUM('new','read','replied','closed') DEFAULT 'new',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_customer_email (customer_email),
    INDEX idx_status         (status),
    INDEX idx_type           (type),
    INDEX idx_created_at     (created_at),

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id)    REFERENCES orders(id)    ON DELETE SET NULL,
    FOREIGN KEY (replied_by)  REFERENCES accounts(id)  ON DELETE SET NULL
);

-- =============================================================
-- 10. WEBSITE_SETTINGS — Cài đặt website
-- =============================================================
CREATE TABLE website_settings (
    id            INT          PRIMARY KEY AUTO_INCREMENT,
    setting_key   VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type  ENUM('text','number','boolean','json','image') DEFAULT 'text',
    description   TEXT,
    is_public     BOOLEAN      DEFAULT FALSE,     -- TRUE = khách hàng đọc được
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_is_public (is_public)
);

-- =============================================================
-- 11. PRODUCT_REVIEWS — Đánh giá sản phẩm
-- =============================================================
CREATE TABLE product_reviews (
    id                    INT  PRIMARY KEY AUTO_INCREMENT,
    product_id            INT  NOT NULL,
    customer_id           INT  NOT NULL,
    order_id              INT,
    rating                INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title                 VARCHAR(255),
    review_text           TEXT,
    is_verified_purchase  BOOLEAN  DEFAULT FALSE,
    helpful_count         INT      DEFAULT 0,
    status                ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_customer_product_order (customer_id, product_id, order_id),

    INDEX idx_product_id (product_id),
    INDEX idx_rating     (rating),
    INDEX idx_status     (status),

    FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id)    REFERENCES orders(id)    ON DELETE SET NULL
);

-- =============================================================
-- 12. INVENTORY_LOGS — Lịch sử nhập/xuất kho
-- =============================================================
CREATE TABLE inventory_logs (
    id             INT          PRIMARY KEY AUTO_INCREMENT,
    product_id     INT          NOT NULL,
    type           ENUM('in','out','adjustment') NOT NULL,
    quantity       INT          NOT NULL,
    previous_stock INT          NOT NULL,
    new_stock      INT          NOT NULL,
    reason         VARCHAR(255),
    reference_type ENUM('order','purchase','adjustment','return'),
    reference_id   INT,
    created_by     INT,                          -- account ID thực hiện
    created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_product_id    (product_id),
    INDEX idx_type          (type),
    INDEX idx_created_at    (created_at),

    FOREIGN KEY (product_id) REFERENCES products(id)  ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES accounts(id)  ON DELETE SET NULL
);

-- =============================================================
-- 13. AUDIT_LOGS — Nhật ký thao tác hệ thống
-- =============================================================
CREATE TABLE audit_logs (
    id          INT          PRIMARY KEY AUTO_INCREMENT,
    user_id     INT,
    user_type   ENUM('account','customer') NOT NULL,
    action      VARCHAR(100) NOT NULL,
    table_name  VARCHAR(100) NOT NULL,
    record_id   INT,
    old_values  TEXT,   -- JSON
    new_values  TEXT,   -- JSON
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id    (user_id),
    INDEX idx_action     (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- DỮ LIỆU MẪU
-- =============================================================

-- -------------------------------------------------------------
-- ACCOUNTS  (password: nhanvien123)
-- Hash bcrypt 12 rounds của "nhanvien123"
-- -------------------------------------------------------------
INSERT INTO accounts (username, email, password, full_name, role, phone, status) VALUES
('admin',     'admin@tiembanh.com',     '$2b$12$.bhdPQ1AJtSOoPLs5LqVTedNFJmMnCzj87aQTBT3/3ZpltLHJo.Am', 'Quản Trị Viên',       'admin',   '0123456789', 'active'),
('quanly',    'quanly@tiembanh.com',    '$2b$12$.bhdPQ1AJtSOoPLs5LqVTedNFJmMnCzj87aQTBT3/3ZpltLHJo.Am', 'Quản Lý Cửa Hàng',    'manager', '0123456790', 'active'),
('nhanvien1', 'nhanvien1@tiembanh.com', '$2b$12$.bhdPQ1AJtSOoPLs5LqVTedNFJmMnCzj87aQTBT3/3ZpltLHJo.Am', 'Nhân Viên Bán Hàng 1','staff',   '0123456791', 'active'),
('nhanvien2', 'nhanvien2@tiembanh.com', '$2b$12$.bhdPQ1AJtSOoPLs5LqVTedNFJmMnCzj87aQTBT3/3ZpltLHJo.Am', 'Nhân Viên Bán Hàng 2','staff',   '0123456792', 'active'),
('nhanvien3', 'nhanvien3@tiembanh.com', '$2b$12$.bhdPQ1AJtSOoPLs5LqVTedNFJmMnCzj87aQTBT3/3ZpltLHJo.Am', 'Nhân Viên Bán Hàng 3','staff',   '0123456793', 'active');

-- -------------------------------------------------------------
-- CUSTOMERS  (password: 123456)
-- Hash bcrypt 12 rounds của "123456"
-- -------------------------------------------------------------
INSERT INTO customers (email, password, full_name, phone, address, status) VALUES
('customer1@gmail.com', '$2b$12$qPamdJP814JuuaEfaVYIH.WzQthgIIUDRXEZEndOTy.ETpmiAOV66', 'Nguyễn Văn A', '0987654321', '123 Đường ABC, Quận 1, TP.HCM', 'active'),
('customer2@gmail.com', '$2b$12$qPamdJP814JuuaEfaVYIH.WzQthgIIUDRXEZEndOTy.ETpmiAOV66', 'Trần Thị B',   '0987654322', '456 Đường DEF, Quận 2, TP.HCM', 'active'),
('customer3@gmail.com', '$2b$12$qPamdJP814JuuaEfaVYIH.WzQthgIIUDRXEZEndOTy.ETpmiAOV66', 'Lê Văn C',     '0987654323', '789 Đường GHI, Quận 3, TP.HCM', 'active');

-- -------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------
INSERT INTO categories (name, slug, description, sort_order, is_featured, status) VALUES
('Bánh Ngọt',  'banh-ngot',  'Các loại bánh ngọt thơm ngon',        1, TRUE,  'active'),
('Bánh Mì',    'banh-mi',    'Bánh mì tươi ngon hàng ngày',          2, TRUE,  'active'),
('Bánh Kem',   'banh-kem',   'Bánh kem sinh nhật và sự kiện',        3, TRUE,  'active'),
('Đồ Uống',    'do-uong',    'Các loại đồ uống giải khát',           4, FALSE, 'active'),
('Bánh Quy',   'banh-quy',   'Bánh quy giòn tan',                    5, FALSE, 'active');

-- -------------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------------
INSERT INTO products (name, slug, description, short_description, sku, price, sale_price, stock_quantity, category_id, is_featured, is_bestseller, status) VALUES
('Bánh Tiramisu',      'banh-tiramisu',      'Bánh Tiramisu Ý truyền thống với hương vị cà phê đậm đà và lớp mascarpone mịn màng', 'Bánh Tiramisu Ý truyền thống',   'CAKE001',     250000, 220000, 20,  1, TRUE,  TRUE,  'active'),
('Bánh Red Velvet',    'banh-red-velvet',    'Bánh Red Velvet mềm mịn với lớp kem cheese thơm ngon, màu đỏ đặc trưng',             'Bánh Red Velvet mềm mịn',        'CAKE002',     280000, NULL,   15,  1, TRUE,  FALSE, 'active'),
('Bánh Mì Việt Nam',   'banh-mi-viet-nam',   'Bánh mì Việt Nam truyền thống với nhân thịt nguội và rau sống',                       'Bánh mì Việt Nam truyền thống',  'BREAD001',    25000,  NULL,   50,  2, FALSE, TRUE,  'active'),
('Bánh Kem Sinh Nhật', 'banh-kem-sinh-nhat', 'Bánh kem sinh nhật tùy chỉnh theo yêu cầu, nhiều hương vị',                          'Bánh kem sinh nhật tùy chỉnh',   'BIRTHDAY001', 350000, 320000, 10,  3, TRUE,  FALSE, 'active'),
('Cà Phê Đen',         'ca-phe-den',         'Cà phê đen nguyên chất hương vị đậm đà, pha phin truyền thống',                       'Cà phê đen nguyên chất',         'DRINK001',    20000,  NULL,   100, 4, FALSE, FALSE, 'active');

-- -------------------------------------------------------------
-- COUPONS
-- -------------------------------------------------------------
INSERT INTO coupons (code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, valid_from, valid_until, status) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên, tối đa 50.000đ',     'percentage',  10.00, 100000, 50000, 100, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 'active'),
('FREESHIP',  'Miễn phí giao hàng',       'Miễn phí giao hàng cho đơn từ 150.000đ',              'fixed_amount', 20000, 150000, NULL,  200, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active'),
('SALE20',    'Giảm 20% cuối tuần',        'Giảm 20% mỗi cuối tuần, tối đa 100.000đ',             'percentage',  20.00, 200000, 100000, 50, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active');

-- -------------------------------------------------------------
-- WEBSITE SETTINGS
-- -------------------------------------------------------------
INSERT INTO website_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name',              'Tiệm Bánh Ngọt',                                                                                         'text',    'Tên website',                    TRUE),
('site_description',       'Tiệm bánh ngọt chất lượng cao - Tươi ngon mỗi ngày',                                                    'text',    'Mô tả website',                  TRUE),
('contact_email',          'contact@tiembanh.com',                                                                                    'text',    'Email liên hệ',                  TRUE),
('contact_phone',          '0123 456 789',                                                                                            'text',    'Số điện thoại liên hệ',          TRUE),
('contact_address',        '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',                                                             'text',    'Địa chỉ cửa hàng',              TRUE),
('business_hours',         '{"mon_fri":"08:00 - 22:00","sat_sun":"08:00 - 20:00"}',                                                  'json',    'Giờ hoạt động',                  TRUE),
('delivery_fee',           '20000',                                                                                                    'number',  'Phí giao hàng cơ bản (VND)',    TRUE),
('free_delivery_threshold','200000',                                                                                                   'number',  'Đơn từ bao nhiêu miễn ship',    TRUE),
('tax_rate',               '0',                                                                                                        'number',  'Thuế VAT (%)',                   FALSE),
('currency',               'VND',                                                                                                      'text',    'Đơn vị tiền tệ',                TRUE),
('facebook_url',           '',                                                                                                         'text',    'Link Facebook',                  TRUE),
('instagram_url',          '',                                                                                                         'text',    'Link Instagram',                 TRUE);

-- =============================================================
-- VIEWS BÁO CÁO
-- =============================================================
CREATE OR REPLACE VIEW order_summary AS
SELECT
    DATE(created_at)                                         AS order_date,
    COUNT(*)                                                  AS total_orders,
    COALESCE(SUM(total_amount), 0)                           AS total_revenue,
    COALESCE(AVG(total_amount), 0)                           AS avg_order_value,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END)         AS completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)         AS cancelled_orders
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

CREATE OR REPLACE VIEW product_performance AS
SELECT
    p.id,
    p.name,
    p.sku,
    p.price,
    p.stock_quantity,
    COALESCE(SUM(oi.quantity), 0)    AS total_sold,
    COALESCE(SUM(oi.total_price), 0) AS total_revenue,
    p.rating_average,
    p.rating_count,
    p.status
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o       ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id
ORDER BY total_sold DESC;

-- =============================================================
-- TRIGGERS
-- =============================================================
DELIMITER //

-- Cập nhật rating sản phẩm khi có review được duyệt
CREATE TRIGGER trg_update_rating_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE products
        SET rating_average = (SELECT AVG(rating)  FROM product_reviews WHERE product_id = NEW.product_id AND status = 'approved'),
            rating_count   = (SELECT COUNT(*)      FROM product_reviews WHERE product_id = NEW.product_id AND status = 'approved')
        WHERE id = NEW.product_id;
    END IF;
END//

CREATE TRIGGER trg_update_rating_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET rating_average = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = NEW.product_id AND status = 'approved'),
        rating_count   = (SELECT COUNT(*)                  FROM product_reviews WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
END//

-- Ghi inventory log khi order_item được tạo
CREATE TRIGGER trg_stock_out_on_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_prev_stock INT DEFAULT 0;
    SELECT stock_quantity INTO v_prev_stock FROM products WHERE id = NEW.product_id;

    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id;

    INSERT INTO inventory_logs (product_id, type, quantity, previous_stock, new_stock, reason, reference_type, reference_id)
    VALUES (NEW.product_id, 'out', NEW.quantity, v_prev_stock, GREATEST(0, v_prev_stock - NEW.quantity), 'Bán hàng', 'order', NEW.order_id);
END//

DELIMITER ;

-- =============================================================
-- FULL-TEXT SEARCH
-- =============================================================
ALTER TABLE products  ADD FULLTEXT idx_ft_products  (name, description, short_description);
ALTER TABLE customers ADD FULLTEXT idx_ft_customers (full_name, email);

COMMIT;
