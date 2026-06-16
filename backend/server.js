const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

console.log('🚀 Starting server with Express 4.x...');

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Simple test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working with Express 4.x!' });
});

console.log('✅ Basic routes setup complete');

// Load routes with proper error handling
console.log('📝 Loading API routes...');
try {
  // Import routes
  const authRoutes = require('./routes/authRoutes');
  const accountRoutes = require('./routes/accountRoutes');
  const productRoutes = require('./routes/productRoutes');
  const categoryRoutes = require('./routes/categoryRoutes');
  const orderRoutes = require('./routes/orderRoutes');

  // API routes
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/accounts`, accountRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes);
  app.use(`${apiPrefix}/orders`, orderRoutes);

  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);

  // Fallback simple routes for testing
  console.log('🔄 Loading fallback routes...');

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { id: 1, username: 'admin', role: 'admin' },
          token: 'test-token-123'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  });

  app.get('/api/accounts', (req, res) => {
    res.json({
      success: true,
      message: 'Get accounts successful (fallback)',
      data: [
        { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' },
        { id: 2, username: 'staff', email: 'staff@test.com', role: 'staff' }
      ]
    });
  });

  console.log('✅ Fallback routes loaded');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api';
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;