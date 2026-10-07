const Order = require('../models/Order.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Order Repository
 * 
 * Handles all direct database operations for the Order model.
 * Includes logic to populate product details when retrieving orders.
 */
const orderRepository = {
  /**
   * Create a new order.
   * Note: totalAmount is calculated automatically by the Order schema pre-save hook.
   * @param {Object} orderData - { user, products: [{ product, quantity }], status, shippingAddress }
   * @returns {Promise<Object>} Created order with populated product details
   */
  async create(orderData) {
    try {
      const order = await Order.create(orderData);
      // Populate product details for the response
      return await this.populateOrderDetails(order);
    } catch (error) {
      throw new ApiError(500, 'Error creating order', error.message);
    }
  },

  /**
   * Helper: Populate product details inside order for clean responses.
   * @param {Object} order - Order document
   * @returns {Promise<Object>} Order with populated product info
   */
  async populateOrderDetails(order) {
    await order.populate({
      path: 'products.product',
      select: 'name price category',
    });
    await order.populate({
      path: 'user',
      select: 'name email',
    });
    // Re-fetch to get properly populated document
    return await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('products.product', 'name price category');
  },

  /**
   * Find orders for a specific user with pagination.
   * @param {string} userId - MongoDB ObjectId of the user
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} { orders, total, totalPages, currentPage }
   */
  async findByUserId(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find({ user: userId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('products.product', 'name price'),
        Order.countDocuments({ user: userId }),
      ]);

      return {
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching user orders', error.message);
    }
  },

  /**
   * Find all orders (admin view) with pagination.
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string} [status] - Optional status filter
   * @returns {Promise<Object>} { orders, total, totalPages, currentPage }
   */
  async findAll(page = 1, limit = 10, status = null) {
    try {
      const skip = (page - 1) * limit;
      const query = status ? { status } : {};

      const [orders, total] = await Promise.all([
        Order.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('user', 'name email')
          .populate('products.product', 'name price'),
        Order.countDocuments(query),
      ]);

      return {
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching all orders', error.message);
    }
  },

  /**
   * Find a single order by ID (with populated details).
   * @param {string} orderId - MongoDB ObjectId
   * @returns {Promise<Object|null>} Order document with populated fields or null
   */
  async findById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('products.product', 'name price category');

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }
      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid order ID format');
      }
      throw new ApiError(500, 'Error finding order', error.message);
    }
  },

  /**
   * Update an order's status.
   * @param {string} orderId - MongoDB ObjectId
   * @param {string} status - New status value
   * @returns {Promise<Object>} Updated order document
   */
  async updateStatus(orderId, status) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      ).populate('user', 'name email').populate('products.product', 'name price');

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }
      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid order ID format');
      }
      throw new ApiError(500, 'Error updating order status', error.message);
    }
  },

  /**
   * Cancel (delete) an order by ID.
   * @param {string} orderId - MongoDB ObjectId
   * @returns {Promise<Object|null>} Deleted order or null if not found
   */
  async cancelOrder(orderId) {
    try {
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }
      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid order ID format');
      }
      throw new ApiError(500, 'Error cancelling order', error.message);
    }
  },
};

module.exports = orderRepository;
