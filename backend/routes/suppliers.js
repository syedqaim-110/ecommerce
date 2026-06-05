const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 } });

// Middleware: check supplier role
const isSupplier = (req, res, next) => {
  if (req.user?.role === 'supplier') return next();
  return res.status(403).json({ message: 'Supplier access required' });
};

// Public
router.post('/register', ctrl.registerSupplier);
router.get('/profile/:id', ctrl.getPublicProfile); // public supplier profile

// Supplier routes
router.get('/dashboard', protect, isSupplier, ctrl.getDashboard);
router.get('/me', protect, isSupplier, ctrl.getMyProfile);
router.put('/me', protect, isSupplier, upload.single('logo'), ctrl.updateProfile);
router.get('/my-products', protect, isSupplier, ctrl.getMyProducts);
router.post('/my-products', protect, isSupplier, upload.single('image'), ctrl.createProduct);
router.put('/my-products/:id', protect, isSupplier, upload.single('image'), ctrl.updateProduct);
router.delete('/my-products/:id', protect, isSupplier, ctrl.deleteProduct);
router.get('/my-orders', protect, isSupplier, ctrl.getMyOrders);
router.get('/messages', protect, isSupplier, ctrl.getSupplierMessages);
router.put('/messages/:id/reply', protect, isSupplier, ctrl.replyToCustomer);
router.get('/reports', protect, isSupplier, ctrl.getCustomerReports);

// Admin routes
router.get('/', protect, admin, ctrl.getAllSuppliers);
router.put('/:id/verify', protect, admin, ctrl.verifySupplier);
router.put('/:id/toggle', protect, admin, ctrl.toggleSupplier);

module.exports = router;
