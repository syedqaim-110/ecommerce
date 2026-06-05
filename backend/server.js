const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/bot', require('./routes/chatbot'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', version: '4.0' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV==='development' ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
