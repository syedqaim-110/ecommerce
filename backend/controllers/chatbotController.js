const pool = require('../config/db');

// Smart AI chatbot responses
const getBotResponse = async (message, userId) => {
  const msg = message.toLowerCase().trim();
  
  // Greetings
  if (/^(hi|hello|hey|salam|assalam|hola|bonjour)/.test(msg)) {
    return { text: "Hello! 👋 Welcome to Ecommerce Store. I'm your AI assistant. How can I help you today?\n\n• 🛍️ Browse products\n• 📦 Track orders\n• 💬 Contact supplier\n• ❓ Help & FAQ\n• 📝 File a complaint", quick_replies: ['Browse Products', 'Track my order', 'Contact Supplier', 'File a Complaint', 'Help & FAQ'] };
  }
  
  // Order tracking
  if (/order|track|delivery|shipped|status/.test(msg)) {
    if (userId) {
      try {
        const [orders] = await pool.query('SELECT id, status, total_amount, created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 3', [userId]);
        if (orders.length) {
          const orderList = orders.map(o => `Order #${o.id} — ${o.status} — $${parseFloat(o.total_amount).toFixed(2)}`).join('\n');
          return { text: `📦 Your recent orders:\n\n${orderList}\n\nFor full details, visit My Orders page.`, quick_replies: ['View All Orders', 'Contact Support', 'Return Policy'] };
        }
      } catch {}
    }
    return { text: "📦 To track your order:\n1. Go to My Orders page\n2. Login to your account\n3. Find your order and check status\n\nOrder statuses: Pending → Processing → Shipped → Delivered", quick_replies: ['View Orders', 'Shipping Info', 'Contact Support'] };
  }
  
  // Shipping info
  if (/ship|shipping|deliver|days|how long/.test(msg)) {
    return { text: "🚚 Shipping Information:\n\n• Standard: 3-7 business days (Free over $100)\n• Express: 1-2 business days ($15)\n• International: 7-14 business days (varies)\n\nTracking info is sent to your email after dispatch.", quick_replies: ['Track Order', 'Return Policy', 'Contact Supplier'] };
  }
  
  // Returns
  if (/return|refund|money back|exchange/.test(msg)) {
    return { text: "↩️ Return & Refund Policy:\n\n• 30-day return window\n• Item must be unused and in original packaging\n• Refund processed within 5-7 business days\n• Contact seller first for return approval", quick_replies: ['Contact Seller', 'File Complaint', 'My Orders'] };
  }
  
  // Payment
  if (/pay|payment|credit|card|cash|bank/.test(msg)) {
    return { text: "💳 Payment Methods:\n\n• Cash on Delivery (COD)\n• Bank Transfer\n• Credit/Debit Card\n• Online Payment\n\nAll payments are 100% secure and encrypted.", quick_replies: ['Place Order', 'Contact Support'] };
  }
  
  // Complaint
  if (/complain|complaint|problem|issue|bad|fake|wrong|broken/.test(msg)) {
    return { text: "📝 I'm sorry to hear you're having an issue. Here's how to get help:\n\n1. Contact the supplier directly via Messages\n2. File an official complaint\n3. Contact our admin support\n\nWe'll resolve your issue within 24-48 hours.", quick_replies: ['File Complaint', 'Contact Supplier', 'Contact Admin'] };
  }
  
  // Contact supplier
  if (/supplier|seller|vendor|contact|message/.test(msg)) {
    return { text: "💬 To contact a supplier:\n\n1. Go to the product page\n2. Click 'Send Inquiry' button\n3. Or use the Messages section\n\nSuppliers typically respond within 24 hours.", quick_replies: ['Browse Products', 'My Messages', 'Help'] };
  }
  
  // Account/Login
  if (/account|login|register|sign|password|forgot/.test(msg)) {
    return { text: "👤 Account Help:\n\n• Forgot password? Use 'Change Password' in Profile\n• New user? Click Register in the header\n• Profile issues? Contact admin support\n\nYour account is secure with JWT authentication.", quick_replies: ['Login', 'Register', 'Contact Support'] };
  }
  
  // Products search
  if (/product|item|buy|purchase|find|search|shop|electronics|clothing/.test(msg)) {
    try {
      const category = /electronics/.test(msg) ? 'electronics' : /clothing/.test(msg) ? 'clothing' : null;
      if (category) {
        const [prods] = await pool.query(`SELECT p.name, p.price FROM products p JOIN categories c ON p.category_id=c.id WHERE c.slug=? AND p.is_active=1 LIMIT 3`, [category]);
        if (prods.length) {
          const list = prods.map(p => `• ${p.name} — $${parseFloat(p.price).toFixed(2)}`).join('\n');
          return { text: `🛍️ Here are some ${category} products:\n\n${list}\n\nBrowse more in our Products section!`, quick_replies: ['Browse All', 'Electronics', 'Home & Outdoor'] };
        }
      }
    } catch {}
    return { text: "🛍️ You can browse our products by:\n\n• Category (Electronics, Clothing, etc.)\n• Search bar at the top\n• Filter by price & rating\n• Special deals section\n\nWhat are you looking for?", quick_replies: ['Electronics', 'Home & Outdoor', 'Clothing', 'Deals'] };
  }
  
  // FAQ / Help
  if (/help|faq|how|what|question|support/.test(msg)) {
    return { text: "❓ How can I help you?\n\n• 🚚 Shipping & delivery info\n• ↩️ Return & refund policy\n• 💳 Payment options\n• 📦 Order tracking\n• 💬 Contact supplier\n• 📝 File complaint\n\nJust type your question!", quick_replies: ['Shipping', 'Returns', 'Payment', 'Track Order', 'Complaints'] };
  }
  
  // Price
  if (/price|cost|cheap|expensive|discount|offer|sale|deal/.test(msg)) {
    return { text: "💰 Great deals available!\n\n• Check our Deals section for up to 40% off\n• Free shipping on orders over $100\n• Bulk discounts available from suppliers\n• Newsletter subscribers get exclusive offers!", quick_replies: ['View Deals', 'Subscribe Newsletter', 'Browse Products'] };
  }
  
  // Default response
  return { text: `I understand you're asking about "${message}". Here are some things I can help with:\n\n• 📦 Order tracking\n• 🚚 Shipping info\n• ↩️ Returns & refunds\n• 💳 Payment help\n• 💬 Contact supplier\n• 📝 File complaint\n\nOr would you like to speak with our admin support?`, quick_replies: ['Track Order', 'Shipping', 'Returns', 'Contact Admin'] };
};

