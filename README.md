# living-result
# Living Result - E-Commerce Frontend 🏋️‍♂️

Welcome to the frontend repository for **Living Result**, a premium fitness supplement e-commerce platform. 

> **#WEARETHELIVINGRESULT**

## 🌐 Live Demo
**https://living-resultm.vercel.app/**

## 📖 Overview
This repository contains the client-side user interface for the Living Result store. It is a fully responsive, modern web application built to provide a seamless shopping experience for fitness enthusiasts. 

*Note: This project uses a decoupled architecture. The Node.js/MongoDB backend API that powers the data for this site is hosted in a separate repository.*

## ✨ Features
- **Dynamic Product Showcase:** Fetches and displays products, categories, flavors, and stock status directly from the backend API.
- **Interactive Cart:** Persistent shopping cart that saves items using browser `localStorage`.
- **WhatsApp Checkout:** Seamlessly generates a formatted order summary and redirects customers to WhatsApp to finalize their purchase.
- **Admin Dashboard:** A protected, hidden `/admin.html` panel for secure inventory management (Create, Read, Update, Delete products).
- **Responsive Design:** A mobile-first approach ensuring the site looks great on desktops, tablets, and smartphones.
- **Search & Filtering:** Real-time product search functionality and categorized tabs.

## 🛠️ Tech Stack
- **Markup:** HTML5
- **Styling:** CSS3 (Custom CSS variables, Flexbox, Grid, and smooth animations. No external UI frameworks were used).
- **Logic & API Integration:** Vanilla JavaScript (ES6+)
- **Hosting & Deployment:** Vercel

## 🚀 Running Locally
Since this is a static frontend, running it locally is incredibly simple:
1. Clone this repository to your local machine.
2. Open the project folder in your preferred code editor (like VS Code).
3. Use the **Live Server** extension to open `index.html`.

*Important:* To experience the full functionality of the site (fetching real products, logging into the admin panel, etc.), ensure the separate Node.js backend server is running concurrently on `http://localhost:5000`, or update the `API_URL` variable in `script.js` and `admin.html` to point to the live hosted backend.

---
&copy; 2026 Living Result. All rights reserved.
