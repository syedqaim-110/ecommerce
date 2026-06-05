const pool = require('../config/db');

// ─── EXTRA SERVICES ───────────────────────────────────────────────────────────
const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM extra_services WHERE is_active=1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const getAllServices = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM extra_services ORDER BY sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const createService = async (req, res) => {
  const { title, icon, sort_order } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [r] = await pool.query('INSERT INTO extra_services (title, icon, image, sort_order) VALUES (?,?,?,?)', [title, icon||'Package', image, sort_order||0]);
    res.status(201).json({ id: r.insertId, title, icon, image });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};
const updateService = async (req, res) => {
  const { title, icon, is_active, sort_order } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    let q = 'UPDATE extra_services SET title=?, icon=?, is_active=?, sort_order=?';
    const params = [title, icon, is_active, sort_order];
    if (image) { q += ', image=?'; params.push(image); }
    q += ' WHERE id=?'; params.push(req.params.id);
    await pool.query(q, params);
    res.json({ message: 'Service updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteService = async (req, res) => {
  try { await pool.query('DELETE FROM extra_services WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const getLanguages = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM languages WHERE is_active=1 ORDER BY sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const getAllLanguages = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM languages ORDER BY sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const createLanguage = async (req, res) => {
  const { code, name, native_name, flag_code, sort_order } = req.body;
  try {
    const [r] = await pool.query('INSERT INTO languages (code, name, native_name, flag_code, sort_order) VALUES (?,?,?,?,?)', [code, name, native_name, flag_code, sort_order||0]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};
const updateLanguage = async (req, res) => {
  const { code, name, native_name, flag_code, is_active, sort_order } = req.body;
  try {
    await pool.query('UPDATE languages SET code=?, name=?, native_name=?, flag_code=?, is_active=?, sort_order=? WHERE id=?',
      [code, name, native_name, flag_code, is_active, sort_order, req.params.id]);
    res.json({ message: 'Language updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteLanguage = async (req, res) => {
  try { await pool.query('DELETE FROM languages WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// ─── CURRENCIES ───────────────────────────────────────────────────────────────
const getCurrencies = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM currencies WHERE is_active=1 ORDER BY sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const getAllCurrencies = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM currencies ORDER BY sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const createCurrency = async (req, res) => {
  const { code, name, symbol, exchange_rate, sort_order } = req.body;
  try {
    const [r] = await pool.query('INSERT INTO currencies (code, name, symbol, exchange_rate, sort_order) VALUES (?,?,?,?,?)', [code, name, symbol, exchange_rate||1, sort_order||0]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};
const updateCurrency = async (req, res) => {
  const { code, name, symbol, exchange_rate, is_active, sort_order } = req.body;
  try {
    await pool.query('UPDATE currencies SET code=?, name=?, symbol=?, exchange_rate=?, is_active=?, sort_order=? WHERE id=?',
      [code, name, symbol, exchange_rate, is_active, sort_order, req.params.id]);
    res.json({ message: 'Currency updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteCurrency = async (req, res) => {
  try { await pool.query('DELETE FROM currencies WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// ─── HELP ARTICLES ────────────────────────────────────────────────────────────
const getHelpArticles = async (req, res) => {
  const { category } = req.query;
  try {
    let q = 'SELECT * FROM help_articles WHERE is_active=1';
    const params = [];
    if (category) { q += ' AND category=?'; params.push(category); }
    q += ' ORDER BY sort_order ASC';
    const [rows] = await pool.query(q, params);
    res.json(rows);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const getAllHelpArticles = async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM help_articles ORDER BY category, sort_order ASC'); res.json(rows); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const createHelpArticle = async (req, res) => {
  const { title, content, category, sort_order } = req.body;
  try {
    const [r] = await pool.query('INSERT INTO help_articles (title, content, category, sort_order) VALUES (?,?,?,?)', [title, content, category||'faq', sort_order||0]);
    res.status(201).json({ id: r.insertId, ...req.body });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};
const updateHelpArticle = async (req, res) => {
  const { title, content, category, is_active, sort_order } = req.body;
  try {
    await pool.query('UPDATE help_articles SET title=?, content=?, category=?, is_active=?, sort_order=? WHERE id=?',
      [title, content, category, is_active, sort_order, req.params.id]);
    res.json({ message: 'Article updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};
const deleteHelpArticle = async (req, res) => {
  try { await pool.query('DELETE FROM help_articles WHERE id=?', [req.params.id]); res.json({ message: 'Deleted' }); }
  catch(err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = {
  getServices, getAllServices, createService, updateService, deleteService,
  getLanguages, getAllLanguages, createLanguage, updateLanguage, deleteLanguage,
  getCurrencies, getAllCurrencies, createCurrency, updateCurrency, deleteCurrency,
  getHelpArticles, getAllHelpArticles, createHelpArticle, updateHelpArticle, deleteHelpArticle
};
