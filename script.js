// =====================================================
// PRODUCT DATA — Easy to add/remove/edit products here!
// =====================================================
// To add a new product: copy one object, change the values.
// To remove: just delete the object from the array.
// Merged product lookup (all categories)
let allProducts = [];
let currentProductData = null;


// ===== RENDER A SINGLE PRODUCT CARD (reusable) =====
function renderProductCard(product) {
  const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);

  // Use the first flavor as default display
  const defaultFlavor = product.flavors[0];

  const displayPrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : product.price;
  const displayOldPrice = product.sizes && product.sizes.length > 0 && product.sizes[0].oldPrice ? product.sizes[0].oldPrice : (product.oldPrice || displayPrice);
  const displayWeight = product.sizes && product.sizes.length > 0 ? product.sizes[0].weight : '';
  const discountText = displayOldPrice > displayPrice ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100) + '% OFF' : (product.discount ? product.discount + '% OFF' : '');

  return `
    <div class="product-card" id="product-${product.slug}" onclick="window.location.href='product.html?slug=${product.slug}'" style="cursor: pointer;">
      <div class="product-image">
        <img src="${defaultFlavor.image}" alt="${product.name}" loading="lazy">
        <span class="stock-badge ${defaultFlavor.inStock ? 'in-stock' : 'out-of-stock'}">
          ${defaultFlavor.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
        ${product.bestSeller ? '<span class="best-seller-badge">🔥 Best Seller</span>' : ''}
        ${product.glutenFree ? '<span class="gluten-free-badge">🌾 Gluten Free</span>' : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="product-flavor" style="margin-bottom: 0;">${product.flavors.length} Flavor${product.flavors.length > 1 ? 's' : ''}</span>
          ${displayWeight ? `<span style="color: var(--text-muted); opacity: 0.5;">|</span><span class="product-weight" style="font-size: 13px; color: var(--accent); font-weight: 600;">${displayWeight}</span>` : ''}
        </div>
        <div class="product-pricing">
          <span class="current-price">₹${displayPrice.toLocaleString()}</span>
          ${displayOldPrice > displayPrice ? `<span class="old-price">₹${displayOldPrice.toLocaleString()}</span>` : ''}
          ${discountText ? `<span class="discount">${discountText}</span>` : ''}
        </div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${product.numReviews || product.reviews || 0})</span>
        </div>
        <div class="scarcity-text" style="color: var(--accent); font-size: 12px; font-weight: 600; margin-top: 8px;">
           🔥 Hurry, only ${product.stockLeft} left!
        </div>
      </div>
    </div>
  `;
}

// ===== STATE FOR PRODUCT CATEGORY =====
let currentCategory = "unique";

function switchProductCategory(category) {
  currentCategory = category;

  // Update tabs
  ['unique', 'common', 'combos'].forEach(cat => {
    const tab = document.getElementById(`tab-${cat}`);
    if (tab) {
      tab.classList.remove("active");
      tab.style.borderBottomColor = "transparent";
      tab.style.color = "var(--text-muted)";
    }
    const desc = document.getElementById(`category-description-${cat}`);
    if (desc) desc.style.display = 'none';
  });

  const activeTab = document.getElementById(`tab-${category}`);
  if (activeTab) {
    activeTab.classList.add("active");
    activeTab.style.borderBottomColor = "var(--accent)";
    activeTab.style.color = "var(--text-primary)";
  }
  const activeDesc = document.getElementById(`category-description-${category}`);
  if (activeDesc) activeDesc.style.display = 'block';

  renderProducts();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  const filteredProducts = allProducts.filter(p => p.category === currentCategory);

  // Scroll view (default)
  const scrollContainer = document.getElementById("productsScroll");
  if (scrollContainer) {
    scrollContainer.innerHTML = filteredProducts.map(renderProductCard).join("");
  }

  // Grid view (View All)
  const gridContainer = document.getElementById("productsGrid");
  if (gridContainer) {
    gridContainer.innerHTML = filteredProducts.map(renderProductCard).join("");
  }
}

