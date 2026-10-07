const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User.model');

let authToken; // Share auth token across tests

// Clean the database and re-seed before all tests
beforeAll(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
        role: 'user',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app).post('/api/users/register').send({
        email: 'test2@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/api/users/register').send({
        name: 'Another User',
        email: 'duplicate@example.com',
        password: 'TestPass123',
      });

      const res = await request(app).post('/api/users/register').send({
        name: 'Another User Again',
        email: 'duplicate@example.com',
        password: 'TestPass123',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/users/login', () => {
    beforeAll(async () => {
      // Register a user for login tests
      const res = await request(app).post('/api/users/register').send({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'TestPass123',
      });
      authToken = res.body.data.token;
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'login@example.com',
        password: 'TestPass123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'login@example.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('login@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.status).toBe(401);
    });
  });
});
