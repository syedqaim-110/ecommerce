const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get supplier profile by user_id
const getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name, u.email, u.phone as user_phone 
      FROM suppliers s JOIN users u ON s.user_id=u.id 
      WHERE s.user_id=?`, [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Supplier profile not found' });
    res.json(rows[0]);
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Update supplier profile
const updateProfile = async (req, res) => {
  const { company_name, description, country, city, address, phone, website } = req.body;
  const logo = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    let q = 'UPDATE suppliers SET company_name=?, description=?, country=?, city=?, address=?, phone=?';
    const params = [company_name, description, country, city, address, phone];
    if (website !== undefined) { q += ', website=?'; params.push(website); }
    if (logo) { q += ', logo=?'; params.push(logo); }
    q += ' WHERE user_id=?'; params.push(req.user.id);
    await pool.query(q, params);
    // Update user phone too
    if (phone) await pool.query('UPDATE users SET phone=? WHERE id=?', [phone, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get supplier's own products
const getMyProducts = async (req, res) => {
  const { page=1, limit=20, search } = req.query;
  const offset = (page-1)*limit;
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(404).json({ message: 'Supplier not found' });
    
    let q = `SELECT p.*, c.name as category_name FROM products p 
      LEFT JOIN categories c ON p.category_id=c.id 
      WHERE p.supplier_id=?`;
    const params = [supplier[0].id];
    if (search) { q += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
    q += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [products] = await pool.query(q, params);
    const [[{total}]] = await pool.query('SELECT COUNT(*) as total FROM products WHERE supplier_id=?', [supplier[0].id]);
    res.json({ products, total, page: parseInt(page) });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Supplier creates product
const createProduct = async (req, res) => {
  const { name, description, price, old_price, category_id, stock, shipping_info, is_featured, 
    sizes, price_tiers, total_sold, discount_percent } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();
  
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(403).json({ message: 'Supplier profile required' });
    
    const finalPrice = discount_percent > 0 ? (price * (1 - discount_percent/100)).toFixed(2) : price;
    
    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, price, old_price, category_id, image, stock, 
        shipping_info, supplier_id, total_orders) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, description, finalPrice, price, category_id, image, stock||0,
        shipping_info||'Free Shipping', supplier[0].id, total_sold||0]
    );
    const productId = result.insertId;
    
    // Add sizes if provided
    if (sizes) {
      const sizesArr = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      for (let i=0; i<sizesArr.length; i++) {
        if (sizesArr[i].label) {
          await pool.query('INSERT INTO product_sizes (product_id, size_label, stock, sort_order) VALUES (?,?,?,?)',
            [productId, sizesArr[i].label, sizesArr[i].stock||0, i]);
        }
      }
    }
    
    // Add price tiers if provided
    if (price_tiers) {
      const tiersArr = typeof price_tiers === 'string' ? JSON.parse(price_tiers) : price_tiers;
      for (const tier of tiersArr) {
        if (tier.min_qty && tier.price) {
          await pool.query('INSERT INTO product_price_tiers (product_id, min_qty, max_qty, price) VALUES (?,?,?,?)',
            [productId, tier.min_qty, tier.max_qty||null, tier.price]);
        }
      }
    }
    
    // Update supplier product count
    await pool.query('UPDATE suppliers SET total_products = total_products + 1 WHERE id=?', [supplier[0].id]);
    
    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Supplier updates own product
const updateProduct = async (req, res) => {
  const { name, description, price, old_price, category_id, stock, shipping_info, 
    is_active, sizes, price_tiers, total_sold, discount_percent } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(403).json({ message: 'Supplier not found' });
    
    // Check ownership
    const [prod] = await pool.query('SELECT id FROM products WHERE id=? AND supplier_id=?', [req.params.id, supplier[0].id]);
    if (!prod.length) return res.status(403).json({ message: 'Not authorized to edit this product' });
    
    const finalPrice = discount_percent > 0 ? (price * (1 - discount_percent/100)).toFixed(2) : price;
    
    let q = 'UPDATE products SET name=?, description=?, price=?, old_price=?, category_id=?, stock=?, shipping_info=?, is_active=?, total_orders=?';
    const params = [name, description, finalPrice, price, category_id, stock, shipping_info, is_active, total_sold||0];
    if (image) { q += ', image=?'; params.push(image); }
    q += ' WHERE id=?'; params.push(req.params.id);
    await pool.query(q, params);
    
    // Update sizes
    if (sizes !== undefined) {
      await pool.query('DELETE FROM product_sizes WHERE product_id=?', [req.params.id]);
      const sizesArr = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      for (let i=0; i<sizesArr.length; i++) {
        if (sizesArr[i].label) {
          await pool.query('INSERT INTO product_sizes (product_id, size_label, stock, sort_order) VALUES (?,?,?,?)',
            [req.params.id, sizesArr[i].label, sizesArr[i].stock||0, i]);
        }
      }
    }
    
    // Update price tiers
    if (price_tiers !== undefined) {
      await pool.query('DELETE FROM product_price_tiers WHERE product_id=?', [req.params.id]);
      const tiersArr = typeof price_tiers === 'string' ? JSON.parse(price_tiers) : price_tiers;
      for (const tier of tiersArr) {
        if (tier.min_qty && tier.price) {
          await pool.query('INSERT INTO product_price_tiers (product_id, min_qty, max_qty, price) VALUES (?,?,?,?)',
            [req.params.id, tier.min_qty, tier.max_qty||null, tier.price]);
        }
      }
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Supplier deletes own product
const deleteProduct = async (req, res) => {
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(403).json({ message: 'Supplier not found' });
    const [prod] = await pool.query('SELECT id FROM products WHERE id=? AND supplier_id=?', [req.params.id, supplier[0].id]);
    if (!prod.length) return res.status(403).json({ message: 'Not authorized' });
    await pool.query('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
    await pool.query('UPDATE suppliers SET total_products = GREATEST(0, total_products-1) WHERE id=?', [supplier[0].id]);
    res.json({ message: 'Product deleted' });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get supplier dashboard stats
const getDashboard = async (req, res) => {
  try {
    const [supplier] = await pool.query('SELECT * FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(404).json({ message: 'Supplier not found' });
    const sid = supplier[0].id;
    
    const [[{total_products}]] = await pool.query('SELECT COUNT(*) as total_products FROM products WHERE supplier_id=? AND is_active=1', [sid]);
    const [[{total_orders}]] = await pool.query('SELECT COALESCE(SUM(oi.quantity),0) as total_orders FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE p.supplier_id=?', [sid]);
    const [[{total_revenue}]] = await pool.query('SELECT COALESCE(SUM(oi.quantity*oi.price),0) as total_revenue FROM order_items oi JOIN products p ON oi.product_id=p.id JOIN orders o ON oi.order_id=o.id WHERE p.supplier_id=? AND o.status!=\'cancelled\'', [sid]);
    const [[{total_reviews}]] = await pool.query('SELECT COUNT(*) as total_reviews FROM reviews r JOIN products p ON r.product_id=p.id WHERE p.supplier_id=?', [sid]);
    const [recent_orders] = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at, u.name as customer_name, p.name as product_name
      FROM orders o JOIN order_items oi ON o.id=oi.order_id JOIN products p ON oi.product_id=p.id
      JOIN users u ON o.user_id=u.id WHERE p.supplier_id=? ORDER BY o.created_at DESC LIMIT 5`, [sid]);
    const [top_products] = await pool.query('SELECT id, name, total_orders, price, stock FROM products WHERE supplier_id=? AND is_active=1 ORDER BY total_orders DESC LIMIT 5', [sid]);
    const [unread_msgs] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE recipient_id=? AND recipient_type=\'supplier\' AND is_read=0', [sid]);
    
    res.json({ supplier: supplier[0], total_products, total_orders, total_revenue, total_reviews, recent_orders, top_products, unread_messages: unread_msgs[0].count });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get supplier orders
