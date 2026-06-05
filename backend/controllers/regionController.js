const pool = require('../config/db');

// Get all active regions
const getRegions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM region_suppliers WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all regions
const getAllRegions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM region_suppliers ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create region
const createRegion = async (req, res) => {
  const { country_name, country_code, domain, supplier_count, sort_order } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO region_suppliers (country_name, country_code, domain, supplier_count, sort_order) VALUES (?, ?, ?, ?, ?)',
      [country_name, country_code.toUpperCase(), domain, supplier_count || 0, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Update region
const updateRegion = async (req, res) => {
  const { country_name, country_code, domain, supplier_count, is_active, sort_order } = req.body;
  try {
    await pool.query(
      'UPDATE region_suppliers SET country_name=?, country_code=?, domain=?, supplier_count=?, is_active=?, sort_order=? WHERE id=?',
      [country_name, country_code?.toUpperCase(), domain, supplier_count, is_active, sort_order, req.params.id]
    );
    res.json({ message: 'Region updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete region
const deleteRegion = async (req, res) => {
  try {
    await pool.query('DELETE FROM region_suppliers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Region deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRegions, getAllRegions, createRegion, updateRegion, deleteRegion };
