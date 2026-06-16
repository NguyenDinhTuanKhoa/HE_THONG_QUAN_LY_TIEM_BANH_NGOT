const jwt = require('jsonwebtoken');

// Extract token from various sources
const extractToken = (req) => {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter (for special cases)
  if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
};

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    let message = 'Invalid token';
    let code = 'TOKEN_INVALID';

    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired';
      code = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
      code = 'TOKEN_MALFORMED';
    }

    return res.status(401).json({
      success: false,
      message,
      code
    });
  }
};

// Optional token verification (doesn't fail if no token)
exports.optionalToken = (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore token errors for optional verification
      req.user = null;
    }
  }

  next();
};

// Role-based access control
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Ensure roles is an array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Admin only access
exports.adminOnly = exports.checkRole(['admin']);

// Admin and Manager access
exports.adminOrManager = exports.checkRole(['admin', 'manager']);

// Admin and Staff access
exports.adminOrStaff = exports.checkRole(['admin', 'staff']);

// All roles access (but requires authentication)
exports.authenticated = exports.checkRole(['admin', 'manager', 'staff']);

// Customer token verification
exports.verifyCustomerToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Customer access token is required',
      code: 'CUSTOMER_TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is a customer token
    if (decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer token',
        code: 'INVALID_CUSTOMER_TOKEN'
      });
    }

    req.customer = decoded;
    next();
  } catch (err) {
    let message = 'Invalid customer token';
    let code = 'CUSTOMER_TOKEN_INVALID';

    if (err.name === 'TokenExpiredError') {
      message = 'Customer token has expired';
      code = 'CUSTOMER_TOKEN_EXPIRED';
    }

    return res.status(401).json({
      success: false,
      message,
      code
    });
  }
};