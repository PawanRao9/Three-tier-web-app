const productService = require('../services/product.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Product Controller
 * 
 * Handles HTTP requests for product operations.
 * Handles query parameter parsing, response formatting, and error forwarding.
 */
const productController = {
  /**
   * @route   POST /api/products
   * @desc    Create a new product
   * @access  Private/Admin
   */
  async createProduct(req, res, next) {
    try {
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
      };

      const product = await productService.createProduct(productData);

      logger.info(`Product created: ${product._id} - ${product.name}`);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/products
   * @desc    Get all products with filters & pagination
   * @access  Public
   */
  async getProducts(req, res, next) {
    try {
      // Extract filters from query parameters
      const { category, search, minPrice, maxPrice, inStock, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (search) filters.search = search;
      if (minPrice !== undefined) filters.minPrice = minPrice;
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;
      if (inStock !== undefined) filters.inStock = inStock;

      const result = await productService.getAllProducts(filters, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/products/categories
   * @desc    Get all unique product categories
   * @access  Public
   */
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   GET /api/products/:id
   * @desc    Get a single product by ID
   * @access  Public
   */
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   PUT /api/products/:id
   * @desc    Update a product
   * @access  Private/Admin
   */
  async updateProduct(req, res, next) {
    try {
      const productId = req.params.id;
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
      };

      const updatedProduct = await productService.updateProduct(productId, updateData);

      logger.info(`Product updated: ${updatedProduct._id}`);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route   DELETE /api/products/:id
   * @desc    Delete a product
   * @access  Private/Admin
   */
  async deleteProduct(req, res, next) {
    try {
      const productId = req.params.id;
      const deletedProduct = await productService.deleteProduct(productId);

      logger.info(`Product deleted: ${deletedProduct._id}`);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: deletedProduct,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
