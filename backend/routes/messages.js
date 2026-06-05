const express = require('express');
const router = express.Router();
const { sendMessage, getMyMessages, getAllMessages, replyMessage, markRead, deleteMessage, getUnreadCount } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/auth');

router.post('/', sendMessage); // public - guests can send
router.get('/my', protect, getMyMessages);
router.get('/unread-count', protect, admin, getUnreadCount);
router.get('/', protect, admin, getAllMessages);
router.put('/:id/reply', protect, admin, replyMessage);
router.put('/:id/read', protect, admin, markRead);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
