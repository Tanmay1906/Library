const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const Joi = require('joi');

// Validation schemas
const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  isbn: Joi.string().optional(),
  genre: Joi.string().optional(),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  totalCopies: Joi.number().integer().min(1).required(),
  availableCopies: Joi.number().integer().min(0).optional(),
  description: Joi.string().optional(),
  coverUrl: Joi.string().uri().optional(),
  libraryId: Joi.string().required()
});

const updateBookSchema = Joi.object({
  title: Joi.string().optional(),
  author: Joi.string().optional(),
  isbn: Joi.string().optional(),
  genre: Joi.string().optional(),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  totalCopies: Joi.number().integer().min(1).optional(),
  availableCopies: Joi.number().integer().min(0).optional(),
  description: Joi.string().optional(),
  coverUrl: Joi.string().uri().optional(),
  libraryId: Joi.string().optional()
}).min(1);

// Public routes (anyone can view books)
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);

// Protected routes (only authenticated users can modify)
router.post('/', 
  auth.authenticate, 
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  validate(createBookSchema), 
  bookController.createBook
);

router.put('/:id', 
  auth.authenticate, 
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  validate(updateBookSchema), 
  bookController.updateBook
);

router.delete('/:id', 
  auth.authenticate, 
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  bookController.deleteBook
);

// Keep legacy endpoint for backward compatibility
router.get('/list', bookController.getBooks);

module.exports = router;
