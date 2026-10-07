const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Global Error Handling Middleware
 * 
 * Express calls this middleware whenever next(err) is called or a runtime error occurs.
 * It catches both:
 *   1. Operational errors (custom ApiError instances - expected, client-side issues)
 *   2. Programming/runtime errors (unexpected server-side errors)
 * 
 * Always defined as the LAST middleware in the chain: (err, req, res, next) => {}
 */
const errorMiddleware = (err, req, res, next) => {
  // Default status code and message for unknown errors
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || [];

  // --- Log the error ---
  if (statusCode >= 500) {
    // Log full stack trace for 5xx errors (server-side bugs)
    logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      details,
    });
  } else if (statusCode >= 400) {
    // Log warning for 4xx errors (client mistakes)
    logger.warn(`[${req.method}] ${req.originalUrl} - ${message}`);
  }

  // --- Send Response ---
  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'Error' : 'Fail',
    message,
    ...(details.length > 0 && { details }), // Only include details if present
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Stack trace in dev only
  });
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes.
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found on this server`);
  next(error);
};

module.exports = { errorMiddleware, notFound };
