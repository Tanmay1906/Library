const express = require('express');
const router = express.Router();

const borrowController = require('../controllers/borrowController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const Joi = require('joi');

// Validation schemas
const borrowBookSchema = Joi.object({
  bookId: Joi.string().required()
});

// All borrow routes require authentication
router.use(auth.authenticate);

// Get borrow status/history
router.get('/status', 
  auth.authorize(['STUDENT', 'LIBRARY_OWNER', 'ADMIN']), 
  borrowController.getBorrowStatus
);

// Borrow a book
router.post('/', 
  auth.authorize(['STUDENT']), 
  validate(borrowBookSchema), 
  borrowController.borrowBook
);

// Return a book
router.put('/:borrowId/return', 
  auth.authorize(['STUDENT', 'LIBRARY_OWNER', 'ADMIN']), 
  borrowController.returnBook
);

module.exports = router;
