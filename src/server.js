require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { connectDB } = require('./database/mongoose');
const { notFound, errorMiddleware } = require('./middleware/error.middleware');
const routes = require('./routes');

/**
 * ===========================
 * Express Application Setup
 * ===========================
 * 
 * This file is the entry point of the application.
 * It:
 *   1. Loads environment variables
 *   2. Connects to MongoDB
 *   3. Configures Express middleware (security, CORS, logging, rate limiting)
 *   4. Registers all API routes
 *   5. Registers global error handlers
 *   6. Starts the HTTP server
 */

const app = express();

// --- Security Middleware ---
// Helmet sets various HTTP headers to secure the app against well-known web vulnerabilities
app.use(helmet());

// CORS - Allows requests from any origin (configure in production)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// --- Request Parsing Middleware ---
// Parse incoming JSON request bodies (limit: 10kb to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Logging Middleware ---
// Morgan logs HTTP requests in dev format
app.use(morgan('dev'));

// --- Rate Limiting ---
// Prevents brute-force attacks and DDoS by limiting repeated requests from same IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// --- Register Routes ---
// All endpoints are mounted under /api prefix
routes(app);

// --- 404 Handler ---
// Catches requests to undefined routes
app.use(notFound);

// --- Global Error Handler ---
// Must be the last middleware; catches all errors passed via next(err)
app.use(errorMiddleware);

/**
 * Start the server (only called directly, not on import)
 */
const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(` Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown: handle SIGTERM and SIGINT (Docker/K8s compatibility)
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

module.exports = app;
