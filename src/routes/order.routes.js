const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { validateOrderCreation, validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @api {post} /api/orders Create a new order
 * @apiName CreateOrder
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token
 * @apiBody {Array} products Array of { product, quantity } (required, min 1)
 * @apiBody {Object} [shippingAddress] { street, city, state, zipCode, country }
 * @apiBody {String} [status] Order status: "pending", "shipped", "delivered", "cancelled"
 */
router.post(
  '/',
  authMiddleware.protect,
  validateOrderCreation,
  validate,
  orderController.createOrder
);

/**
 * @api {get} /api/orders/me Get current user's orders
 * @apiName GetMyOrders
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Results per page (default: 10)
 */
router.get('/me', authMiddleware.protect, orderController.getMyOrders);

/**
 * @api {get} /api/orders/:id Get a single order by ID
 * @apiName GetOrderById
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token
 * @apiParam {String} id Order ID
 */
router.get('/:id', authMiddleware.protect, orderController.getOrderById);

/**
 * @api {delete} /api/orders/:id Cancel an order
 * @apiName CancelOrder
 * @apiGroup Orders
 * @apiHeader {String} Authorization Bearer token
 * @apiParam {String} id Order ID
 */
router.delete('/:id', authMiddleware.protect, orderController.cancelOrder);

// --- Admin Routes ---

/**
 * @api {get} /api/admin/orders Get all orders (Admin only)
 * @apiName AdminGetAllOrders
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiQuery {String} [status] Filter by status
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Results per page (default: 10)
 */
router.get('/admin/orders', authMiddleware.protect, authorize('admin'), orderController.getAllOrders);

/**
 * @api {put} /api/admin/orders/:id/status Update order status (Admin only)
 * @apiName AdminUpdateOrderStatus
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiParam {String} id Order ID
 * @apiBody {String} status New status: "pending", "shipped", "delivered", "cancelled"
 */
router.put(
  '/admin/orders/:id/status',
  authMiddleware.protect,
  authorize('admin'),
  [body('status').isIn(['pending', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')],
  validate,
  orderController.updateOrderStatus
);

module.exports = router;
