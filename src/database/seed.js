require('dotenv').config(); // Load dotenv
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// --- Seed Data ---

const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log('Users already seeded. Skipping...');
    return;
  }

  const users = [
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
    { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },
  ];

  // Note: Password should be hashed in a real scenario; Model middleware handles it.
  await User.insertMany(users);
  console.log('Users seeded successfully');
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('Products already seeded. Skipping...');
    return;
  }

  const products = [
    { name: 'Laptop', description: 'High-performance laptop', price: 999.99, category: 'Electronics', stock: 50 },
    { name: 'Smartphone', description: 'Latest model smartphone', price: 699.99, category: 'Electronics', stock: 100 },
    { name: 'Desk Chair', description: 'Ergonomic office chair', price: 149.99, category: 'Furniture', stock: 30 },
    { name: 'Coffee Maker', description: 'Automatic drip coffee maker', price: 79.99, category: 'Appliances', stock: 75 },
    { name: 'Bookshelf', description: 'Wooden 5-tier bookshelf', price: 119.99, category: 'Furniture', stock: 20 },
  ];

  await Product.insertMany(products);
  console.log('Products seeded successfully');
};

const seedOrders = async () => {
  const count = await Order.countDocuments();
  if (count > 0) {
    console.log('Orders already seeded. Skipping...');
    return;
  }

  const users = await User.find();
  const products = await Product.find();

  const orders = [
    {
      user: users[0]._id,
      products: [{ product: products[0]._id, quantity: 1 }, { product: products[2]._id, quantity: 2 }],
      status: 'delivered',
      totalAmount: 999.99 + (149.99 * 2),
    },
    {
      user: users[1]._id,
      products: [{ product: products[1]._id, quantity: 1 }],
      status: 'shipped',
      totalAmount: 699.99,
    },
    {
      user: users[2]._id,
      products: [{ product: products[3]._id, quantity: 1 }, { product: products[4]._id, quantity: 1 }],
      status: 'pending',
      totalAmount: 79.99 + 119.99,
    },
  ];

  await Order.insertMany(orders);
  console.log('Orders seeded successfully');
};

// --- Run Seed ---

const runSeed = async () => {
  try {
    await seedUsers();
    await seedProducts();
    await seedOrders();

    console.log(' Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

runSeed();
