const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given user ID.
 * Used after successful login/registration.
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

/**
 * Removes keys with empty/undefined/null values from an object.
 * Useful for building update objects dynamically from query parameters.
 * @param {Object} obj - The object to clean
 * @returns {Object} New object with only non-empty values
 */
exports.removeEmptyValues = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
};
