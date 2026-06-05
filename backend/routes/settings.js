const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Services
router.get('/services', ctrl.getServices);
router.get('/services/all', protect, admin, ctrl.getAllServices);
router.post('/services', protect, admin, upload.single('image'), ctrl.createService);
router.put('/services/:id', protect, admin, upload.single('image'), ctrl.updateService);
router.delete('/services/:id', protect, admin, ctrl.deleteService);

// Languages
router.get('/languages', ctrl.getLanguages);
router.get('/languages/all', protect, admin, ctrl.getAllLanguages);
router.post('/languages', protect, admin, ctrl.createLanguage);
router.put('/languages/:id', protect, admin, ctrl.updateLanguage);
router.delete('/languages/:id', protect, admin, ctrl.deleteLanguage);

// Currencies
router.get('/currencies', ctrl.getCurrencies);
router.get('/currencies/all', protect, admin, ctrl.getAllCurrencies);
router.post('/currencies', protect, admin, ctrl.createCurrency);
router.put('/currencies/:id', protect, admin, ctrl.updateCurrency);
router.delete('/currencies/:id', protect, admin, ctrl.deleteCurrency);

// Help Articles
router.get('/help', ctrl.getHelpArticles);
router.get('/help/all', protect, admin, ctrl.getAllHelpArticles);
router.post('/help', protect, admin, ctrl.createHelpArticle);
router.put('/help/:id', protect, admin, ctrl.updateHelpArticle);
router.delete('/help/:id', protect, admin, ctrl.deleteHelpArticle);

module.exports = router;
