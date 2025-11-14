require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient } = require('@prisma/client');
const routes = require('./routes');
const bookController = require('./controllers/bookController');
const libraryController = require('./controllers/libraryController');
const subscriptionController = require('./controllers/subscriptionController');
const notificationController = require('./controllers/notificationController');
const passwordRoutes = require('./routes/password');
const swaggerDocument = require('./docs/swagger.json');
const { globalErrorHandler, AppError } = require('./middlewares/errorHandler');
const { exec } = require('child_process');

const app = express();
const prisma = new PrismaClient();

// Auto-run database migrations in production only when AUTO_MIGRATE=true
if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE === 'true') {
  console.log('🔄 Running database migrations (AUTO_MIGRATE=true)...');
  exec('npx prisma migrate deploy', { env: process.env }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Migration failed:', error);
    } else {
      console.log('✅ Database migrations completed:', stdout);
    }
  });
} else if (process.env.NODE_ENV === 'production') {
  console.log('ℹ️ AUTO_MIGRATE not enabled; skipping prisma migrate deploy on startup.');
}

// Trust proxy if behind a proxy (for production)
app.set('trust proxy', 1);

// Security middleware
// Build allowed origins array safely (filter out undefined values)
const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:4173'];

// Allow configuring multiple explicit origins via CORS_ALLOWED_ORIGINS (comma-separated)
const extraOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Allow configuring suffix-based matching (e.g., ".vercel.app") via CORS_ALLOWED_SUFFIXES (comma-separated)
const allowedSuffixes = (process.env.CORS_ALLOWED_SUFFIXES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Provide sensible production defaults; include FRONTEND_URL if set
const prodOrigins = [
  ...extraOrigins,
  process.env.FRONTEND_URL,
  // Add known deployment default for safety; change/remove if undesired
  'https://library-production.vercel.app'
].filter(Boolean);

const allowedOrigins = process.env.NODE_ENV === 'production' ? (prodOrigins.length ? prodOrigins : ['*']) : devOrigins;

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow server-to-server
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowedSuffixes.length > 0) {
    try {
      const url = new URL(origin);
      const host = url.host;
      return allowedSuffixes.some(suffix => host.endsWith(suffix.replace(/^\./, '')));
    } catch (_) {
      // Fallback to string check if origin isn't a valid URL
      return allowedSuffixes.some(suffix => origin.endsWith(suffix));
    }
  }
  return false;
};

// Early middleware to set CORS headers so even error responses include them
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  // Continue flow; real CORS handling is below via the cors middleware
  next();
});

// CORS middleware with a permissive origin checker using allowedOrigins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like server-to-server or curl)
    if (!origin) return callback(null, true);
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly using same origin rules
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Body parser middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Library Management Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Critical explicit aliases to avoid 404s behind some proxies/builds
// Ensure key public endpoints are always reachable
app.get('/api', (req, res) => res.json({ ok: true }));
app.get('/api/books', bookController.getBooks);
app.get('/api/libraries', libraryController.getLibraries);
app.get('/api/subscription-plans', subscriptionController.getSubscriptionPlans);
app.get('/api/notification-templates', notificationController.getNotificationTemplates);

// API routes
app.use('/api', routes);
app.use('/api/password', passwordRoutes);

// Reminder routes
const reminderRoutes = require('../routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management Backend Running',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start cron jobs
require('../utils/cronJobs');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  console.log('Shutting down the server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
