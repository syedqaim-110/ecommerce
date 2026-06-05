const pool = require('../config/db');
const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT)||587,
  secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

// Send message (user or guest)
const sendMessage = async (req, res) => {
  const { subject, message, sender_name, sender_email } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });
  const user_id = req.user?.id || null;
  const name = sender_name || req.user?.name || 'Guest';
  const email = sender_email || req.user?.email || '';
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (user_id, sender_name, sender_email, subject, message) VALUES (?,?,?,?,?)',
      [user_id, name, email, subject || 'Customer Inquiry', message]
    );
    try {
      const t = createTransporter();
      await t.sendMail({
        from: `"Ecommerce Store" <${process.env.SMTP_FROM}>`,
        to: process.env.SMTP_USER,
        subject: `New Message: ${subject || 'Customer Inquiry'}`,
        html: `<div style="font-family:Arial;padding:20px"><h3>New Message #${result.insertId}</h3>
          <p><b>From:</b> ${name} (${email})</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b></p><div style="background:#f5f5f5;padding:12px;border-radius:6px">${message}</div></div>`
      });
    } catch(e) { console.log('Email notify failed:', e.message); }
    res.status(201).json({ message: 'Message sent successfully!', id: result.insertId });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get user's own messages
const getMyMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Get all messages
const getAllMessages = async (req, res) => {
  const { page=1, limit=20, is_read } = req.query;
  const offset = (page-1)*limit;
  let q = 'SELECT m.*, u.name as user_name FROM messages m LEFT JOIN users u ON m.user_id = u.id';
  const params = [];
  if (is_read !== undefined) { q += ' WHERE m.is_read = ?'; params.push(parseInt(is_read)); }
  q += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  try {
    const [rows] = await pool.query(q, params);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM messages${is_read!==undefined?' WHERE is_read=?':''} `, is_read!==undefined?[parseInt(is_read)]:[]);
    const [[{unread}]] = await pool.query('SELECT COUNT(*) as unread FROM messages WHERE is_read=0');
    res.json({ messages: rows, total, unread });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Mark read & reply
const replyMessage = async (req, res) => {
  const { admin_reply } = req.body;
  try {
    await pool.query('UPDATE messages SET is_read=1, admin_reply=?, replied_at=NOW() WHERE id=?', [admin_reply, req.params.id]);
    const [[msg]] = await pool.query('SELECT * FROM messages WHERE id=?', [req.params.id]);
    if (msg.sender_email && admin_reply) {
      try {
        const t = createTransporter();
        await t.sendMail({
          from: `"Ecommerce Store" <${process.env.SMTP_FROM}>`,
          to: msg.sender_email,
          subject: `Re: ${msg.subject}`,
          html: `<div style="font-family:Arial;padding:20px"><p>Dear ${msg.sender_name},</p>
            <p>Thank you for contacting us. Here is our reply:</p>
            <div style="background:#E3F0FF;padding:12px;border-radius:6px;margin:12px 0">${admin_reply}</div>
            <p>Original message: <em>${msg.message}</em></p><br><p>Best regards,<br>Ecommerce Support Team</p></div>`
        });
      } catch(e) { console.log('Reply email failed:', e.message); }
    }
    res.json({ message: 'Reply sent' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Mark as read
const markRead = async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_read=1 WHERE id=?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Delete
const deleteMessage = async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Unread count
const getUnreadCount = async (req, res) => {
  try {
    const [[{count}]] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE is_read=0');
    res.json({ count });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { sendMessage, getMyMessages, getAllMessages, replyMessage, markRead, deleteMessage, getUnreadCount };
