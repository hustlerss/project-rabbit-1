# 🐇 Project Rabbit - Project Marketplace

A full-featured project marketplace with Razorpay payment integration, admin panel, and multiple project category management.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
- Open phpMyAdmin or MySQL CLI
- Import `database.sql` — this creates all tables automatically

### 3. Configure Environment
Edit `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kanak_digifex_project_mart

SESSION_SECRET=your_random_secret_key

RAZORPAY_KEY_ID=rzp_test_XXXXXXXX        # From Razorpay Dashboard
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX      # From Razorpay Dashboard

ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@1234
```

### 4. Run the App
```bash
npm start       # Production
npm run dev     # Development with auto-restart
```

Visit: **http://localhost:1000**

---

## 🔑 Admin Panel
- URL: `http://localhost:1000/admin/login`
- Default: `admin` / `Admin@1234`
- ⚠️ **Change credentials in `.env` before deploying!**

---

## 💳 Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy `Key ID` and `Key Secret` to `.env`
4. For live payments, switch to Live keys

---

## 📁 Project Structure
```
Project_5_Project_Rabbit/
├── index.js              ← Main app entry point
├── connection.js         ← MySQL connection
├── database.sql          ← Complete DB schema (import this!)
├── .env                  ← Config (DB, Razorpay, Admin)
├── package.json
├── routes/
│   ├── user_routes.js    ← User-facing routes + Razorpay payment
│   └── admin_routes.js   ← Admin panel routes (protected)
├── views/
│   ├── user/             ← User-facing EJS pages
│   │   ├── checkout.ejs  ← Razorpay payment page
│   │   ├── my-orders.ejs ← Order history + download
│   │   └── ...
│   └── admin/
│       ├── login.ejs     ← Admin login
│       ├── orders.ejs    ← Payment/order management
│       └── ...
└── public/
    └── uploads/          ← Uploaded project images & ZIPs
```

---

## 🛠️ Key Features
- ✅ **Admin Login** — Protected dashboard with session auth
- ✅ **Razorpay Integration** — Create order → Pay → Verify → Download
- ✅ **Order Management** — View all purchases in admin panel  
- ✅ **Project Categories** — Ready, Mini, Bundle, AI, Web, Mobile, etc.
- ✅ **File Upload** — Images and ZIP files via express-fileupload
- ✅ **Contact/Comments** — Admin can view and manage inquiries
- ✅ **My Orders** — Users can re-download purchased projects by email

---

## ⚠️ Deployment Checklist
- [ ] Change `ADMIN_PASSWORD` in `.env`
- [ ] Use Live Razorpay keys (not test keys)
- [ ] Set strong `SESSION_SECRET`
- [ ] Import `database.sql` on production server
- [ ] Set correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`
