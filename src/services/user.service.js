const userRepository = require('../repository/user.repository');
const { generateToken } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

/**
 * User Service
 * 
 * Contains the business logic for user-related operations.
 * The service layer:
 *   - Receives input from controllers
 *   - Applies business rules and validation
 *   - Calls the repository for database operations
 *   - Returns formatted responses
 * 
 * Controllers should NOT contain business logic — they delegate to services.
 */
const userService = {
  /**
   * Register a new user.
   * Business rules:
   *   - Email must be unique (validated by repository/unique index)
   *   - Password is hashed automatically by the User model pre-save hook
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} { user, token }
   */
  async registerUser(userData) {
    try {
      // Delegate creation to repository
      const user = await userRepository.create(userData);

      // Generate JWT token for the newly registered user
      const token = generateToken(user._id);

      return { user, token };
    } catch (error) {
      // Re-throw ApiError as-is; wrap unexpected errors
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Registration failed', error.message);
    }
  },

  /**
   * Authenticate a user (login).
   * Business rules:
   *   - User must exist
   *   - Password must match
   *   - Return JWT token on success
   * @param {string} email - User email
   * @param {string} password - Raw password to verify
   * @returns {Promise<Object>} { user, token }
   */
  async loginUser(email, password) {
    try {
      // Find user including password for comparison (select: false means we explicitly include it)
      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Compare entered password with stored hashed password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Remove password from response object
      const userObj = user.toObject();
      delete userObj.password;

      // Generate JWT token
      const token = generateToken(user._id);

      return { user: userObj, token };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Login failed', error.message);
    }
  },

  /**
   * Get user profile by ID.
   * @param {string} userId - MongoDB ObjectId
   * @returns {Promise<Object>} User profile (password excluded)
   */
  async getUserProfile(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching profile', error.message);
    }
  },

  /**
   * Update user profile.
   * Business rules:
   *   - Only provided fields are updated (partial update)
   *   - Email changes should still be unique (enforced by model index)
   * @param {string} userId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user document
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields that shouldn't be updated via this method
      delete updateData.password;
      delete updateData.role;

      if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, 'No valid fields provided for update');
      }

      const user = await userRepository.updateById(userId, updateData);
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating profile', error.message);
    }
  },

  /**
   * Delete a user account.
   * @param {string} userId - MongoDB ObjectId
   * @returns {Promise<Object>} Deleted user document
   */
  async deleteUser(userId) {
    try {
      return await userRepository.deleteById(userId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting user', error.message);
    }
  },

  /**
   * Get all users (admin) with pagination.
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} { users, totalUsers, totalPages, currentPage }
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Run count and find in parallel for efficiency
      const [users, totalUsers] = await Promise.all([
        userRepository.findAll(skip, limit),
        userRepository.count(),
      ]);

      return {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching users', error.message);
    }
  },
};

module.exports = userService;
