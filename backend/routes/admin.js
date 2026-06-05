const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, toggleUser, getCategories, createCategory, deleteCategory } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
