const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const studentRoutes = require('./student');
const libraryRoutes = require('./library');
const bookRoutes = require('./book');
const paymentRoutes = require('./payment');
const borrowRoutes = require('./borrow');
const notificationRoutes = require('./notification');
const reportRoutes = require('./report');
const subscriptionRoutes = require('./subscription');
const uploadRoutes = require('./upload');
const notificationController = require('../controllers/notificationController');

// Public routes (no authentication required)
router.use('/auth', authRoutes);
router.use('/books', bookRoutes); // Allow public access to books
router.use('/libraries', libraryRoutes); // Allow public access to libraries (controller handles auth)
// Support legacy/singular route used by some frontends
router.use('/library', libraryRoutes);
router.use('/subscription-plans', subscriptionRoutes); // Allow public access to subscription plans

// Protected routes (authentication required)
router.use('/admin', authenticate, authorize(['admin', 'owner']), adminRoutes);
router.use('/students', authenticate, studentRoutes);
router.use('/payments', authenticate, paymentRoutes);
router.use('/borrow', authenticate, borrowRoutes);
router.use('/notifications', notificationRoutes); // Remove auth for development
router.use('/reports', authenticate, authorize(['admin', 'owner']), reportRoutes);
router.use('/upload', uploadRoutes);

// Notification templates route (frontend expects /api/notification-templates) - allow without auth for development
router.get('/notification-templates', notificationController.getNotificationTemplates);

module.exports = router;
