const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request parameters (params, query, body) using express-validator.
 * Assumes validations have already been run on the request (via validation chains in route definitions).
 * If validation fails, responds with 400 Bad Request.
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));

  return next(new ApiError(400, 'Validation Failed', formattedErrors));
};

// Validation rules for user registration
exports.validateUserRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required').bail().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either admin or user'),
];

// Validation rules for login
exports.registerLoginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.validateProductCreation = [
  body('name').trim().notEmpty().withMessage('Product name is required').bail().isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

exports.validateOrderCreation = [
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.product').isMongoId().withMessage('Invalid product ID format'),
  body('products.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
  body('status').optional().isIn(['pending', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
];