// ===== SCROLL PRODUCTS (LEFT/RIGHT ARROWS) =====
function scrollProducts(direction) {
  const container = document.getElementById("productsScroll");
  const scrollAmount = 320;
  container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

// ===== VIEW ALL PRODUCTS TOGGLE =====
let viewAllExpanded = false;
function toggleViewAll() {
  const scrollWrapper = document.getElementById("productsScrollWrapper");
  const gridContainer = document.getElementById("productsGrid");
  const btn = document.getElementById("viewAllBtn");

  viewAllExpanded = !viewAllExpanded;

  if (viewAllExpanded) {
    scrollWrapper.classList.add("hidden");
    gridContainer.classList.remove("hidden");
    btn.textContent = "Show Less";
  } else {
    scrollWrapper.classList.remove("hidden");
    gridContainer.classList.add("hidden");
    btn.textContent = "View All Products";
  }
}

// ===== PRODUCT MODAL LOGIC =====
let currentSelectedFlavorIndex = 0;
let currentSelectedSizeIndex = 0;
let currentGalleryImages = [];
let currentGalleryIndex = 0;

// ===== PRIVACY POLICY MODAL =====
function openPrivacyModal(e) {
  if (e) e.preventDefault();
  const modalOverlay = document.getElementById("privacyModalOverlay");
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePrivacyModal(e) {
  if (e && e.target.id !== "privacyModalOverlay" && !e.target.closest('.modal-close')) return;
  const modalOverlay = document.getElementById("privacyModalOverlay");
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function switchModalTab(tabId) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`[onclick="switchModalTab('${tabId}')"]`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ===== IMAGE LIGHTBOX ZOOM =====
let isZoomed = false;

function openImageLightbox(src) {
  const overlay = document.getElementById("imageLightboxOverlay");
  const img = document.getElementById("lightboxImage");
  img.src = src;
  img.style.transform = "scale(1)";
  img.style.cursor = "zoom-in";
  isZoomed = false;
  overlay.classList.add("active");
}

function closeImageLightbox(e) {
  if (e && e.target.id !== "imageLightboxOverlay" && !e.target.closest('.modal-close')) return;
  const overlay = document.getElementById("imageLightboxOverlay");
  overlay.classList.remove("active");
}

function toggleZoom(e) {
  const img = e.target;
  isZoomed = !isZoomed;
  if (isZoomed) {
    img.style.transform = "scale(1.8)";
    img.style.cursor = "zoom-out";
  } else {
    img.style.transform = "scale(1)";
    img.style.cursor = "zoom-in";
  }
}

// ===== MAGNIFYING GLASS HOVER ZOOM =====
function handleImageZoom(e, wrapper) {
  if (window.innerWidth <= 768) return; // Disable on touch/mobile devices
  const img = wrapper.querySelector('img');
  if (!img) return;
  const { left, top, width, height } = wrapper.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 100;
  const y = ((e.clientY - top) / height) * 100;
  img.style.transformOrigin = `${x}% ${y}%`;
  img.style.transform = 'scale(2.2)'; // Zoom level
}

function resetImageZoom(wrapper) {
  if (window.innerWidth <= 768) return;
  const img = wrapper.querySelector('img');
  if (!img) return;
  img.style.transformOrigin = 'center center';
  img.style.transform = 'scale(1)';
}

// ===== SEARCH OVERLAY =====
function toggleSearch() {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");
  overlay.classList.toggle("active");
  if (overlay.classList.contains("active")) {
    document.body.style.overflow = "hidden";
    setTimeout(() => input.focus(), 200);
  } else {
    document.body.style.overflow = "";
    input.value = "";
    document.getElementById("searchResults").innerHTML = "";
  }
}

function handleSearch(query) {
  const resultsEl = document.getElementById("searchResults");
  if (!query.trim()) {
    resultsEl.innerHTML = "";
    return;
  }

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    resultsEl.innerHTML = '<div class="search-no-results">No products found. Try a different search.</div>';
    return;
  }

  resultsEl.innerHTML = filtered.map(p => {
    const firstFlavor = p.flavors[0];
    const sPrice = p.sizes && p.sizes.length > 0 ? p.sizes[0].price : p.price;
    const sWeight = p.sizes && p.sizes.length > 0 ? p.sizes[0].weight : '';
    return `
      <a href="product.html?slug=${p.slug}" class="search-result-item">
        <img src="${firstFlavor.image}" alt="${p.name}">
        <div>
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">₹${sPrice.toLocaleString()}${sWeight ? ' · ' + sWeight : ''}</div>
        </div>
      </a>
    `;
  }).join("");
}

// Close search on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const searchOverlay = document.getElementById("searchOverlay");
    if (searchOverlay.classList.contains("active")) toggleSearch();
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar.classList.contains("active")) toggleCart();
  }
});

