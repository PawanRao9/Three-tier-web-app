const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User.model');

let adminToken;
let userId;

beforeAll(async () => {
  // Ensure at least one admin user exists
  const adminRes = await request(app).post('/api/users/register').send({
    name: 'Admin Test',
    email: 'admin-test@example.com',
    password: 'AdminPass123',
    role: 'admin',
  });
  adminToken = adminRes.body.data.token;
  userId = adminRes.body.data.user._id;
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({}),
  ]);
  await mongoose.connection.close();
});

describe('Product Endpoints', () => {
  describe('POST /api/products (Create)', () => {
    it('should create a product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 19.99,
          category: 'Testing',
          stock: 50,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Product');
    });

    it('should reject non-admin user', async () => {
      // Create a non-admin user and get their token
      const userRes = await request(app).post('/api/users/register').send({
        name: 'Normal User',
        email: 'normal@example.com',
        password: 'UserPass123',
        role: 'user',
      });
      const userToken = userRes.body.data.token;

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Product', price: 10, category: 'Test' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/products (Read)', () => {
    it('should fetch products with pagination', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.total).toBeDefined();
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=Testing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a product by ID', async () => {
      // First create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Specific Product', price: 29.99, category: 'Test' });

      const productId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(productId);
    });

    it('should return 404 for non-existent product ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id (Update)', () => {
    it('should update a product', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update Me', price: 9.99, category: 'Old' });

      const productId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name', price: 14.99, category: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/products/:id (Delete)', () => {
    it('should delete a product', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Delete Me', price: 5.99, category: 'ToDelete' });

      const productId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});
