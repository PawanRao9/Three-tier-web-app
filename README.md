# 3-Tier Node.js Application

A complete 3-tier Node.js Express application following the **Routes → Services → Repository** pattern with **MongoDB**, **JWT authentication**, **input validation**, **role-based access control**, and **structured error handling** with Winston logging.

---

## Architecture

```
┌──────────────────────────────────────────┐
│             PRESENTATION LAYER           │
│         (routes/ + controllers/)         │
│  - Handles HTTP requests/responses       │
│  - Validates input                       │
│  - Delegates to service layer            │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│              BUSINESS LAYER              │
│            (services/)                   │
│  - Contains all business logic           │
│  - Enforces business rules               │
│  - Coordinates between controllers       │
│    and repositories                      │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│           DATA ACCESS LAYER              │
│          (repository/)                   │
│  - Direct database operations            │
│  - Mongoose queries                      │
│  - Abstracts storage implementation      │
└──────────────────┬───────────────────────┘
                   ▼
┌──────────────────────────────────────────┐
│              DATABASE                    │
│          (MongoDB / Mongoose)            │
│  - User, Product, Order collections      │
└──────────────────────────────────────────┘
```

---

## Project Structure

```
src/
├── server.js                    # Entry point — starts Express server
├── routes/
│   ├── index.js                 # Mounts all route modules
│   ├── user.routes.js           # User endpoints
│   ├── product.routes.js        # Product endpoints
│   └── order.routes.js          # Order endpoints
├── controllers/
│   ├── user.controller.js       # Request handlers for users
│   ├── product.controller.js    # Request handlers for products
│   └── order.controller.js      # Request handlers for orders
├── services/
│   ├── user.service.js          # User business logic
│   ├── product.service.js       # Product business logic
│   └── order.service.js         # Order business logic
├── repository/
│   ├── user.repository.js       # User DB operations
│   ├── product.repository.js    # Product DB operations
│   └── order.repository.js      # Order DB operations
├── models/
│   ├── User.model.js            # User Mongoose schema
│   ├── Product.model.js         # Product Mongoose schema
│   └── Order.model.js           # Order Mongoose schema
├── middleware/
│   ├── auth.middleware.js       # JWT authentication & role authorization
│   ├── validation.middleware.js # Express-validator wrapper
│   └── error.middleware.js      # Global error handler + 404
├── database/
│   ├── mongoose.js              # MongoDB connection
│   └── seed.js                  # Database seed script
├── utils/
│   ├── logger.js                # Winston logger
│   ├── helpers.js               # generateToken, removeEmptyValues
│   └── ApiError.js              # Custom error class
```

---

## Installation

```bash
# Clone or navigate to the project
cd dovops-node

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

> Edit `.env` with your MongoDB URI and JWT secret before running.

---

## Running the Application

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with sample data
npm run seed

# Run tests
npm test
```

---

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login and get JWT token |

### User Profile (Private — Bearer token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update current user profile |

### Admin — Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin only) |
| DELETE | `/api/users/:id` | Delete a user (admin only) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports filters) |
| GET | `/api/products/categories` | Get all unique categories |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin only) |
| PUT | `/api/products/:id` | Update product (admin only) |
| DELETE | `/api/products/:id` | Delete product (admin only) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/me` | Get current user's orders |
| GET | `/api/orders/:id` | Get single order detail |
| DELETE | `/api/orders/:id` | Cancel an order |
| GET | `/api/admin/orders` | Get all orders (admin only) |
| PUT | `/api/admin/orders/:id/status` | Update order status (admin only) |

---

## Design Patterns Used

| Pattern | Where |
|---------|-------|
| **3-Tier Architecture** | Routes → Services → Repository |
| **Middleware Chain** | Auth, validation, rate limiting, error handling |
| **Repository Pattern** | Isolates database logic from business logic |
| **Service Layer** | Houses business rules, validates logic |
| **Custom Error Class** | Structured APIError with status codes |
| **Model Middleware** | Password hashing (pre-save), total calculation (pre-save) |
| **Dependency Injection** | Controllers receive services, services receive repositories |

---

## Key Features

- **JWT Authentication** — Stateless token-based auth with role-based access control
- **Input Validation** — Express-validator with reusable validation rules
- **Password Hashing** — bcrypt with 10 salt rounds (automatic via model hook)
- **Rate Limiting** — Express-rate-limit to prevent abuse
- **Security Headers** — Helmet for security best practices
- **Structured Logging** — Winston with file output (error, warn, combined)
- **Error Handling** — Centralized error middleware with stack traces in dev
- **Mongoose Pre-save Hooks** — Automatic password hashing and order total calculation
- **Pagination** — Skip/limit pattern on list endpoints
- **CORS Enabled** — Configurable allowed origins
- **Graceful Shutdown** — Handles SIGTERM/SIGINT for container deployments
- **Seeding** — database/seed.js pre-populates sample data

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) |
| Validation | express-validator |
| Security | helmet, bcryptjs, cors, express-rate-limit |
| Logging | winston, morgan |
| Testing | Jest, Supertest |

        