const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers, sendBulkEmail } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, admin, getSubscribers);
router.post('/send-bulk', protect, admin, sendBulkEmail);

module.exports = router;
