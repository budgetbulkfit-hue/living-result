# Living Result - E-Commerce Platform 🚀

> **#WEARETHELIVINGRESULT**
> A premium, high-performance fitness supplement e-commerce platform featuring a custom-built, decoupled architecture optimized for WhatsApp-based sales and high-conversion marketing.

## 📖 Overview
Living Result is a full-stack e-commerce solution designed for a seamless user experience and robust administrative control. The project features a vanilla HTML/CSS/JS frontend and a Node.js/Express RESTful API backend connected to a MongoDB database.

The repository contains both:
- **Frontend:** Located at the project root (`index.html`, `product.html`, `admin.html`, `script.js`).
- **Backend API:** Located in the `backend/` directory.

## ✨ Key Features

### 🛒 Frontend (Shopper Experience)
- **Cinematic UI/UX:** High-impact dark theme with vibrant orange accents (#ff6b00), glassmorphism, and glowing highlighted text for value propositions.
- **Dynamic Product Catalog:** Categorized tabs (Unique Collection, Everyday Essentials, Combos) with seamless switching between horizontal scroll and grid layouts.
- **Conversion-Optimized Scarcity:** Real-time badges ("Best Seller", "Gluten Free") and dynamic stock counters ("🔥 Hurry, Only X Left!").
- **Interactive Product Modals:** Sophisticated gallery with swipe support, magnifying glass hover-zoom, and dynamic flavor/weight selection syncing with stock status.
- **Frictionless WhatsApp Checkout:** No mandatory logins. The cart auto-generates a perfectly formatted WhatsApp message containing itemized details, totals, and customer info, securely redirecting to the business WhatsApp.
- **Persistent Cart:** `localStorage` integration ensures the shopping cart persists across browsing sessions.
- **Intelligent Search:** Full-screen search overlay with real-time filtering.

### 🛡️ Backend & Admin CMS
- **Secure Admin Portal:** A hidden `/admin.html` dashboard strictly protected by JWT (JSON Web Token) authentication and an Admin Email Allowlist.
- **Comprehensive Product CRUD:** Manage multi-variant products (flavors, sizes, weights), toggle scarcity UI, and directly upload image assets (hosted via Cloudinary).
- **Order Management:** Track, confirm (which safely deducts live inventory stock), or cancel incoming orders. Logs analytics for Views, Sales, and Revenue.
- **Global Site Controls:**
  - **Notice Strip:** Real-time control over top-of-page promotional announcements.
  - **Version Polling (Global Refresh):** The frontend silently polls the backend. Admins can trigger a version increment to instantly force-refresh all active visitors' browsers to push urgent catalog updates.
  - **Launch Control:** Lock the website behind a stylish 'Coming Soon' screen and launch it live with a button click.
- **Review Moderation:** View, moderate, and delete user-submitted product reviews.

## 🛠️ Tech Stack
- **Frontend:** Semantic HTML5, CSS3 (Custom variables, Flexbox/Grid, CSS animations), Vanilla JavaScript (ES6+). *Zero external UI frameworks bloat.*
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Atlas) & Mongoose.
- **Storage:** Cloudinary (for scalable, secure image hosting).
- **Authentication:** JWT (JSON Web Tokens) & bcrypt.
- **Deployment:** Vercel (Frontend), Render (Backend).

## 🚀 Running Locally

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file inside the `backend/` directory and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ADMIN_EMAILS=your_admin_email@example.com
   ```
4. `npm run dev`

### 2. Frontend Setup
1. The frontend API runtime config is centralized in `config.js`:
- local (`localhost`): `http://localhost:5000/api`
- production: `<https://living-result-backend.onrender.com/api>`
2. Open the root folder with a local server (like VS Code's Live Server) and run `index.html`.

---
