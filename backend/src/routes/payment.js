const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const Joi = require('joi');

// Validation schemas
const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  studentId: Joi.string().required(),
  subscriptionId: Joi.string().optional(),
  description: Joi.string().optional()
});

const updatePaymentStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED').required()
});

// All payment routes require authentication
router.use(auth.authenticate);

// Get payment history (students see their own, library owners see their students')
router.get('/history', 
  auth.authorize(['STUDENT', 'LIBRARY_OWNER', 'ADMIN']), 
  paymentController.getPaymentHistory
);

// Create payment (only library owners and admins)
router.post('/', 
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  validate(createPaymentSchema), 
  paymentController.createPayment
);

// Update payment status (only library owners and admins)
router.put('/:id/status', 
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  validate(updatePaymentStatusSchema), 
  paymentController.updatePaymentStatus
);

// Download invoice for a payment (students can download their own, library owners can download any)
router.get('/:id/invoice', 
  auth.authorize(['STUDENT', 'LIBRARY_OWNER', 'ADMIN']), 
  paymentController.downloadInvoice
);

module.exports = router;
