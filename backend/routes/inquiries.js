const express = require('express');
const router = express.Router();
const { submitInquiry, getInquiries, updateInquiryStatus } = require('../controllers/inquiryController');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitInquiry); // public - no auth required
router.get('/', protect, admin, getInquiries);
router.put('/:id/status', protect, admin, updateInquiryStatus);

module.exports = router;
