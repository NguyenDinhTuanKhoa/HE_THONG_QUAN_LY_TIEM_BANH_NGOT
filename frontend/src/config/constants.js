// config/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Quản Lý Tiệm Bánh',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  MAX_FILES: 10,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Cache Configuration
export const CACHE_CONFIG = {
  DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION) || 300000, // 5 minutes
  KEYS: {
    USER: 'user',
    CUSTOMER: 'customer',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    SETTINGS: 'settings',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
};

// Delivery Methods
export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
};

// Message Types
export const MESSAGE_TYPES = {
  CONTACT: 'contact',
  COMPLAINT: 'complaint',
  SUGGESTION: 'suggestion',
  ORDER_INQUIRY: 'order_inquiry',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  CUSTOMER: 'customer',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
};

// Routes
export const ROUTES = {
  // Customer Routes
  HOME: '/',
  SHOP: '/shop',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  CONTACT: '/contact',
  CUSTOMER_LOGIN: '/customer/login',

  // Admin Routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REPORTS: '/admin/reports',

  // Legacy Routes
  LEGACY_ACCOUNTS: '/admin/dashboard/accounts',
  LEGACY_PRODUCTS: '/admin/dashboard/products',
  LEGACY_ORDERS: '/admin/dashboard/orders',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  FORBIDDEN: 'Truy cập bị từ chối.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  CREATE_SUCCESS: 'Tạo mới thành công!',
  UPDATE_SUCCESS: 'Cập nhật thành công!',
  DELETE_SUCCESS: 'Xóa thành công!',
  SAVE_SUCCESS: 'Lưu thành công!',
};

export default {
  API_CONFIG,
  APP_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  DELIVERY_METHODS,
  PRODUCT_STATUS,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  STORAGE_KEYS,
  ROUTES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
