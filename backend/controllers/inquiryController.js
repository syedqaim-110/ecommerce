const pool = require('../config/db');
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

// Submit inquiry
const submitInquiry = async (req, res) => {
  const { item_name, details, quantity, unit } = req.body;
  if (!item_name) return res.status(400).json({ message: 'Item name is required' });
  const user_id = req.user?.id || null;
  try {
    const [result] = await pool.query(
      'INSERT INTO supplier_inquiries (user_id, item_name, details, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [user_id, item_name, details || '', quantity || 1, unit || 'Pcs']
    );
    // Notify admin by email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Ecommerce Store" <${process.env.SMTP_FROM}>`,
        to: process.env.SMTP_USER,
        subject: `New Supplier Inquiry #${result.insertId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#0D6EFD;">New Supplier Inquiry</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Item</td><td style="padding:8px;border:1px solid #eee;">${item_name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Quantity</td><td style="padding:8px;border:1px solid #eee;">${quantity} ${unit}</td></tr>
              <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Details</td><td style="padding:8px;border:1px solid #eee;">${details || 'N/A'}</td></tr>
            </table>
            <p style="margin-top:16px;">View in <a href="${process.env.CLIENT_URL}/admin" style="color:#0D6EFD;">Admin Panel</a></p>
          </div>
        `
      });
    } catch (e) { console.log('Admin email failed:', e.message); }
    res.status(201).json({ message: 'Inquiry submitted successfully! We will contact you soon.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all inquiries
const getInquiries = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT si.*, u.name as user_name, u.email as user_email FROM supplier_inquiries si LEFT JOIN users u ON si.user_id = u.id`;
  const params = [];
  if (status) { query += ` WHERE si.status = ?`; params.push(status); }
  query += ` ORDER BY si.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  try {
    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM supplier_inquiries${status ? ' WHERE status = ?' : ''}`, status ? [status] : []);
    res.json({ inquiries: rows, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update inquiry status
const updateInquiryStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE supplier_inquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Inquiry updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitInquiry, getInquiries, updateInquiryStatus };
