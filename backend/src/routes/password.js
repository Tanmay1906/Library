const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { validate } = require('../middlewares/validation');

// Request password reset email
router.post('/forgot-password', passwordController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;
