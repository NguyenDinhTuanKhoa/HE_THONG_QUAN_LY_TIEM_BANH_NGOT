// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  username: body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  role: body('role')
    .isIn(['admin', 'manager', 'staff'])
    .withMessage('Role must be admin, manager, or staff'),
  
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  name: body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .trim(),
  
  description: body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  quantity: body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  phone: body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Phone number must be 10-11 digits'),
  
  status: body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'banned'])
    .withMessage('Status must be active, inactive, pending, or banned'),
};

// Validation sets for different endpoints
const validationSets = {
  // Auth validations
  login: [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  register: [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    handleValidationErrors
  ],

  // Account validations
  createAccount: [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    commonValidations.role,
    handleValidationErrors
  ],

  updateAccount: [
    commonValidations.id,
    commonValidations.username.optional(),
    commonValidations.email.optional(),
    commonValidations.role.optional(),
    commonValidations.status.optional(),
    handleValidationErrors
  ],

  // Product validations
  createProduct: [
    commonValidations.name,
    commonValidations.description,
    commonValidations.price,
    commonValidations.quantity,
    body('category_id')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    handleValidationErrors
  ],

  updateProduct: [
    commonValidations.id,
    commonValidations.name.optional(),
    commonValidations.description,
    commonValidations.price.optional(),
    commonValidations.quantity.optional(),
    body('category_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    handleValidationErrors
  ],

  // Category validations
  createCategory: [
    commonValidations.name,
    commonValidations.description,
    handleValidationErrors
  ],

  updateCategory: [
    commonValidations.id,
    commonValidations.name.optional(),
    commonValidations.description,
    handleValidationErrors
  ],

  // Order validations
  createOrder: [
    body('customer_id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('total_amount')
      .isFloat({ min: 0 })
      .withMessage('Total amount must be a positive number'),
    handleValidationErrors
  ],

  updateOrder: [
    commonValidations.id,
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    handleValidationErrors
  ],

  // Customer validations
  createCustomer: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.phone,
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters'),
    handleValidationErrors
  ],

  updateCustomer: [
    commonValidations.id,
    commonValidations.name.optional(),
    commonValidations.email.optional(),
    commonValidations.phone,
    body('address')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters'),
    handleValidationErrors
  ],

  // Query validations
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort must be asc or desc'),
    handleValidationErrors
  ],

  // Generic ID validation
  validateId: [
    commonValidations.id,
    handleValidationErrors
  ],
};

module.exports = {
  ...validationSets,
  handleValidationErrors,
  commonValidations,
};