// ===== ACCOUNT DROPDOWN =====
function toggleAccount() {
  const dropdown = document.getElementById("accountDropdown");
  dropdown.classList.toggle("active");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const accountBtn = document.getElementById("accountBtn");
  const dropdown = document.getElementById("accountDropdown");
  if (dropdown && !accountBtn.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// ===== CART SIDEBAR =====
function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

// ===== MOBILE MENU =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const mobileOverlay = document.getElementById("mobileOverlay");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  mobileOverlay.classList.toggle("active");
});

mobileOverlay.addEventListener("click", () => {
  navMenu.classList.remove("active");
  mobileOverlay.classList.remove("active");
});

// Close menu on nav link click
document.querySelectorAll(".nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
  });
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  const noticeStrip = document.getElementById("noticeStrip");
  const scrollY = window.scrollY;
  if (scrollY > 80) {
    navbar.style.background = "rgba(10,10,10,0.97)";
    navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.5)";
  } else {
    navbar.style.background = "rgba(10,10,10,0.92)";
    navbar.style.boxShadow = "none";
  }

  // Smooth sticky transition when Notice Strip is active
  if (noticeStrip && noticeStrip.style.display === 'block') {
    const stripHeight = noticeStrip.offsetHeight;
    if (scrollY > stripHeight) {
      navbar.style.top = "0px";
    } else {
      navbar.style.top = `${stripHeight - scrollY}px`;
    }
  } else {
    navbar.style.top = "0px";
  }
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function setupAnimations() {
  const animateElements = document.querySelectorAll(
    ".product-card, .stat-item, .testimonial-card, .benefit-item, .why-content, .why-image"
  );
  animateElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const id = this.getAttribute("href");
    if (id === "#") return;
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ===== CART SYSTEM =====
let cart = JSON.parse(localStorage.getItem('livingResultCart')) || [];
let pendingOrderAmount = 0;

function saveCart() {
  localStorage.setItem('livingResultCart', JSON.stringify(cart));
}

function changeModalQty(delta) {
  const qtyEl = document.getElementById('modalQty');
  if (!qtyEl) return;
  let qty = parseInt(qtyEl.textContent) + delta;
  if (qty < 1) qty = 1;
  if (qty > 10) qty = 10;
  qtyEl.textContent = qty;
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  updateCartUI();
  updateFloatingCart();
  saveCart();
}

function changeCartQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(key); return; }
  updateCartUI();
  updateFloatingCart();
  saveCart();
}

function updateFloatingCart() {
  const btn = document.getElementById('floatingCartBtn');
  const countEl = document.getElementById('floatingCartCount');
  const navCountEl = document.getElementById('cartCount');
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  if (btn) {
    btn.classList.toggle('visible', totalItems > 0);
    if (countEl) countEl.textContent = totalItems;
  }
  if (navCountEl) navCountEl.textContent = totalItems;
}

