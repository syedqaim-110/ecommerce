const pool = require('../config/db');

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = 1');
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != "cancelled"');
    const [recent_orders] = await pool.query(`SELECT o.id, o.total_amount, o.status, o.created_at, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`);
    const [top_products] = await pool.query('SELECT id, name, total_orders, price FROM products WHERE is_active = 1 ORDER BY total_orders DESC LIMIT 5');
    const [monthly_revenue] = await pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month`);
    const [orders_by_status] = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');

    res.json({ total_users, total_products, total_orders, total_revenue, recent_orders, top_products, monthly_revenue, orders_by_status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [users] = await pool.query('SELECT id, name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user active status
const toggleUser = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const [cats] = await pool.query('SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1 GROUP BY c.id ORDER BY c.name');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  try {
    const [result] = await pool.query('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, description]);
    res.status(201).json({ id: result.insertId, name, slug, description });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getUsers, toggleUser, getCategories, createCategory, deleteCategory };
