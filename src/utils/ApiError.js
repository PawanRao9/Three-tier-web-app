/**
 * Custom API Error Class
 * Used to pass structured error information through middleware and controllers.
 * Extends the built-in Error class and adds HTTP status code, optional details/data.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 403, 404, 500)
   * @param {string} message - Human-readable error message
   * @param {Array|Object} [details=[]] - Optional additional error details (e.g., validation errors)
   */
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
    this.details = details;
    Error.captureStackTrace(this, this.constructor); // Capture stack trace for debugging
  }
}

module.exports = ApiError;
