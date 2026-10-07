const productRepository = require('../repository/product.repository');
const ApiError = require('../utils/ApiError');

/**
 * Product Service
 * 
 * Contains business logic for product management.
 * Handles validation, stock checking, and coordinates with the repository.
 */
const productService = {
  /**
   * Create a new product.
   * Validates required fields before delegating to repository.
   * @param {Object} productData - { name, description, price, category, stock }
   * @returns {Promise<Object>} Created product document
   */
  async createProduct(productData) {
    try {
      // Basic validation (additional validation is done in the controller via express-validator)
      if (!productData.name || !productData.price || !productData.category) {
        throw new ApiError(400, 'Name, price, and category are required');
      }

      if (productData.price < 0) {
        throw new ApiError(400, 'Price cannot be negative');
      }

      return await productRepository.create(productData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error creating product', error.message);
    }
  },

  /**
   * Get a single product by ID.
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<Object>} Product document
   */
  async getProductById(productId) {
    try {
      const product = await productRepository.findById(productId);

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid product ID format');
      }
      throw new ApiError(500, 'Error fetching product', error.message);
    }
  },

  /**
   * Get all products with filtering, search, and pagination.
   * @param {Object} filters - Query parameters from request
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} { products, total, totalPages, currentPage }
   */
  async getAllProducts(filters = {}, page = 1, limit = 10) {
    try {
      // Call repository with filters and pagination
      const result = await productRepository.findAll(filters, page, limit);

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching products', error.message);
    }
  },

  /**
   * Get all unique product categories.
   * Useful for building filter dropdowns.
   * @returns {Promise<Array<string>>} List of category names
   */
  async getCategories() {
    try {
      return await productRepository.getCategories();
    } catch (error) {
      throw new ApiError(500, 'Error fetching categories', error.message);
    }
  },

  /**
   * Update a product by ID.
   * Business rules:
   *   - Stock cannot be set to negative
   *   - Price cannot be set to negative
   * @param {string} productId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated product document
   */
  async updateProduct(productId, updateData) {
    try {
      // Prevent setting negative values
      if (updateData.price !== undefined && updateData.price < 0) {
        throw new ApiError(400, 'Price cannot be negative');
      }
      if (updateData.stock !== undefined && updateData.stock < 0) {
        throw new ApiError(400, 'Stock cannot be negative');
      }

      const product = await productRepository.updateById(productId, updateData);
      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid product ID format');
      }
      throw new ApiError(500, 'Error updating product', error.message);
    }
  },

  /**
   * Delete a product by ID.
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<Object>} Deleted product document
   */
  async deleteProduct(productId) {
    try {
      return await productRepository.deleteById(productId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid product ID format');
      }
      throw new ApiError(500, 'Error deleting product', error.message);
    }
  },
};

module.exports = productService;
