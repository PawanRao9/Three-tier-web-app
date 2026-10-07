const mongoose = require('mongoose');

/**
 * Product Mongoose Schema
 * 
 * Each document represents a product available in the catalog.
 * Includes validation for price (must be positive) and stock (non-negative).
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster category-based queries
productSchema.index({ category: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