// Send chatbot message
const chat = async (req, res) => {
  const { message, session_id } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message required' });
  const userId = req.user?.id || null;
  
  try {
    // Save user message
    await pool.query('INSERT INTO chatbot_logs (user_id, session_id, role, message) VALUES (?,?,\'user\',?)',
      [userId, session_id||'guest', message]);
    
    // Get bot response
    const response = await getBotResponse(message, userId);
    
    // Save bot response
    await pool.query('INSERT INTO chatbot_logs (user_id, session_id, role, message) VALUES (?,?,\'bot\',?)',
      [userId, session_id||'guest', response.text]);
    
    res.json({ text: response.text, quick_replies: response.quick_replies || [] });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// File complaint via chatbot
const fileComplaint = async (req, res) => {
  const { subject, description, supplier_id, product_id } = req.body;
  const userId = req.user?.id || null;
  try {
    const [result] = await pool.query(
      'INSERT INTO complaints (user_id, supplier_id, product_id, subject, description) VALUES (?,?,?,?,?)',
      [userId, supplier_id||null, product_id||null, subject, description]
    );
    // Notify admin
    try {
      await pool.query('INSERT INTO messages (user_id, sender_name, sender_email, subject, message, recipient_type) VALUES (?,?,?,?,?,\'admin\')',
        [userId, req.user?.name||'Guest', req.user?.email||'', `COMPLAINT: ${subject}`, description]);
    } catch {}
    res.status(201).json({ message: 'Complaint filed successfully. We will respond within 24-48 hours.', id: result.insertId });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as customer_name, u.email as customer_email,
        s.company_name as supplier_name, p.name as product_name
      FROM complaints c LEFT JOIN users u ON c.user_id=u.id
      LEFT JOIN suppliers s ON c.supplier_id=s.id LEFT JOIN products p ON c.product_id=p.id
      ORDER BY c.created_at DESC`);
    res.json(rows);
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Admin: Update complaint status
const updateComplaint = async (req, res) => {
  const { status, admin_notes } = req.body;
  try {
    await pool.query('UPDATE complaints SET status=?, admin_notes=? WHERE id=?', [status, admin_notes, req.params.id]);
    res.json({ message: 'Complaint updated' });
  } catch(err) { res.status(500).json({ message: 'Server error' }); }
};

// Update message controller to support supplier messages
const sendToSupplier = async (req, res) => {
  const { supplier_id, subject, message } = req.body;
  const userId = req.user?.id || null;
  try {
    const [supplier] = await pool.query('SELECT id FROM suppliers WHERE id=?', [supplier_id]);
    if (!supplier.length) return res.status(404).json({ message: 'Supplier not found' });
    await pool.query(
      'INSERT INTO messages (user_id, sender_name, sender_email, subject, message, type, recipient_id, recipient_type) VALUES (?,?,?,?,?,\'customer_supplier\',?,\'supplier\')',
      [userId, req.user?.name||'Guest', req.user?.email||'', subject||'Product Inquiry', message, supplier_id]
    );
    res.status(201).json({ message: 'Message sent to supplier!' });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { chat, fileComplaint, getAllComplaints, updateComplaint, sendToSupplier };