const getMyOrders = async (req, res) => {
  const { page=1, limit=20, status } = req.query;
  const offset = (page-1)*limit;
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(404).json({ message: 'Not found' });
    
    let q = `SELECT o.id, o.status, o.total_amount, o.created_at, u.name as customer_name,
      p.name as product_name, oi.quantity, oi.price
      FROM orders o JOIN order_items oi ON o.id=oi.order_id JOIN products p ON oi.product_id=p.id
      JOIN users u ON o.user_id=u.id WHERE p.supplier_id=?`;
    const params = [supplier[0].id];
    if (status) { q += ' AND o.status=?'; params.push(status); }
    q += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await pool.query(q, params);
    res.json({ orders });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Get supplier public profile
const getPublicProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name, u.email FROM suppliers s JOIN users u ON s.user_id=u.id 
      WHERE s.id=? AND s.is_active=1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Supplier not found' });
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name FROM products p 
      LEFT JOIN categories c ON p.category_id=c.id 
      WHERE p.supplier_id=? AND p.is_active=1 ORDER BY p.total_orders DESC LIMIT 12`, [req.params.id]);
    res.json({ ...rows[0], products });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Admin: Get all suppliers
const getAllSuppliers = async (req, res) => {
  const { page=1, limit=20, search } = req.query;
  const offset = (page-1)*limit;
  try {
    let q = `SELECT s.*, u.name, u.email, u.is_active as user_active FROM suppliers s JOIN users u ON s.user_id=u.id`;
    const params = [];
    if (search) { q += ' WHERE (u.name LIKE ? OR s.company_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    q += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(q, params);
    const [[{total}]] = await pool.query('SELECT COUNT(*) as total FROM suppliers');
    res.json({ suppliers: rows, total });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Admin: Verify/Unverify supplier
const verifySupplier = async (req, res) => {
  const { is_verified } = req.body;
  try {
    await pool.query('UPDATE suppliers SET is_verified=? WHERE id=?', [is_verified, req.params.id]);
    res.json({ message: is_verified ? 'Supplier verified' : 'Supplier unverified' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Toggle supplier active
const toggleSupplier = async (req, res) => {
  try {
    const [s] = await pool.query('SELECT user_id, is_active FROM suppliers WHERE id=?', [req.params.id]);
    if (!s.length) return res.status(404).json({ message: 'Not found' });
    const newStatus = s[0].is_active ? 0 : 1;
    await pool.query('UPDATE suppliers SET is_active=? WHERE id=?', [newStatus, req.params.id]);
    await pool.query('UPDATE users SET is_active=? WHERE id=?', [newStatus, s[0].user_id]);
    res.json({ message: 'Supplier status updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Register as supplier
const registerSupplier = async (req, res) => {
  const { name, email, password, company_name, country, city, phone } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (existing.length) return res.status(400).json({ message: 'Email already registered' });
    const hashedPw = await bcrypt.hash(password, 10);
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,\'supplier\',?)',
      [name, email, hashedPw, phone||null]
    );
    await pool.query(
      'INSERT INTO suppliers (user_id, company_name, country, city) VALUES (?,?,?,?)',
      [userResult.insertId, company_name, country||'', city||'']
    );
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: userResult.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.status(201).json({ token, user: { id: userResult.insertId, name, email, role: 'supplier' } });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Supplier: Get messages from customers
const getSupplierMessages = async (req, res) => {
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(404).json({ message: 'Not found' });
    const [msgs] = await pool.query(`
      SELECT m.*, u.name as sender_user_name FROM messages m 
      LEFT JOIN users u ON m.user_id=u.id
      WHERE m.recipient_id=? AND m.recipient_type='supplier'
      ORDER BY m.created_at DESC`, [supplier[0].id]);
    const unread = msgs.filter(m => !m.is_read).length;
    res.json({ messages: msgs, unread });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Supplier: Reply to customer message
const replyToCustomer = async (req, res) => {
  const { admin_reply } = req.body;
  try {
    await pool.query('UPDATE messages SET admin_reply=?, is_read=1, replied_at=NOW() WHERE id=?', [admin_reply, req.params.id]);
    const [[msg]] = await pool.query('SELECT * FROM messages WHERE id=?', [req.params.id]);
    if (msg?.sender_email && admin_reply) {
      try {
        const nodemailer = require('nodemailer');
        const t = nodemailer.createTransport({ host:process.env.SMTP_HOST, port:587, secure:false, auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}, tls:{rejectUnauthorized:false} });
        await t.sendMail({ from:`"Supplier" <${process.env.SMTP_FROM}>`, to:msg.sender_email, subject:`Re: ${msg.subject}`,
          html:`<p>Dear ${msg.sender_name},</p><div style="background:#e3f0ff;padding:12px;border-radius:6px">${admin_reply}</div>` });
      } catch(e) { console.log('Email failed:', e.message); }
    }
    res.json({ message: 'Reply sent' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Supplier: Get customer reports/reviews
const getCustomerReports = async (req, res) => {
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE user_id=?', [req.user.id]);
    if (!supplier.length) return res.status(404).json({ message: 'Not found' });
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as customer_name, p.name as product_name FROM reviews r
      JOIN users u ON r.user_id=u.id JOIN products p ON r.product_id=p.id
      WHERE p.supplier_id=? ORDER BY r.created_at DESC LIMIT 50`, [supplier[0].id]);
    const [complaints] = await pool.query(`
      SELECT c.*, u.name as customer_name, p.name as product_name FROM complaints c
      LEFT JOIN users u ON c.user_id=u.id LEFT JOIN products p ON c.product_id=p.id
      WHERE c.supplier_id=? ORDER BY c.created_at DESC`, [supplier[0].id]);
    res.json({ reviews, complaints });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = {
  getMyProfile, updateProfile, getMyProducts, createProduct, updateProduct, deleteProduct,
  getDashboard, getMyOrders, getPublicProfile, getAllSuppliers, verifySupplier, toggleSupplier,
  registerSupplier, getSupplierMessages, replyToCustomer, getCustomerReports
};
