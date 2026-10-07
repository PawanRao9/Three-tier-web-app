const userService = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * User Controller
 * 
 * Handles HTTP requests related to users.
 * Responsibilities:
 *   - Extract data from req.body, req.params, req.query
 *   - Pass data to the service layer
 *   - Send back JSON responses with appropriate status codes
 *   - Log important events
 * 
 * Controllers should be thin — keep business logic in services.
 */
const userController = {
  /**
   * @route   POST /api/users/register
   * @desc    Register a new user
   * @access  Public
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const result = await userService.registerUser({ name, email, password, role });

      logger.info(`New user registered: ${email}`);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   POST /api/users/login
   * @desc    Login user & get JWT token
   * @access  Public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ApiError(400, 'Email and password are required'));
      }

      const result = await userService.loginUser(email, password);

      logger.info(`User logged in: ${email}`);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/users/profile
   * @desc    Get current user's profile
   * @access  Private (requires authentication)
   */
  async getProfile(req, res, next) {
    try {
      // req.user is set by the protect middleware in auth.middleware
      const user = await userService.getUserProfile(req.user._id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   PUT /api/users/profile
   * @desc    Update current user's profile
   * @access  Private
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const { name, email } = req.body;

      // Prevent updating password through this endpoint
      const updateData = { name, email };

      const updatedUser = await userService.updateUserProfile(userId, updateData);

      logger.info(`User profile updated: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/users
   * @desc    Get all users (Admin only)
   * @access  Private/Admin
   */
  async getAllUsers(req, res, next) {
    try {
      // Extract pagination params from query string (defaults: page=1, limit=10)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   DELETE /api/users/:id
   * @desc    Delete a user (Admin only)
   * @access  Private/Admin
   */
  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;

      await userService.deleteUser(userId);

      logger.info(`User deleted: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
