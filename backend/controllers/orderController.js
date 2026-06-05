const pool = require('../config/db');

// Create order
const createOrder = async (req, res) => {
  const { items, shipping_address, payment_method, notes } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'No order items' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    for (const item of items) {
      const [p] = await conn.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
      if (!p.length) throw new Error(`Product ${item.product_id} not found`);
      if (p[0].stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
      total += p[0].price * item.quantity;
    }
    const [order] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total, shipping_address, payment_method || 'cash_on_delivery', notes]
    );
    for (const item of items) {
      const [p] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      await conn.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [order.insertId, item.product_id, item.quantity, p[0].price]);
      await conn.query('UPDATE products SET stock = stock - ?, total_orders = total_orders + ? WHERE id = ?', [item.quantity, item.quantity, item.product_id]);
    }
    // Clear cart
    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId: order.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

// Get user orders
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') as product_names FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`, [req.user.id]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    const [items] = await pool.query(`SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [req.params.id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT o.*, u.name as user_name, u.email FROM orders o JOIN users u ON o.user_id = u.id`;
  const params = [];
  if (status) { query += ` WHERE o.status = ?`; params.push(status); }
  query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  try {
    const [orders] = await pool.query(query, params);
    const [count] = await pool.query(`SELECT COUNT(*) as total FROM orders${status ? ' WHERE status = ?' : ''}`, status ? [status] : []);
    res.json({ orders, total: count[0].total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [status, payment_status, req.params.id]);
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
