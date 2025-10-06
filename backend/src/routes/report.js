const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');

// All report routes require authentication and admin/owner privileges
router.use(auth.authenticate);
router.use(auth.authorize(['LIBRARY_OWNER', 'ADMIN']));

// Report endpoints (only for admins and library owners)
router.get('/summary', reportController.getReportSummary);
router.get('/students', reportController.getStudentReport);
router.get('/payments', reportController.getPaymentReport);

module.exports = router;
