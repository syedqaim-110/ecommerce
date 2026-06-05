# 🛒 Full-Stack Ecommerce Project — Complete

React + Node.js + MySQL + Admin Panel — Fully Dynamic & Multi-language

---

## 📁 Project Structure

```
ecommerce-fullstack/
├── backend/                    ← Node.js + Express API
│   ├── config/
│   │   ├── database.sql        ← Run this FIRST in MySQL
│   │   └── db.js
│   ├── controllers/            ← 11 controllers
│   ├── routes/                 ← 11 route files
│   ├── middleware/auth.js
│   ├── uploads/                ← Product images saved here
│   ├── .env                    ← Edit DB & SMTP settings
│   └── server.js
│
└── frontend/                   ← React + Vite + Tailwind
    └── src/
        ├── components/         ← Header, ProductCard, ProtectedRoute
        ├── context/            ← Auth, Cart, Settings (Language/Currency)
        ├── pages/              ← All customer pages
        │   └── admin/          ← 11 Admin Panel pages
        └── utils/api.js
```

---

## ⚡ SETUP (3 Steps)

### Step 1 — MySQL Database

Open MySQL Workbench or terminal and run:
```sql
source /path/to/backend/config/database.sql
```
OR copy-paste contents of `database.sql` into MySQL Workbench and execute.

**If you already ran old database.sql, run again to add new tables:**
```sql
DROP DATABASE IF EXISTS ecommerce_db;
source /path/to/backend/config/database.sql
```

### Step 2 — Backend

Edit `.env` file:
```env
DB_PASSWORD=your_mysql_password_here
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
```

Then:
```bash
cd backend
npm install
npm run dev
```
✅ Runs on: http://localhost:5000

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```
✅ Runs on: http://localhost:5173

---

## 🔑 Admin Login

```
Email:    admin@ecommerce.com
Password: admin123
```

---

## ✨ All Features

### Customer Side
- ✅ Register & Login (JWT)
- ✅ Homepage — Hero, Deals countdown, Category sections, Inquiry form
- ✅ Products — Search, filter, sort, pagination
- ✅ Product Detail — Images, size picker, price tiers, Add to Cart, Buy Now
- ✅ ⭐ Reviews & Star Ratings — Login required, 1-5 stars, live update
- ✅ Related Products + "You May Like" sidebar
- ✅ Cart — Quantity update, remove, clear
- ✅ Orders — Place order, view history, track status
- ✅ Profile — Edit info, change password
- ✅ 💬 Messages — Send message to admin, view replies
- ✅ 🌍 Multi-language — EN, UR, AR, FR, DE (full translation)
- ✅ 💱 Multi-currency — USD, EUR, GBP, PKR, AED etc (auto convert)
- ✅ 📧 Newsletter Subscribe — SMTP welcome email
- ✅ 📋 Send Quote to Supplier — Saved to DB, admin notified by email
- ✅ Suppliers by Region — Dynamic from DB
- ✅ Extra Services — Dynamic from DB
- ✅ Fully Mobile + Web Responsive

### Admin Panel (/admin)
- ✅ Dashboard — Stats, recent orders, top products, revenue charts
- ✅ Products — Add/Edit/Delete, image upload, featured toggle
- ✅ Orders — View details, update status, mark paid
- ✅ Users — List, activate/deactivate
- ✅ Categories — Add/Delete
- ✅ ⏱️ Deals & Offers — Create deals with countdown timer, set products & discounts
- ✅ 📧 Newsletter — Subscriber list, send bulk email campaigns
- ✅ 📋 Inquiries — View quote requests, update status (pending/contacted/closed)
- ✅ 💬 Messages — Reply to customer messages (sends email to customer)
- ✅ 🌍 Regions — Add/Edit/Delete supplier regions shown on homepage
- ✅ ⚙️ Settings:
  - Extra Services (with icon picker)
  - Languages (add any language with flag)
  - Currencies (with exchange rates)
  - Help Articles (FAQ, shipping, returns, payment)

---

## 📮 SMTP Email Setup (Gmail)

1. Go to Google Account → Security → Enable 2-Step Verification
2. Go to: myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password to `.env`:
```env
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

> Note: Even without SMTP configured, all other features work normally. Only emails won't send.

---

## 🌐 API Endpoints (Quick Reference)

| Route | Description |
|-------|-------------|
| POST /api/auth/login | Login |
| POST /api/auth/register | Register |
| GET /api/products | Get products (search/filter) |
| GET /api/products/featured | Featured products |
| GET /api/products/:id | Single product + reviews + related |
| POST /api/products/:id/reviews | Add star review |
| GET/POST /api/cart | Cart operations |
| POST /api/orders | Place order |
| GET /api/deals/active | Active deal for homepage |
| POST /api/newsletter/subscribe | Subscribe |
| POST /api/inquiries | Submit quote request |
| POST /api/messages | Send message to admin |
| GET /api/regions | Supplier regions |
| GET /api/settings/services | Extra services |
| GET /api/settings/languages | Languages list |
| GET /api/settings/currencies | Currencies list |
| GET /api/settings/help | Help articles |

---

## ❓ Troubleshooting

**500 error on login?**
→ Run this SQL: `UPDATE users SET password='$2a$10$7Wnzj7ViURx2RSv9bNOEau5gNGWDhPtMC06HZDWG3Bu3z6/L.x4fO' WHERE email='admin@ecommerce.com';`

**CORS error?**
→ Make sure backend runs on port 5000, frontend on 5173

**Images not showing?**
→ Backend must be running (serves /uploads folder)

**New tables not found?**
→ Re-run database.sql (drop and recreate the DB)

**Emails not sending?**
→ Check SMTP settings in .env — other features still work without SMTP
