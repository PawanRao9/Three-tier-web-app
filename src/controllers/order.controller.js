const orderService = require('../services/order.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Order Controller
 * 
 * Handles HTTP requests for order operations.
 * Interacts with the order service to apply business rules and manage orders.
 */
const orderController = {
  /**
   * @route   POST /api/orders
   * @desc    Create a new order
   * @access  Private
   */
  async createOrder(req, res, next) {
    try {
      const { products, shippingAddress, status } = req.body;
      const userId = req.user._id;

      const order = await orderService.createOrder(userId, {
        products,
        shippingAddress,
        status,
      });

      logger.info(`Order created: ${order._id} for user: ${userId}`);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/orders
   * @desc    Get current user's orders
   * @access  Private
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await orderService.getUserOrders(userId, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/orders/:id
   * @desc    Get a single order by ID
   * @access  Private
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const order = await orderService.getOrderById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/admin/orders
   * @desc    Get all orders (Admin only)
   * @access  Private/Admin
   */
  async getAllOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { status } = req.query;

      const result = await orderService.getAllOrders(page, limit, status);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   PUT /api/admin/orders/:id/status
   * @desc    Update order status (Admin only)
   * @access  Private/Admin
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(id, status);

      logger.info(`Order status updated: ${id} to "${status}"`);
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   DELETE /api/orders/:id
   * @desc    Cancel an order
   * @access  Private
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const cancelledOrder = await orderService.cancelOrder(id, userId, userRole);

      logger.info(`Order cancelled: ${id} by user: ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: cancelledOrder,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;
