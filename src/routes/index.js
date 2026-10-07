const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

/**
 * Main Routes Index
 * 
 * Mounts all route modules onto the Express app.
 * Each route module handles its own base path and middleware.
 */
const routes = (app) => {
  // Health check route — used by monitoring and load balancers
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
  });

  // API documentation root
  app.get('/', (req, res) => {
    res.status(200).json({
      name: '3-Tier Node.js API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/users/register, /api/users/login',
        users: '/api/users/profile, /api/users, /api/users/:id',
        products: '/api/products, /api/products/:id, /api/products/categories',
        orders: '/api/orders, /api/orders/me, /api/orders/:id',
        admin: '/api/admin/orders, /api/admin/orders/:id/status',
      },
    });
  });

  // Mount route modules with their base path
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
};

module.exports = routes;
