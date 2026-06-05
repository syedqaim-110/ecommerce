const pool = require('../config/db');

const getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page=1, limit=12, supplier_id } = req.query;
  const offset = (page-1)*limit;
  let query = `SELECT p.*, c.name as category_name, s.company_name as supplier_name, s.is_verified as supplier_verified
    FROM products p LEFT JOIN categories c ON p.category_id=c.id LEFT JOIN suppliers s ON p.supplier_id=s.id WHERE p.is_active=1`;
  let countQ = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_active=1`;
  const params = [], countParams = [];
  if (search) { query+=` AND (p.name LIKE ? OR p.description LIKE ?)`; countQ+=` AND (p.name LIKE ? OR p.description LIKE ?)`; params.push(`%${search}%`,`%${search}%`); countParams.push(`%${search}%`,`%${search}%`); }
  if (category) { query+=` AND c.slug=?`; countQ+=` AND c.slug=?`; params.push(category); countParams.push(category); }
  if (minPrice) { query+=` AND p.price>=?`; countQ+=` AND p.price>=?`; params.push(minPrice); countParams.push(minPrice); }
  if (maxPrice) { query+=` AND p.price<=?`; countQ+=` AND p.price<=?`; params.push(maxPrice); countParams.push(maxPrice); }
  if (supplier_id) { query+=` AND p.supplier_id=?`; countQ+=` AND p.supplier_id=?`; params.push(supplier_id); countParams.push(supplier_id); }
  if (sort==='price_asc') query+=` ORDER BY p.price ASC`;
  else if (sort==='price_desc') query+=` ORDER BY p.price DESC`;
  else if (sort==='rating') query+=` ORDER BY p.rating DESC`;
  else if (sort==='newest') query+=` ORDER BY p.created_at DESC`;
  else query+=` ORDER BY p.is_featured DESC, p.created_at DESC`;
  query+=` LIMIT ? OFFSET ?`; params.push(parseInt(limit), parseInt(offset));
  try {
    const [products] = await pool.query(query, params);
    const [countResult] = await pool.query(countQ, countParams);
    res.json({ products, total: countResult[0].total, page: parseInt(page), pages: Math.ceil(countResult[0].total/limit) });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const getProduct = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name,
        s.id as supplier_id, s.company_name, s.country as supplier_country, s.city as supplier_city,
        s.is_verified, s.description as supplier_description, s.logo as supplier_logo,
        s.rating as supplier_rating, s.total_sales
      FROM products p LEFT JOIN categories c ON p.category_id=c.id
      LEFT JOIN suppliers s ON p.supplier_id=s.id
      WHERE p.id=? AND p.is_active=1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    
    const [reviews] = await pool.query(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC`, [req.params.id]);
    const [related] = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.category_id=? AND p.id!=? AND p.is_active=1 LIMIT 6`, [rows[0].category_id, req.params.id]);
    const [sizes] = await pool.query('SELECT * FROM product_sizes WHERE product_id=? ORDER BY sort_order ASC', [req.params.id]);
    const [tiers] = await pool.query('SELECT * FROM product_price_tiers WHERE product_id=? ORDER BY min_qty ASC', [req.params.id]);
    
    res.json({ ...rows[0], reviews, related, sizes, price_tiers: tiers });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_featured=1 AND p.is_active=1 LIMIT 10`);
    res.json(rows);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin create product
const createProduct = async (req, res) => {
  const { name, description, price, old_price, category_id, stock, shipping_info, is_featured, supplier_id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name,slug,description,price,old_price,category_id,image,stock,shipping_info,is_featured,supplier_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [name, slug, description, price, old_price||null, category_id, image, stock||0, shipping_info||'Free Shipping', is_featured||0, supplier_id||null]
    );
    const [product] = await pool.query('SELECT * FROM products WHERE id=?', [result.insertId]);
    res.status(201).json(product[0]);
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const updateProduct = async (req, res) => {
  const { name, description, price, old_price, category_id, stock, shipping_info, is_featured, is_active } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    let q = 'UPDATE products SET name=?, description=?, price=?, old_price=?, category_id=?, stock=?, shipping_info=?, is_featured=?, is_active=?';
    const params = [name, description, price, old_price||null, category_id, stock, shipping_info, is_featured, is_active];
    if (image) { q+=', image=?'; params.push(image); }
    q+=' WHERE id=?'; params.push(req.params.id);
    await pool.query(q, params);
    res.json({ message: 'Product updated' });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating<1 || rating>5) return res.status(400).json({ message: 'Rating must be 1-5' });
  try {
    const [existing] = await pool.query('SELECT id FROM reviews WHERE user_id=? AND product_id=?', [req.user.id, req.params.id]);
    if (existing.length) await pool.query('UPDATE reviews SET rating=?, comment=? WHERE user_id=? AND product_id=?', [rating, comment, req.user.id, req.params.id]);
    else await pool.query('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?,?,?,?)', [req.user.id, req.params.id, rating, comment]);
    const [[avg]] = await pool.query('SELECT AVG(rating)*2 as avg_rating FROM reviews WHERE product_id=?', [req.params.id]);
    await pool.query('UPDATE products SET rating=? WHERE id=?', [parseFloat(avg.avg_rating||0).toFixed(1), req.params.id]);
    res.status(201).json({ message: 'Review submitted!' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

const deleteReview = async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id=?', [req.params.reviewId]);
    res.json({ message: 'Review deleted' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getProducts, getProduct, getFeaturedProducts, createProduct, updateProduct, deleteProduct, addReview, deleteReview };
