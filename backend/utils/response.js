// utils/response.js

/**
 * Standard API response format
 */
class ApiResponse {
  constructor(success, message, data = null, meta = null) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Success response helper
 */
const successResponse = (res, message, data = null, meta = null, statusCode = 200) => {
  return res.status(statusCode).json(new ApiResponse(true, message, data, meta));
};

/**
 * Error response helper
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = new ApiResponse(false, message);
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Paginated response helper
 */
const paginatedResponse = (res, message, data, pagination) => {
  const meta = {
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    }
  };
  
  return successResponse(res, message, data, meta);
};

/**
 * Created response helper
 */
const createdResponse = (res, message, data = null) => {
  return successResponse(res, message, data, null, 201);
};

/**
 * No content response helper
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Not found response helper
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Unauthorized response helper
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response helper
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Bad request response helper
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Conflict response helper
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

/**
 * Validation error response helper
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 422, errors);
};

/**
 * Internal server error response helper
 */
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

module.exports = {
  ApiResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  conflictResponse,
  validationErrorResponse,
  serverErrorResponse,
};
