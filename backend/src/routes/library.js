const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const Joi = require('joi');

// Validation schemas
const createLibrarySchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  adminId: Joi.string().required(),
  description: Joi.string().optional(),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional()
});

const updateLibrarySchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  description: Joi.string().optional(),
  establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional()
}).min(1);

// Public route for viewing libraries (basic info) - optional auth for enhanced data
router.get('/', auth.optionalAuthenticate, libraryController.getLibraries);

// Get specific library (mixed - public basic info, or authenticated for full details)
router.get('/:id', auth.optionalAuthenticate, libraryController.getLibrary);

// Protected routes require authentication
// Create library (only admin)
router.post('/', 
  auth.authenticate,
  auth.authorize(['ADMIN']), 
  validate(createLibrarySchema), 
  libraryController.createLibrary
);

// Update library (library owner or admin)
router.put('/:id', 
  auth.authenticate,
  auth.authorize(['LIBRARY_OWNER', 'ADMIN']), 
  validate(updateLibrarySchema), 
  libraryController.updateLibrary
);

// Delete library (only admin)
router.delete('/:id', 
  auth.authenticate,
  auth.authorize(['ADMIN']), 
  libraryController.deleteLibrary
);

// Legacy route for backward compatibility
router.get('/info', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Library info endpoint working.',
    data: { timestamp: new Date().toISOString() }
  });
});

module.exports = router;
