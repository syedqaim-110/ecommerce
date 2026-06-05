const pool = require('../config/db');

// Get active deal with items
const getActiveDeal = async (req, res) => {
  try {
    const [deals] = await pool.query('SELECT * FROM deals WHERE is_active=1 AND end_time > NOW() ORDER BY created_at DESC LIMIT 1');
    if (!deals.length) return res.json(null);
    const deal = deals[0];
    const [items] = await pool.query(`
      SELECT di.*, p.name, p.price, p.image, p.old_price 
      FROM deal_items di JOIN products p ON di.product_id=p.id 
      WHERE di.deal_id=? ORDER BY di.sort_order ASC`, [deal.id]);
    res.json({ ...deal, items });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Admin: Get all deals
const getAllDeals = async (req, res) => {
  try {
    const [deals] = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
    res.json(deals);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Create deal
const createDeal = async (req, res) => {
  const { title, subtitle, end_time, items } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO deals (title, subtitle, end_time) VALUES (?,?,?)', [title, subtitle, end_time]);
    if (items && items.length) {
      for (let i=0; i<items.length; i++) {
        await pool.query('INSERT INTO deal_items (deal_id, product_id, discount_percent, sort_order) VALUES (?,?,?,?)',
          [result.insertId, items[i].product_id, items[i].discount_percent, i]);
      }
    }
    res.status(201).json({ id: result.insertId });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// Admin: Update deal
const updateDeal = async (req, res) => {
  const { title, subtitle, end_time, is_active, items } = req.body;
  try {
    await pool.query('UPDATE deals SET title=?, subtitle=?, end_time=?, is_active=? WHERE id=?', [title, subtitle, end_time, is_active, req.params.id]);
    if (items) {
      await pool.query('DELETE FROM deal_items WHERE deal_id=?', [req.params.id]);
      for (let i=0; i<items.length; i++) {
        await pool.query('INSERT INTO deal_items (deal_id, product_id, discount_percent, sort_order) VALUES (?,?,?,?)',
          [req.params.id, items[i].product_id, items[i].discount_percent, i]);
      }
    }
    res.json({ message: 'Deal updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Delete
const deleteDeal = async (req, res) => {
  try {
    await pool.query('DELETE FROM deals WHERE id=?', [req.params.id]);
    res.json({ message: 'Deal deleted' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getActiveDeal, getAllDeals, createDeal, updateDeal, deleteDeal };
