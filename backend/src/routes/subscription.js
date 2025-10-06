const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middlewares/auth');

// Public route - Anyone can view subscription plans
router.get('/', subscriptionController.getSubscriptionPlans);

// Public route - Anyone can view specific plan
router.get('/:id', subscriptionController.getSubscriptionPlan);

module.exports = router;
