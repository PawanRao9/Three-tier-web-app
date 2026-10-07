const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

/**
 * User Repository
 * 
 * Contains methods for direct database operations on the User model.
 * The repository layer isolates database logic from business logic,
 * making it easier to test and swap storage implementations.
 * 
 * All methods return:
 *   - Data on success
 *   - Throw ApiError on failure (caught by service layer)
 */
const userRepository = {
  /**
   * Create a new user in the database.
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} The created user document (without password)
   */
  async create(userData) {
    try {
      const user = await User.create(userData);
      // Remove password from response before returning
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    } catch (error) {
      // Handle duplicate email (MongoDB E11000 error)
      if (error.code === 11000) {
        throw new ApiError(409, 'User with this email already exists');
      }
      throw new ApiError(500, 'Error creating user', error.message);
    }
  },

  /**
   * Find a single user by their MongoDB ID.
   * Excludes password field from results.
   * @param {string} userId - MongoDB ObjectId as string
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findById(userId) {
    try {
      return await User.findById(userId).select('-password');
    } catch (error) {
      throw new ApiError(500, 'Error finding user', error.message);
    }
  },

  /**
   * Find a user by email (including password field).
   * Used during authentication/verification.
   * @param {string} email - User email address
   * @returns {Promise<Object|null>} User document with password or null
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new ApiError(500, 'Error finding user by email', error.message);
    }
  },

  /**
   * Find all users with pagination support.
   * @param {number} skip - Number of documents to skip
   * @param {number} limit - Maximum number of documents to return
   * @returns {Promise<Array>} Array of user documents (passwords excluded)
   */
  async findAll(skip = 0, limit = 10) {
    try {
      return await User.find().select('-password').skip(skip).limit(limit);
    } catch (error) {
      throw new ApiError(500, 'Error fetching users', error.message);
    }
  },

  /**
   * Count total number of users in the database.
   * @returns {Promise<number>} Total user count
   */
  async count() {
    try {
      return await User.countDocuments();
    } catch (error) {
      throw new ApiError(500, 'Error counting users', error.message);
    }
  },

  /**
   * Update a user by ID with the provided data.
   * @param {string} userId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user document
   */
  async updateById(userId, updateData) {
    try {
      // Remove password from update if present (should be handled separately)
      delete updateData.password;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Apply schema validation to update
      }).select('-password');

      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating user', error.message);
    }
  },

  /**
   * Delete a user by ID.
   * @param {string} userId - MongoDB ObjectId
   * @returns {Promise<Object>} The deleted user document
   */
  async deleteById(userId) {
    try {
      const user = await User.findByIdAndDelete(userId).select('-password');
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting user', error.message);
    }
  },
};

module.exports = userRepository;
