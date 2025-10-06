const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

// Get notifications (allow without auth for development)
router.get('/', 
  notificationController.getNotifications
);

// Get notification statistics (allow without auth for development)
router.get('/stats', 
  notificationController.getNotificationStats
);

// Send notification (allow without auth for development but log the action)
router.post('/', 
  notificationController.sendNotification
);

// Delete notification
router.delete('/:id', 
  notificationController.deleteNotification
);

// Legacy route for backward compatibility
router.get('/all', 
  notificationController.getNotifications
);

module.exports = router;
