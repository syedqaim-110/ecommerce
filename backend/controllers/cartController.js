const pool = require('../config/db');

const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(`SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [req.user.id]);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items, total: total.toFixed(2) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  try {
    const [product] = await pool.query('SELECT id, stock FROM products WHERE id = ? AND is_active = 1', [product_id]);
    if (!product.length) return res.status(404).json({ message: 'Product not found' });
    await pool.query(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?`, [req.user.id, product_id, quantity, quantity]);
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCart = async (req, res) => {
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart };
