const orderRepository = require('../repository/order.repository');
const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');

/**
 * Order Service
 * 
 * Contains business logic for order management.
 * Handles stock validation, order creation with total calculation,
 * and enforces business rules around order lifecycle.
 */
const orderService = {
  /**
   * Create a new order.
   * Business rules:
   *   - User must be authenticated (userId comes from auth middleware)
   *   - All products must exist and be in stock
   *   - Stock is reserved (decremented) when order is placed
   *   - Total amount is calculated from current product prices
   * @param {string} userId - MongoDB ObjectId of the ordering user
   * @param {Object} orderData - { products: [{ product, quantity }], shippingAddress, status }
   * @returns {Promise<Object>} Created order with populated details
   */
  async createOrder(userId, orderData) {
    try {
      const { products, shippingAddress, status = 'pending' } = orderData;

      if (!products || products.length === 0) {
        throw new ApiError(400, 'At least one product is required');
      }

      // --- Step 1: Validate all products exist and are in stock ---
      const productIds = products.map(p => p.product);
      const productDocs = await Product.find({ _id: { $in: productIds } });

      if (productDocs.length !== productIds.length) {
        throw new ApiError(400, 'One or more products not found');
      }

      // Create a map for quick lookups
      const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

      // Check stock availability for each item
      for (const item of products) {
        const product = productMap.get(item.product.toString());
        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // --- Step 2: Decrement stock for each product ---
      for (const item of products) {
        const product = productMap.get(item.product.toString());
        product.stock -= item.quantity;
        await product.save();
      }

      // --- Step 3: Calculate total amount ---
      const totalAmount = products.reduce((sum, item) => {
        const product = productMap.get(item.product.toString());
        return sum + item.quantity * product.price;
      }, 0);

      // --- Step 4: Create the order ---
      const order = await orderRepository.create({
        user: userId,
        products,
        status,
        shippingAddress,
        totalAmount,
      });

      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error creating order', error.message);
    }
  },

  /**
   * Get orders belonging to the authenticated user.
   * @param {string} userId - MongoDB ObjectId
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} { orders, total, totalPages, currentPage }
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      return await orderRepository.findByUserId(userId, page, limit);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching orders', error.message);
    }
  },

  /**
   * Get all orders (admin only) with optional status filter.
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string|null} status - Optional status filter
   * @returns {Promise<Object>} { orders, total, totalPages, currentPage }
   */
  async getAllOrders(page = 1, limit = 10, status = null) {
    try {
      return await orderRepository.findAll(page, limit, status);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching orders', error.message);
    }
  },

  /**
   * Get a single order by ID.
   * Users can only view their own orders; admins can view any.
   * @param {string} orderId - MongoDB ObjectId
   * @param {string} userId - Requesting user ID
   * @param {string} userRole - Requesting user's role
   * @returns {Promise<Object>} Order with populated details
   */
  async getOrderById(orderId, userId, userRole) {
    try {
      const order = await orderRepository.findById(orderId);

      // Authorization check: user can only view their own orders unless admin
      if (order.user._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, 'Not authorized to view this order');
      }

      return order;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching order', error.message);
    }
  },

  /**
   * Update an order's status (admin only).
   * @param {string} orderId - MongoDB ObjectId
   * @param {string} status - New status value
   * @returns {Promise<Object>} Updated order with populated details
   */
  async updateOrderStatus(orderId, status) {
    try {
      // Validate status value
      const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      return await orderRepository.updateStatus(orderId, status);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating order status', error.message);
    }
  },

  /**
   * Cancel an order (user can cancel their own pending orders; admin can cancel any).
   * When cancelled, stock is restored to products.
   * @param {string} orderId - MongoDB ObjectId
   * @param {string} userId - Requesting user ID
   * @param {string} userRole - Requesting user role
   * @returns {Promise<Object>} The cancelled order
   */
  async cancelOrder(orderId, userId, userRole) {
    try {
      const order = await orderRepository.findById(orderId);

      // Check authorization
      if (order.user._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new ApiError(403, 'Not authorized to cancel this order');
      }

      // Check status — only pending orders can be cancelled
      if (order.status !== 'pending') {
        throw new ApiError(400, `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`);
      }

      // Restore stock for each product in the order
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      // Delete the order
      const cancelledOrder = await orderRepository.cancelOrder(orderId);
      return cancelledOrder;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error cancelling order', error.message);
    }
  },
};

module.exports = orderService;