function updateCartUI() {
  const cartBody = document.getElementById('cartBody');
  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your cart is empty</p>
        <a href="#products" class="btn-primary" onclick="toggleCart()" style="font-size:12px;padding:10px 24px;">Browse Products</a>
      </div>`;
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemsHTML = cart.map(item => `
    <div style="display:flex; gap:12px; padding:16px 0; border-bottom:1px solid var(--border);">
      <img src="${item.image}" style="width:60px;height:60px;object-fit:contain;background:#0e0e0e;border-radius:6px;padding:4px;" alt="${item.name}">
      <div style="flex:1;">
        <div style="font-weight:600;font-size:13px;margin-bottom:2px;">${item.name}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${item.flavorName}${item.weight ? ' | ' + item.weight : ''}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="qty-control" style="border-color:var(--border);">
            <button class="qty-btn" onclick="changeCartQty('${item.key}', -1)" style="width:28px;height:28px;font-size:15px;">−</button>
            <span class="qty-num" style="font-size:13px;">${item.qty}</span>
            <button class="qty-btn" onclick="changeCartQty('${item.key}', 1)" style="width:28px;height:28px;font-size:15px;">+</button>
          </div>
          <span style="font-weight:700;color:var(--accent);font-size:14px;">₹${(item.price * item.qty).toLocaleString()}</span>
          <button onclick="removeFromCart('${item.key}')" style="margin-left:auto;background:none;border:none;color:var(--text-muted);font-size:18px;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
        </div>
      </div>
    </div>
  `).join('');

  cartBody.innerHTML = `
    ${itemsHTML}
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <span style="font-size:15px;font-weight:600;">Total</span>
        <span style="font-size:18px;font-weight:700;color:var(--accent);">₹${total.toLocaleString()}</span>
      </div>
      <button onclick="startCartCheckout()" class="btn-primary" style="width:100%;justify-content:center;padding:16px;font-size:15px;">
        Proceed to Checkout
      </button>
    </div>`;
}

function startCartCheckout() {
  if (cart.length === 0) return;
  // Set pending amount to total cart value
  pendingOrderAmount = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Close cart sidebar, open checkout modal
  toggleCart();
  const overlay = document.getElementById('checkoutModalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Update summary
    const summaryEl = document.getElementById('checkoutSummary');
    if (summaryEl) {
      const itemsList = cart.map(i => `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:var(--text-primary);font-size:13px;">${i.name} (${i.weight || ''}) × ${i.qty}</span>
          <span style="color:var(--accent);font-weight:bold;font-size:13px;">₹${(i.price * i.qty).toLocaleString()}</span>
        </div>`).join('');
      summaryEl.innerHTML = `
        ${itemsList}
        <hr style="border:0;border-top:1px solid var(--border);margin:15px 0;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--text-primary);font-weight:bold;">Total to Pay:</span>
          <span style="color:#fff;font-weight:bold;font-size:18px;">₹${pendingOrderAmount.toLocaleString()}</span>
        </div>`;
    }
  }
}


function closeCheckoutModal(e) {
  if (e && e.target.id !== "checkoutModalOverlay" && !e.target.closest('.modal-close')) return;
  const overlay = document.getElementById("checkoutModalOverlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

async function processCheckout(e) {
  e.preventDefault();

  // NOTE: Token/Login logic commented out as orders now go to WhatsApp directly
  /* 
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to place an order.');
    closeCheckoutModal();
    toggleAuthModal();
    return;
  }
  */

  const name = document.getElementById("checkoutName").value;
  const phone = document.getElementById("checkoutPhone").value;
  const address = document.getElementById("checkoutAddress").value;

  // Close checkout modal
  const checkoutOverlay = document.getElementById("checkoutModalOverlay");
  if (checkoutOverlay) checkoutOverlay.classList.remove("active");

  try {
    // PREPARE WHATSAPP MESSAGE
    let message = `🛒 *NEW ORDER — Living Result*\n\n`;
    message += `📦 *Items:*\n`;

    cart.forEach(item => {
      const details = [item.flavorName, item.weight].filter(Boolean).join(', ');
      message += `• ${item.name} (${details}) × ${item.qty} — ₹${(item.price * item.qty).toLocaleString()}\n`;
    });

    message += `\n💰 *Total: ₹${pendingOrderAmount.toLocaleString()}*\n\n`;
    message += `👤 *Name:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    message += `📍 *Address:* ${address}\n\n`;
    message += `Please confirm my order! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "917003714398";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // FUTURE: Razorpay/Backend Payment logic preserved below
    /*
    // 1. Get Razorpay config key
    const configRes = await fetch(`${API_URL}/payment/config`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const configData = await configRes.json();
    if (!configData.success) throw new Error('Failed to load payment config');

    // 2. Create Order on backend using full cart
    const cartItems = cart.map(item => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty
    }));
    const orderRes = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: pendingOrderAmount,
        items: cartItems
      })
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error(orderData.message);

    // 3. Initialize Razorpay
    const options = {
      key: configData.key,
      amount: orderData.data.amount,
      currency: orderData.data.currency,
      name: "Living Result",
      description: "Order Checkout",
      order_id: orderData.data.id,
      handler: async function (response) {
        // ... (verification logic)
      }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    */

    // OPEN WHATSAPP
    window.open(whatsappLink, '_blank');

    // SUCCESS ACTIONS
    cart = [];
    updateCartUI();
    updateFloatingCart();

    // Reset form
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) checkoutForm.reset();

    // Show success modal
    const successOverlay = document.getElementById("successModalOverlay");
    if (successOverlay) successOverlay.classList.add("active");

  } catch (error) {
    console.error('Checkout error:', error);
    alert(`Checkout Failed: ${error.message}`);
  }
}

function simulatePaymentSuccess() {
  // Close payment modal
  const paymentOverlay = document.getElementById("mockPaymentOverlay");
  if (paymentOverlay) paymentOverlay.classList.remove("active");

  // Show success modal
  const successOverlay = document.getElementById("successModalOverlay");
  if (successOverlay) successOverlay.classList.add("active");

  // Clear cart/form in a real scenario
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) checkoutForm.reset();
}

function simulatePaymentFailure() {
  const paymentOverlay = document.getElementById("mockPaymentOverlay");
  if (paymentOverlay) paymentOverlay.classList.remove("active");
  document.body.style.overflow = "";
  alert("Payment cancelled. You can try again.");
}

function closeSuccessModal(e) {
  if (e && e.target.id !== "successModalOverlay" && !e.target.closest('button')) return;
  const successOverlay = document.getElementById("successModalOverlay");
  if (successOverlay) {
    successOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus(); // Check if user is logged in
  updateCartUI();
  updateFloatingCart();
  fetchAndDisplaySettings();
  startGlobalRefreshPolling();

  fetchProducts().then(() => {
    if (window.location.pathname.includes('product.html')) {
      loadSingleProductPage();
    } else {
      setupAnimations();
    }
  });
});

// const API_URL = 'http://localhost:5000/api'; // <-- UNCOMMENT THIS FOR LOCAL TESTING
const API_URL = 'https://living-result-backend.onrender.com/api'; // <-- UNCOMMENT THIS FOR LIVE DEPLOYMENT

// ===== GLOBAL REFRESH POLLING =====
let currentSiteVersion = null;
async function checkSiteVersion() {
  try {
    const res = await fetch(`${API_URL}/settings/version`);
    const data = await res.json();
    if (data.success) {
      if (currentSiteVersion === null) {
        currentSiteVersion = data.version; // Set initial version instantly
      } else if (data.version > currentSiteVersion) {
        window.location.reload(true); // Force reload from server if version increased
      }
    }
  } catch (e) { }
}

async function startGlobalRefreshPolling() {
  await checkSiteVersion(); // Check instantly on page load
  setInterval(checkSiteVersion, 30000); // Then check every 30 seconds
}

async function fetchAndDisplaySettings() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    const data = await res.json();
    if (data.success && data.data.noticeStrip) {
      const noticeStrip = data.data.noticeStrip;
      if (noticeStrip.enabled && noticeStrip.text) {
        document.getElementById('noticeStripText').textContent = noticeStrip.text;
        const strip = document.getElementById('noticeStrip');
        strip.style.display = 'block';

        // Set initial navbar position based on scroll
        const scrollY = window.scrollY;
        if (scrollY <= strip.offsetHeight) {
          document.getElementById('navbar').style.top = `${strip.offsetHeight - scrollY}px`;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
}

// ===== AUTH UI LOGIC =====
function toggleAuthModal() {
  const overlay = document.getElementById("authModalOverlay");
  if (overlay) {
    overlay.classList.toggle("active");
    if (overlay.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('svg');
  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = "password";
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

function closeAuthModal(e) {
  if (e && e.target.id !== "authModalOverlay" && !e.target.closest('.modal-close')) return;
  const overlay = document.getElementById("authModalOverlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function switchAuthTab(tab) {
  document.getElementById("tab-login").classList.remove("active");

  document.getElementById("loginForm").style.display = "none";

  document.getElementById(`tab-${tab}`).classList.add("active");
  document.getElementById(`${tab}Form`).style.display = "block";
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      document.getElementById('loginForm').reset();
      closeAuthModal();
      checkAuthStatus();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Failed to connect to server. Ensure backend is running.');
  }
}

async function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const authTabs = document.getElementById('authTabs');
  const loginForm = document.getElementById('loginForm');
  const loggedInState = document.getElementById('loggedInState');
  const userNameDisplay = document.getElementById('userNameDisplay');

  if (!token) {
    // Show login/signup state
    if (authTabs) authTabs.style.display = 'flex';
    if (loggedInState) loggedInState.style.display = 'none';
    switchAuthTab('login');
    return;
  }

  try {
    // Verify token with backend
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      // User is logged in
      if (authTabs) authTabs.style.display = 'none';
      if (loginForm) loginForm.style.display = 'none';

      if (loggedInState) {
        loggedInState.style.display = 'block';
        userNameDisplay.innerText = data.data.name;
      }
    } else {
      // Token is invalid
      localStorage.removeItem('token');
      checkAuthStatus();
    }
  } catch (error) {
    console.error('Error fetching auth status:', error);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  closeAuthModal();
  checkAuthStatus();
}

// ===== DATABASE / API LOGIC =====
async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    if (data.success) {
      allProducts = data.data.map(p => {
        if (p.description && p.description.includes('<!--[GF]-->')) {
          p.glutenFree = true;
          p.description = p.description.replace(/ ?<!--\[GF\]-->/g, '');
        }
        if (p.description && p.description.includes('<!--[IMAGES:')) {
          const match = p.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
          if (match && match[1]) {
            try { p.images = JSON.parse(match[1]); } catch (e) { }
            p.description = p.description.replace(match[0], '');
          }
        }
        return p;
      });
      if (!window.location.pathname.includes('product.html')) {
        renderProducts();
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

async function loadSingleProductPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    window.location.href = 'index.html';
    return;
  }
  try {
    const res = await fetch(`${API_URL}/products/${slug}`);
    const data = await res.json();
    if (data.success) {
      currentProductData = data.data;
      if (currentProductData.description && currentProductData.description.includes('<!--[GF]-->')) {
        currentProductData.glutenFree = true;
        currentProductData.description = currentProductData.description.replace(/ ?<!--\[GF\]-->/g, '');
      }
      if (currentProductData.description && currentProductData.description.includes('<!--[IMAGES:')) {
        const match = currentProductData.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
        if (match && match[1]) {
          try { currentProductData.images = JSON.parse(match[1]); } catch (e) { }
          currentProductData.description = currentProductData.description.replace(match[0], '');
        }
      }
      currentSelectedFlavorIndex = 0;
      currentSelectedSizeIndex = 0;
      renderSingleProductPage();
    } else {
      document.getElementById('singleProductContainer').innerHTML = '<div style="text-align: center; color: white; padding: 100px 0;"><h2>Product not found.</h2><a href="index.html" class="btn-primary" style="margin-top: 20px; display: inline-flex;">Go Back Home</a></div>';
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
}

function selectPageFlavor(index) {
  currentSelectedFlavorIndex = index;
  renderSingleProductPage();
}

function selectPageSize(index) {
  currentSelectedSizeIndex = index;

  // If the new size has restricted flavors, ensure a valid flavor is selected
  const size = currentProductData.sizes[index];
  if (size && size.allowedFlavors && size.allowedFlavors.length > 0) {
    const currentFlavor = currentProductData.flavors[currentSelectedFlavorIndex];
    if (!currentFlavor || !size.allowedFlavors.includes(currentFlavor.name)) {
      const firstAllowedIndex = currentProductData.flavors.findIndex(f => size.allowedFlavors.includes(f.name));
      if (firstAllowedIndex !== -1) {
        currentSelectedFlavorIndex = firstAllowedIndex;
      }
    }
  }

  renderSingleProductPage();
}

function renderSingleProductPage() {
  const container = document.getElementById("singleProductContainer");
  if (!container || !currentProductData) return;

  const product = currentProductData;
  const flavor = product.flavors[currentSelectedFlavorIndex];

  const size = (product.sizes && product.sizes.length > 0) ? product.sizes[currentSelectedSizeIndex] : null;
  const currentPrice = size ? size.price : product.price;
  const currentOldPrice = size && size.oldPrice ? size.oldPrice : (product.oldPrice || currentPrice);
  const currentWeight = size ? size.weight : '';

  const allowedFlavors = (size && size.allowedFlavors && size.allowedFlavors.length > 0) ? size.allowedFlavors : null;

  // Combine active flavor image with any additional product images
  currentGalleryImages = [flavor.image, ...(product.images || [])].filter(Boolean);
  currentGalleryIndex = 0;

  let galleryArrows = '';
  if (currentGalleryImages.length > 1) {
    galleryArrows = `
      <button class="gallery-arrow left" onclick="navigateGallery(-1, event)">&#10094;</button>
      <button class="gallery-arrow right" onclick="navigateGallery(1, event)">&#10095;</button>
    `;
  }

  const galleryHTML = currentGalleryImages.length > 1 ? `
    <div class="thumbnail-gallery">
      ${currentGalleryImages.map((img, idx) => `
        <img src="${img}" class="thumbnail-img" 
             onclick="setGalleryImage(${idx})" 
             style="width: 70px; height: 70px; object-fit: contain; background: #0e0e0e; border-radius: 6px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--accent)' : 'transparent'};">
      `).join('')}
    </div>
  ` : '';

  const flavorPills = product.flavors.map((f, i) => {
    if (allowedFlavors && !allowedFlavors.includes(f.name)) return ''; // Hide flavor if not allowed for this size
    return `<button class="flavor-pill ${i === currentSelectedFlavorIndex ? 'active' : ''}" onclick="selectPageFlavor(${i})">
      ${f.name}
    </button>`;
  }).join("");

  const sizePills = (product.sizes && product.sizes.length > 0) ? product.sizes.map((s, i) => `
    <button class="flavor-pill ${i === currentSelectedSizeIndex ? 'active' : ''}" onclick="selectPageSize(${i})">
      ${s.weight}
    </button>
  `).join("") : "";

  const nutritionList = product.nutritionalFacts.map(fact => `<li>${fact}</li>`).join("");
  document.title = `${product.name} | Living Result`;

  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <a href="index.html#products" style="color: var(--text-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; transition: color 0.3s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-muted)'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Shop
      </a>
    </div>
    <div class="modal-grid" style="position: relative; background: var(--bg-secondary); padding: 40px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
      <button class="modal-close" onclick="window.location.href='index.html#products'" title="Go Back">&times;</button>
      <div class="modal-image-col">
        <div class="main-image-wrapper" onmousemove="handleImageZoom(event, this)" onmouseleave="resetImageZoom(this)" style="position: relative;">
          ${galleryArrows}
          <img id="mainModalImage" src="${flavor.image}" alt="${product.name}" onclick="openImageLightbox(this.src)" style="cursor: zoom-in;" title="Click to zoom">
        </div>
        ${galleryHTML}
        <div class="image-disclaimer">
          All images are AI-generated and inspired. The actual product tub may not look exactly the same.
        </div>
        <span class="stock-badge ${flavor.inStock ? 'in-stock' : 'out-of-stock'}">${flavor.inStock ? 'In Stock' : 'Out of Stock'}</span>
      </div>
      <div class="modal-info-col">
        <h1 style="font-family: var(--font-heading); font-size: 32px; margin-bottom: 10px; color: var(--text-primary); text-transform: uppercase;">${product.name}</h1>
        ${product.glutenFree ? `<span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(46, 204, 64, 0.2); color: var(--green); border: 1px solid var(--green); margin-bottom: 15px;">🌾 Gluten Free</span>` : ''}
          <div class="modal-price" style="margin-bottom: 5px;">₹${currentPrice.toLocaleString()} ${currentOldPrice > currentPrice ? `<span style="font-size: 14px; text-decoration: line-through; color: var(--text-muted); font-weight: normal; margin-left: 10px;">₹${currentOldPrice.toLocaleString()}</span>` : ''}</div>
          ${currentWeight ? `<div class="modal-weight" style="color: var(--accent); font-weight: 600; font-size: 14px; margin-bottom: 20px;">Weight: ${currentWeight}</div>` : ''}
          ${sizePills ? `<div class="flavor-selector" style="margin-bottom:15px;"><span class="flavor-label">Select Size:</span><div class="flavor-pills">${sizePills}</div></div>` : ''}
        <div class="flavor-selector"><span class="flavor-label">Select Flavor:</span><div class="flavor-pills">${flavorPills}</div></div>
        <div style="margin: 30px 0; display: flex; flex-direction: column; gap: 12px;">
          ${flavor.inStock
      ? `<div style="display: flex; gap: 10px; align-items: center;">
                <div class="qty-control">
                  <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
                  <span class="qty-num" id="modalQty">1</span>
                  <button class="qty-btn" onclick="changeModalQty(1)">+</button>
                </div>
                <button onclick="addToCartFromPage()" class="btn-add-cart" style="flex:1; padding: 12px 16px;">Add to Cart</button>
              </div>`
      : `<button class="btn-primary" style="width: 100%; justify-content: center; padding: 18px; background: var(--border); color: var(--text-muted); cursor: not-allowed;">Out of Stock</button>`}
        </div>
        <div class="modal-tabs">
          <div class="modal-tab active" onclick="switchModalTab('desc')">About</div>
          <div class="modal-tab" onclick="switchModalTab('nutrition')">Nutritional Facts</div>
          <div class="modal-tab" onclick="switchModalTab('ingredients')">Ingredients</div>
        <div class="modal-tab" onclick="switchModalTab('reviews')">Reviews (${product.numReviews || product.reviews || 0})</div>
        </div>
        <div class="modal-tab-content active" id="tab-desc"><p>${product.description}</p></div>
        <div class="modal-tab-content" id="tab-nutrition"><ul>${nutritionList}</ul></div>
        <div class="modal-tab-content" id="tab-ingredients"><p>${product.ingredients}</p></div>
      <div class="modal-tab-content" id="tab-reviews">
        <div class="reviews-container">
          ${renderReviews(product)}
          <div style="margin-top: 30px; border-top: 1px solid var(--border); padding-top: 20px;">
            <h4 style="margin-bottom: 15px; color: var(--text-primary); font-family: var(--font-heading); text-transform: uppercase;">Write a Review</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <select id="reviewRating" style="padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); color: white; border-radius: 6px;">
                <option value="5">5 - Excellent (★★★★★)</option>
                <option value="4">4 - Very Good (★★★★☆)</option>
                <option value="3">3 - Average (★★★☆☆)</option>
                <option value="2">2 - Poor (★★☆☆☆)</option>
                <option value="1">1 - Terrible (★☆☆☆☆)</option>
              </select>
              <input type="text" id="reviewName" placeholder="Your Name" style="padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); color: white; border-radius: 6px;">
              <textarea id="reviewComment" rows="3" placeholder="Your Review..." style="padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); color: white; border-radius: 6px;"></textarea>
              <button onclick="submitReview('${product._id || product.id}')" class="btn-primary" style="justify-content: center; margin-top: 5px;">Submit Review</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
}

