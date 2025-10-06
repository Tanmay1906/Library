const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize(['admin']));

router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.get('/libraries', adminController.getLibraries);
router.post('/libraries', adminController.createLibrary);
router.put('/libraries/:id', adminController.updateLibrary);
router.delete('/libraries/:id', adminController.deleteLibrary);
// ...existing code for other admin features

module.exports = router;
