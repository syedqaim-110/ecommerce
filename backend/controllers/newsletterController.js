const pool = require('../config/db');
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

// Subscribe to newsletter
const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ message: 'Valid email required' });
  try {
    const [existing] = await pool.query('SELECT id, is_active FROM newsletter_subscribers WHERE email = ?', [email]);
    if (existing.length && existing[0].is_active) return res.status(400).json({ message: 'Email already subscribed' });
    if (existing.length && !existing[0].is_active) {
      await pool.query('UPDATE newsletter_subscribers SET is_active = 1 WHERE email = ?', [email]);
    } else {
      await pool.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);
    }
    // Send welcome email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Ecommerce Store" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Welcome to our Newsletter!',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#0D6EFD;">Welcome to Ecommerce Store! 🎉</h2>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>You'll now receive the latest deals, offers, and updates from our suppliers all over the world.</p>
            <div style="background:#E3F0FF;padding:15px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;color:#0D6EFD;font-weight:bold;">🛍️ Get US $10 off with your first order!</p>
            </div>
            <p style="color:#8B96A5;font-size:12px;">You can unsubscribe at any time by replying to this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.log('Email send failed (check SMTP settings):', emailErr.message);
    }
    res.json({ message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Unsubscribe
const unsubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    await pool.query('UPDATE newsletter_subscribers SET is_active = 0 WHERE email = ?', [email]);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all subscribers
const getSubscribers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM newsletter_subscribers');
    const [[{ active }]] = await pool.query('SELECT COUNT(*) as active FROM newsletter_subscribers WHERE is_active = 1');
    res.json({ subscribers: rows, total, active });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Send bulk email to all subscribers
const sendBulkEmail = async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ message: 'Subject and message required' });
  try {
    const [subscribers] = await pool.query('SELECT email FROM newsletter_subscribers WHERE is_active = 1');
    if (!subscribers.length) return res.status(400).json({ message: 'No active subscribers' });
    const transporter = createTransporter();
    let sent = 0, failed = 0;
    for (const sub of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Ecommerce Store" <${process.env.SMTP_FROM}>`,
          to: sub.email,
          subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${message}<br/><br/><p style="color:#8B96A5;font-size:11px;">To unsubscribe, contact us.</p></div>`
        });
        sent++;
      } catch { failed++; }
    }
    res.json({ message: `Email sent to ${sent} subscribers. Failed: ${failed}`, sent, failed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { subscribe, unsubscribe, getSubscribers, sendBulkEmail };