// Function to navigate gallery with arrows
function navigateGallery(direction, event) {
  if (event) event.stopPropagation();
  currentGalleryIndex += direction;
  if (currentGalleryIndex < 0) currentGalleryIndex = currentGalleryImages.length - 1;
  if (currentGalleryIndex >= currentGalleryImages.length) currentGalleryIndex = 0;
  setGalleryImage(currentGalleryIndex);
}

// Function to swap main image when a thumbnail or arrow is clicked
function setGalleryImage(index) {
  currentGalleryIndex = index;
  document.getElementById('mainModalImage').src = currentGalleryImages[index];
  const thumbnails = document.querySelectorAll('.thumbnail-img');
  thumbnails.forEach((el, idx) => el.style.borderColor = idx === index ? 'var(--accent)' : 'transparent');
  if (thumbnails[index]) thumbnails[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function addToCartFromPage() {
  const qtyEl = document.getElementById('modalQty');
  const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
  const product = currentProductData;
  const flavorIndex = currentSelectedFlavorIndex;
  const flavor = product.flavors && product.flavors.length > 0 ? product.flavors[flavorIndex] : { name: '', image: '' };

  const sizeIndex = currentSelectedSizeIndex || 0;
  const size = product.sizes && product.sizes.length > 0 ? product.sizes[sizeIndex] : null;
  const price = size ? size.price : product.price;
  const weight = size ? size.weight : '';

  const key = `${product.id}-${flavorIndex}-${sizeIndex}`;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty += qty; }
  else { cart.push({ key, productId: product.id, flavorIndex, sizeIndex, name: product.name, flavorName: flavor.name, weight: weight, price: price, image: flavor.image, qty }); }

  saveCart();
  updateCartUI();
  updateFloatingCart();
  toggleCart();
}

// ===== REVIEWS LOGIC =====
function renderReviews(product) {
  if (!product.reviewList || product.reviewList.length === 0) {
    return `<p style="color: var(--text-muted); font-style: italic;">No reviews yet. Be the first to review!</p>`;
  }
  return product.reviewList.map(r => `
    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <strong style="color: var(--text-primary);">${r.name}</strong>
        <span style="color: #f5a623; letter-spacing: 2px;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">${r.comment}</p>
    </div>
  `).join("");
}

async function submitReview(productId) {
  const rating = document.getElementById('reviewRating').value;
  const name = document.getElementById('reviewName').value;
  const comment = document.getElementById('reviewComment').value;

  if (!name || !comment) return alert("Please fill in your name and review.");

  try {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating: Number(rating), comment })
    });
    const data = await res.json();
    if (data.success) {
      alert("Review submitted successfully!");
      loadSingleProductPage(); // Reload the product
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    alert("Network Error");
  }
}