const mongoose = require('mongoose');

/**
 * Order Mongoose Schema
 * 
 * Each document represents a customer order.
 * Contains embedded order items (products and quantities).
 * Uses a pre-save hook to calculate the totalAmount from line items.
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster user-specific order lookups (common filter on dashboard)
orderSchema.index({ user: 1, createdAt: -1 });

/**
 * Calculate totalAmount by fetching product prices and summing them up.
 * This creates a dependency on the Product model, which is valid since
 * order totals should reflect current product prices.
 */
orderSchema.pre('save', async function (next) {
  if (this.products.length === 0) return next();

  // Fetch all referenced products in one query
  const Product = mongoose.model('Product');
  const productDocs = await Product.find({ _id: { $in: this.products.map(p => p.product) } });

  const priceMap = new Map(productDocs.map(p => [p._id.toString(), p.price]));

  // Sum up quantity * price for each item
  this.totalAmount = this.products.reduce((sum, item) => {
    const price = priceMap.get(item.product.toString()) || 0;
    return sum + item.quantity * price;
  }, 0);

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
