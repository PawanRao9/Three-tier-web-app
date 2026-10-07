const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { validateProductCreation, validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @api {get} /api/products Get all products (with filters)
 * @apiName GetProducts
 * @apiGroup Products
 * @apiQuery {String} [category] Filter by category
 * @apiQuery {String} [search] Search by product name
 * @apiQuery {Number} [minPrice] Minimum price filter
 * @apiQuery {Number} [maxPrice] Maximum price filter
 * @apiQuery {String} [inStock=true] Filter in-stock only
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Results per page (default: 10)
 */
router.get('/', productController.getProducts);

/**
 * @api {get} /api/products/categories Get all product categories
 * @apiName GetCategories
 * @apiGroup Products
 */
router.get('/categories', productController.getCategories);

/**
 * @api {get} /api/products/:id Get single product by ID
 * @apiName GetProductById
 * @apiGroup Products
 * @apiParam {String} id Product ID
 */
router.get('/:id', productController.getProductById);

/**
 * @api {post} /api/products Create a new product
 * @apiName CreateProduct
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiBody {String} name Product name (required, max 100 chars)
 * @apiBody {String} description Product description (optional, max 500 chars)
 * @apiBody {Number} price Product price (required, must be positive)
 * @apiBody {String} category Category name (required)
 * @apiBody {Number} stock Stock quantity (optional, defaults to 0)
 */
router.post(
  '/',
  authMiddleware.protect,
  authorize('admin'),
  validateProductCreation,
  validate,
  productController.createProduct
);

/**
 * @api {put} /api/products/:id Update a product
 * @apiName UpdateProduct
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiParam {String} id Product ID
 */
router.put(
  '/:id',
  authMiddleware.protect,
  authorize('admin'),
  validateProductCreation,
  validate,
  productController.updateProduct
);

/**
 * @api {delete} /api/products/:id Delete a product
 * @apiName DeleteProduct
 * @apiGroup Admin
 * @apiHeader {String} Authorization Bearer token (Admin)
 * @apiParam {String} id Product ID
 */
router.delete('/:id', authMiddleware.protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
