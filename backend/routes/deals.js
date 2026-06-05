const express = require('express');
const router = express.Router();
const { getActiveDeal, getAllDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');
const { protect, admin } = require('../middleware/auth');

router.get('/active', getActiveDeal); // public
router.get('/', protect, admin, getAllDeals);
router.post('/', protect, admin, createDeal);
router.put('/:id', protect, admin, updateDeal);
router.delete('/:id', protect, admin, deleteDeal);

module.exports = router;
