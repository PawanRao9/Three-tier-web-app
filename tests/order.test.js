const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User.model');
const Product = require('../../src/models/Product.model');

let customerToken;
let adminToken;
let productId;

beforeAll(async () => {
  // Create admin
  const adminRes = await request(app).post('/api/users/register').send({
    name: 'Order Admin',
    email: 'order-admin@example.com',
    password: 'AdminPass123',
    role: 'admin',
  });
  adminToken = adminRes.body.data.token;

  // Create customer
  const customerRes = await request(app).post('/api/users/register').send({
    name: 'Order Customer',
    email: 'customer@example.com',
    password: 'CustomerPass123',
    role: 'user',
  });
  customerToken = customerRes.body.data.token;

  // Create a product to order
  const productRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Order Product', price: 25.0, category: 'Orders', stock: 100 });

  productId = productRes.body.data._id;
});

afterAll(async () => {
  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
  await mongoose.connection.close();
});

describe('Order Endpoints', () => {
  describe('POST /api/orders (Create)', () => {
    it('should create an order as a customer', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          products: [{ product: productId, quantity: 2 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.totalAmount).toBeCloseTo(50.0, 1); // 2 * 25.0
    });

    it('should fail with no products', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ products: [] });

      expect(res.status).toBe(400);
    });

    it('should fail with insufficient stock', async () => {
      // First, create an order that uses most stock
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ products: [{ product: productId, quantity: 100 }] });

      // Now try to order more than available
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ products: [{ product: productId, quantity: 1 }] });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('GET /api/orders/me', () => {
    it('should fetch own orders', async () => {
      const res = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });
  });

  describe('DELETE /api/orders/:id (Cancel)', () => {
    it('should cancel own pending order', async () => {
      // Create a new order to cancel
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ products: [{ product: productId, quantity: 2 }] });

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cancelled');
    });

    it('should not cancel another user\'s order', async () => {
      // Create a second customer
      const otherRes = await request(app).post('/api/users/register').send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'OtherPass123',
      });
      const otherToken = otherRes.body.data.token;

      // Other user creates an order
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ products: [{ product: productId, quantity: 1 }] });

      const otherOrderId = orderRes.body.data._id;

      // Try to cancel other user's order
      const res = await request(app)
        .delete(`/api/orders/${otherOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/orders (Admin)', () => {
    it('should get all orders as admin', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should reject non-admin access to /api/admin/orders', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
