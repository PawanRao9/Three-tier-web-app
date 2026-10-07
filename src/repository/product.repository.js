const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');

/**
 * Product Repository
 * 
 * Handles all direct database operations for the Product model.
 * Supports filtering by category and searching by name.
 */
const productRepository = {
  /**
   * Create a new product.
   * @param {Object} productData - { name, description, price, category, stock }
   * @returns {Promise<Object>} Created product document
   */
  async create(productData) {
    try {
      return await Product.create(productData);
    } catch (error) {
      throw new ApiError(500, 'Error creating product', error.message);
    }
  },

/**
    * Find a product by ID.
    * @param {string} productId - MongoDB ObjectId
    * @returns {Promise<Object|null>} Product document or null
    */
   async findById(productId) {
     try {
       return await Product.findById(productId);
     } catch (error) {
       if (error.name === 'CastError') {
         throw new ApiError(400, 'Invalid product ID format');
       }
       throw new ApiError(500, 'Error finding product', error.message);
     }
   },

  /**
   * Find all products with filtering, searching, and pagination.
   * @param {Object} filters - { category, search, minPrice, maxPrice, inStock }
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} { products, total, totalPages, currentPage }
   */
  async findAll(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // --- Build query conditions from filters ---
      
      // Filter by category (exact match)
      if (filters.category) {
        query.category = filters.category;
      }

      // Search by product name (case-insensitive partial match)
      if (filters.search) {
        query.name = { $regex: filters.search, $options: 'i' };
      }

      // Filter by price range
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice !== undefined) query.price.$lte = parseFloat(filters.maxPrice);
      }

      // Filter by stock availability
      if (filters.inStock === 'true') {
        query.stock = { $gt: 0 };
      }

      // --- Execute count + find in parallel ---
      const [products, total] = await Promise.all([
        Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Product.countDocuments(query),
      ]);

      return {
        products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new ApiError(500, 'Error fetching products', error.message);
    }
  },

  /**
   * Get all unique categories from products.
   * @returns {Promise<Array<string>>} List of distinct category names
   */
  async getCategories() {
    try {
      const categories = await Product.distinct('category');
      return categories;
    } catch (error) {
      throw new ApiError(500, 'Error fetching categories', error.message);
    }
  },

  /**
   * Update a product by ID.
   * @param {string} productId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated product document
   */
  async updateById(productId, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error updating product', error.message);
    }
  },

  /**
   * Delete a product by ID.
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<Object>} Deleted product document
   */
  async deleteById(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error deleting product', error.message);
    }
  },
};

module.exports = productRepository;
