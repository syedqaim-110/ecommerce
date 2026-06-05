const express = require('express');
const router = express.Router();
const { chat, fileComplaint, getAllComplaints, updateComplaint, sendToSupplier } = require('../controllers/chatbotController');
const { protect, admin } = require('../middleware/auth');

router.post('/chat', chat); // public
router.post('/complaint', fileComplaint); // public
router.post('/message-supplier', protect, sendToSupplier);
router.get('/complaints', protect, admin, getAllComplaints);
router.put('/complaints/:id', protect, admin, updateComplaint);

module.exports = router;
