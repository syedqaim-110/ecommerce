const express = require('express');
const router = express.Router();
const { getRegions, getAllRegions, createRegion, updateRegion, deleteRegion } = require('../controllers/regionController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getRegions); // public
router.get('/all', protect, admin, getAllRegions);
router.post('/', protect, admin, createRegion);
router.put('/:id', protect, admin, updateRegion);
router.delete('/:id', protect, admin, deleteRegion);

module.exports = router;
