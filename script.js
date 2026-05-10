// =====================================================
// PRODUCT DATA — Easy to add/remove/edit products here!
// =====================================================
// To add a new product: copy one object, change the values.
// To remove: just delete the object from the array.
// Merged product lookup (all categories)
let allProducts = [];
let allCombos = [];
let currentProductData = null;


// ===== RENDER A SINGLE PRODUCT CARD (reusable) =====
function renderProductCard(product) {
  const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);

  // Use the first flavor for image, but check all flavors for stock status
  const defaultFlavor = product.flavors[0];
  const isAnyFlavorInStock = product.flavors.some(f => f.inStock);

  const displayPrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : product.price;
  const displayOldPrice = product.sizes && product.sizes.length > 0 && product.sizes[0].oldPrice ? product.sizes[0].oldPrice : (product.oldPrice || displayPrice);
  const displayWeight = product.sizes && product.sizes.length > 0 ? product.sizes[0].weight : '';
  const discountText = displayOldPrice > displayPrice ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100) + '% OFF' : (product.discount ? product.discount + '% OFF' : '');
  
  // FOMO Logic: Savings & Dynamic Viewers
  const savings = displayOldPrice > displayPrice ? displayOldPrice - displayPrice : 0;
  const savingsHTML = savings > 0 ? `<div style="font-size: 12px; color: var(--green); font-weight: 600; margin-top: 4px;">You Save ₹${savings.toLocaleString()}</div>` : '';
  
  // Dynamic Viewers Count (Initial State)
  const viewersCount = Math.floor(Math.random() * 20) + 4; // random between 4 and 23
  const showViewers = Math.random() > 0.15; // 85% chance to show initially

  return `
    <div class="product-card" id="product-${product.slug}" onclick="handleProductCardClick('${product.slug}', '${product._id || ''}')" style="cursor: pointer;">
      <div class="product-image">
        <img src="${defaultFlavor.image}" alt="${product.name}" loading="lazy">
        <span class="stock-badge ${isAnyFlavorInStock ? 'in-stock' : 'out-of-stock'}">
          ${isAnyFlavorInStock ? 'In Stock' : 'Out of Stock'}
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
        ${savingsHTML}
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${product.numReviews || product.reviews || 0})</span>
        </div>
        ${product.showScarcity !== false && product.stockLeft > 0 ? `<div class="scarcity-text" style="color: var(--accent); font-size: 12px; font-weight: 600; margin-top: 8px; margin-bottom: 4px;">🔥 Hurry, only ${product.stockLeft} left!</div>` : ''}
        <div class="dynamic-viewers-count" style="font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; margin-top: 6px; transition: opacity 0.5s ease; opacity: ${showViewers ? 1 : 0};">👀 <span>${viewersCount}</span> people viewing this</div>
      </div>
    </div>
  `;
}

// ===== RENDER A SINGLE COMBO CARD =====
function renderComboCard(combo) {
  const includesText = combo.products.map(p => `• ${p.name} (x${p.quantity})`).join('<br>');
  
  const displayWeight = combo.sizes && combo.sizes.length > 0 ? combo.sizes[0].weight : (combo.totalWeight ? combo.totalWeight.display : '');
  const flavorCount = combo.flavors && combo.flavors.length > 0 ? combo.flavors.length : 0;
  const flavorText = flavorCount > 0 ? `<span class="product-flavor" style="margin-bottom: 0;">${flavorCount} Flavor${flavorCount > 1 ? 's' : ''}</span>` : '';
  const weightText = displayWeight ? `<span class="product-weight" style="font-size: 13px; color: var(--accent); font-weight: 600;">${displayWeight}</span>` : '';
  const separator = flavorText && weightText ? `<span style="color: var(--text-muted); opacity: 0.5;">|</span>` : '';
  
  const displayPrice = combo.sizes && combo.sizes.length > 0 ? combo.sizes[0].price : combo.finalPrice;
  const displayOldPrice = combo.sizes && combo.sizes.length > 0 && combo.sizes[0].oldPrice ? combo.sizes[0].oldPrice : combo.autoCalculatedMrp;
  const savings = displayOldPrice > displayPrice ? displayOldPrice - displayPrice : combo.totalSavings;
  const imgUrl = (combo.images && combo.images.length > 0) ? combo.images[0] : (combo.comboBanner || 'images/logo.png');

  return `
    <div class="product-card combo-card" id="combo-${combo.comboSlug}" onclick="handleComboCardClick('${combo.comboSlug}')" style="cursor: pointer;">
      <div class="product-image" style="background: #000; padding: 0;">
        <img src="${imgUrl}" alt="${combo.comboName}" loading="lazy" style="height: 100%; width: 100%; object-fit: cover;">
        <span class="stock-badge in-stock" style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: #fff;">💎 Premium Stack</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${combo.comboName}</h3>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          ${flavorText}
          ${separator}
          ${weightText}
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
          <strong style="color: #fff; text-transform: uppercase; letter-spacing: 1px;">Stack Includes:</strong><br> ${includesText}
        </div>
        <div class="combo-pricing-box">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
            <span>Individual MRP</span>
            <span style="text-decoration: line-through;">₹${displayOldPrice.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 4px;">
            <span>Bundle Price</span>
            <span style="color: #9b59b6;">₹${displayPrice.toLocaleString()}</span>
          </div>
          <div style="text-align: right; font-size: 13px; color: var(--green); font-weight: 700; margin-top: 6px;">
            🔥 YOU SAVE ₹${savings.toLocaleString()}
          </div>
        </div>
        <button onclick="event.stopPropagation(); openComboFlavorSelector('${combo.comboSlug}')" class="btn-primary btn-combo" style="width: 100%; justify-content: center; padding: 12px; font-size: 14px;">Claim This Stack</button>
      </div>
    </div>
  `;
}

function trackProductViewEvent(productId, productName = "Unknown Product", source = "unknown", price = 0) {
  if (!productId) return;
  try {
    fetch(`${API_URL}/products/${productId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ source, ts: Date.now() })
    }).catch(() => { });

    if (typeof window.gtag === "function") {
      // Standard GA4 Ecommerce Event
      window.gtag("event", "view_item", {
        currency: "INR",
        value: price,
        items: [{
          item_id: productId,
          item_name: productName
        }]
      });
    }
  } catch (_) { }
}

function handleProductCardClick(slug, productId) {
  const product = allProducts.find(p => p._id === productId || p.slug === slug);
  const productName = product ? product.name : "Unknown Product";
  const price = product ? (product.sizes && product.sizes.length > 0 ? product.sizes[0].price : product.price) : 0;
  sessionStorage.setItem('lr_lastViewedProduct', slug); // Save exact product to scroll back to
  trackProductViewEvent(productId, productName, "card_click", price);
  window.location.href = `product.html?slug=${slug}`;
}

function handleComboCardClick(slug) {
  sessionStorage.setItem('lr_lastViewedProduct', slug);
  window.location.href = `product.html?slug=${slug}&combo=true`;
}

// ===== STATE FOR PRODUCT CATEGORY =====
let currentCategory = sessionStorage.getItem('lr_currentCategory') || "unique";
let currentSubCategory = sessionStorage.getItem('lr_currentSubCategory') || "all";

function switchSubCategory(subCat) {
  currentSubCategory = subCat;
  sessionStorage.setItem('lr_currentSubCategory', subCat);
  document.querySelectorAll('.subcat-pill').forEach(el => el.classList.remove('active'));
  const activePill = document.getElementById('subcat-' + subCat.replace(/\s+/g, ''));
  if (activePill) activePill.classList.add('active');
  renderProducts();
}

function switchProductCategory(category) {
  currentCategory = category;
  sessionStorage.setItem('lr_currentCategory', category);

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
  
  const subcatContainer = document.getElementById('common-subcategories');
  if (subcatContainer) {
      subcatContainer.style.display = category === 'common' ? 'flex' : 'none';
      if (category === 'common') {
          document.querySelectorAll('.subcat-pill').forEach(el => el.classList.remove('active'));
          const activePill = document.getElementById('subcat-' + currentSubCategory.replace(/\s+/g, ''));
          if (activePill) activePill.classList.add('active');
      }
  }

  renderProducts();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  // Special rendering logic if the Combos tab is active
  if (currentCategory === 'combos') {
    const html = allCombos.map(renderComboCard).join("");
    const scrollContainer = document.getElementById("productsScroll");
    if (scrollContainer) scrollContainer.innerHTML = html;
    const gridContainer = document.getElementById("productsGrid");
    if (gridContainer) gridContainer.innerHTML = html;
    return;
  }

  const filteredProducts = allProducts.filter(p => {
    if (p.category !== currentCategory) return false;
    if (currentCategory === 'common' && currentSubCategory !== 'all') {
        return p.subCategory === currentSubCategory;
    }
    return true;
  });

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

// FIX: Clear out old cart items that are using the old numeric IDs instead of MongoDB ObjectIds
if (cart.some(item => typeof item.productId !== 'string')) {
  cart = [];
  localStorage.setItem('livingResultCart', JSON.stringify(cart));
}

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

function clearCart() {
  cart = [];
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
  const itemsHTML = cart.map(item => {
    let subText = `${item.flavorName}${item.weight ? ' | ' + item.weight : ''}`;
    if (item.isCombo && item.comboSelections && item.comboSelections.length > 0) {
      subText = item.comboSelections.map(s => `<span style="color:#aaa;">${s.name}:</span> ${s.flavor}`).join('<br>');
    }
    return `
    <div style="display:flex; gap:12px; padding:16px 0; border-bottom:1px solid var(--border);">
      <img src="${item.image}" style="width:60px;height:60px;object-fit:contain;background:#0e0e0e;border-radius:6px;padding:4px;" alt="${item.name}">
      <div style="flex:1;">
        <div style="font-weight:600;font-size:13px;margin-bottom:2px;">${item.name}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${subText}</div>
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
    `;
  }).join('');

  // FOMO Cart Elements (Urgency + Premium Offer)
  const fomoCartHTML = `
    <div style="background: rgba(255, 106, 0, 0.05); border: 1px solid rgba(255, 106, 0, 0.2); padding: 12px; border-radius: 6px; margin-bottom: 16px; text-align: center;">
      <div style="color: #fff; font-size: 13px; font-weight: bold; margin-bottom: 4px;">🔥 Premium Shaker Worth ₹500 Available at Just ₹50</div>
      <div style="color: var(--text-muted); font-size: 11px; font-style: italic;">Exclusive launch offer for first 10 customers.</div>
    </div>
    <div style="color: #e74c3c; font-size: 12px; font-weight: 600; text-align: center; margin-bottom: 16px;">
      ⚠️ Your cart items are in high demand. Launch pricing is currently active.
    </div>
  `;

  cartBody.innerHTML = `
    ${itemsHTML}
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
      ${fomoCartHTML}
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:15px;font-weight:600;">Total</span>
        <span style="font-size:18px;font-weight:700;color:var(--accent);">₹${total.toLocaleString()}</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted); text-align: right; margin-bottom: 16px; font-style: italic;">
        *Delivery charges will apply accordingly.
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="clearCart()" class="btn-outline" style="width: 30%; justify-content:center; padding:16px; font-size:14px; text-align: center;">
          Clear All
        </button>
        <button onclick="startCartCheckout()" class="btn-primary" style="flex: 1; justify-content:center;padding:16px;font-size:15px;">
          Proceed to Checkout
        </button>
      </div>
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
        </div>
        <div style="margin-top: 10px; text-align: right; font-size: 11px; color: var(--text-muted); font-style: italic;">
          *Delivery charges will apply accordingly.
        </div>`;
      
      startCheckoutTimer();
    }
  }
}

let checkoutTimerInterval;
function startCheckoutTimer() {
  const timerEl = document.getElementById('checkoutTimerDisplay');
  if (!timerEl) return;
  
  let endTime = localStorage.getItem('lr_checkout_timer');
  if (!endTime || endTime < Date.now()) {
    const durationMins = window.lrFomoSettings ? (window.lrFomoSettings.timerDuration || 10) : 10;
    endTime = Date.now() + durationMins * 60 * 1000;
    localStorage.setItem('lr_checkout_timer', endTime);
  }
  
  clearInterval(checkoutTimerInterval);
  const updateTimer = () => {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      clearInterval(checkoutTimerInterval);
      timerEl.textContent = "00:00";
      localStorage.removeItem('lr_checkout_timer');
      return;
    }
    const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  };
  updateTimer();
  checkoutTimerInterval = setInterval(updateTimer, 1000);
}

function closeCheckoutModal(e) {
  if (e && e.target.id !== "checkoutModalOverlay" && !e.target.closest('.modal-close')) return;
  const overlay = document.getElementById("checkoutModalOverlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    clearInterval(checkoutTimerInterval);
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
  const email = document.getElementById("checkoutEmail").value;
  const address = document.getElementById("checkoutAddress").value;
  const couponEl = document.getElementById("checkoutCoupon");
  const coupon = couponEl ? couponEl.value.trim() : "";

  // Close checkout modal
  const checkoutOverlay = document.getElementById("checkoutModalOverlay");
  if (checkoutOverlay) checkoutOverlay.classList.remove("active");

  // --- CRITICAL FIX FOR PC POPUP BLOCKERS ---
  // We must open the new tab synchronously BEFORE any 'await' calls, otherwise Chrome blocks it!
  const whatsappWindow = window.open('about:blank', '_blank');

  try {
    // --- NEW: PHASE 3 - CREATE PENDING ORDER ON BACKEND ---
    const orderPayload = {
      customerDetails: { name, phone, email, address, coupon },
      products: cart.map(item => {
        if (item.isCombo) {
          return { comboId: item.comboId, isCombo: true, name: item.name, flavor: item.flavorName, comboSelections: item.comboSelections, weight: item.weight || '', quantity: item.qty, price: item.price };
        }
        return {
          productId: item.productId,
          name: item.name,
          flavor: item.flavorName,
          weight: item.weight || '',
          quantity: item.qty,
          price: item.price
        };
      }),
      totalAmount: pendingOrderAmount
    };

    const orderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.message || 'Failed to create pending order on server');
    }

    const generatedOrderId = orderData.data.orderId;
    // ------------------------------------------------------

    // PREPARE WHATSAPP MESSAGE
    let message = `🛒 *NEW ORDER — Living Result*\n`;
    message += `🔖 *Order ID:* ${generatedOrderId}\n\n`;
    message += `📦 *Items:*\n`;

    cart.forEach(item => {
      if (item.isCombo && item.comboSelections) {
        message += `• ${item.name} × ${item.qty} — ₹${(item.price * item.qty).toLocaleString()}\n`;
        item.comboSelections.forEach(s => {
          message += `   ↳ ${s.name} (${s.flavor}) x${s.quantity * item.qty}\n`;
        });
      } else {
        const details = [item.flavorName, item.weight].filter(Boolean).join(', ');
        message += `• ${item.name} (${details}) × ${item.qty} — ₹${(item.price * item.qty).toLocaleString()}\n`;
      }
    });

    message += `\n💰 *Total: ₹${pendingOrderAmount.toLocaleString()}*\n`;
    message += `_(Delivery charges will apply accordingly)_\n\n`;
    message += `👤 *Name:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    message += `✉️ *Email:* ${email}\n`;
    message += `📍 *Address:* ${address}\n\n`;
    if (coupon) {
      message += `🎟️ *Coupon:* ${coupon}\n\n`;
    }
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

    // --- NEW: LOG INTENT TO GOOGLE SHEETS ---
    // Replace the URL below with your Google Apps Script Web App URL
    const GOOGLE_WEB_APP_URL = (window.APP_CONFIG && window.APP_CONFIG.googleWebAppUrl) || "";

    if (GOOGLE_WEB_APP_URL) {
      const sheetPayload = {
        timestamp: new Date().toLocaleString(),
        name: name,
        phone: phone,
        email: email,
        address: address,
        coupon: coupon,
        total: pendingOrderAmount,
        items: cart.map(i => `${i.name} (${i.flavorName}) x${i.qty}`).join(' | ')
      };

      fetch(GOOGLE_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Prevents CORS errors from blocking the redirect
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload)
      }).catch(err => console.error("Sheet logging failed:", err));
    }

    // SUCCESS ACTIONS
    cart = [];
    saveCart(); // <--- FIX: Saves the empty cart to LocalStorage permanently
    updateCartUI();
    updateFloatingCart();

    // Reset form
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) checkoutForm.reset();

    // Show success modal
    const successOverlay = document.getElementById("successModalOverlay");
    if (successOverlay) {
      successOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    // REDIRECT THE ALREADY OPENED TAB TO WHATSAPP
    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappLink;
    } else {
      // Fallback if browser completely blocked the initial open
      window.location.href = whatsappLink;
    }

  } catch (error) {
    if (whatsappWindow) whatsappWindow.close(); // Close the blank tab if an error occurs
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
  // Check for admin bypass token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const bypassToken = urlParams.get('admin_bypass');
  if (bypassToken) {
    localStorage.setItem('adminToken', bypassToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  checkAuthStatus(); // Check if user is logged in
  updateCartUI();
  updateFloatingCart();
  fetchAndDisplaySettings();
  startGlobalRefreshPolling();
  initSocialProofPopups();
  initEmotionalMessaging();
  initExitIntentPopup();
  initDynamicViewers();

  fetchCombos();
  fetchProducts().then(() => {
    if (document.getElementById('singleProductContainer')) {
      loadSingleProductPage();
    } else {
      switchProductCategory(currentCategory); // Restore active category tab
      if (currentCategory === 'common') switchSubCategory(currentSubCategory); // Restore subcategory
      setupAnimations();
      
      // Return user to their exact scroll position/product
      const lastViewed = sessionStorage.getItem('lr_lastViewedProduct');
      if (lastViewed) {
        setTimeout(() => {
          const el = document.getElementById('product-' + lastViewed);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = "box-shadow 0.5s ease";
            el.style.boxShadow = "0 0 20px var(--accent)";
            setTimeout(() => el.style.boxShadow = "none", 1500);
          }
          sessionStorage.removeItem('lr_lastViewedProduct');
        }, 300);
      }
    }
  });
});

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = (window.APP_CONFIG && window.APP_CONFIG.apiUrl) || (isLocal ? 'http://localhost:5000/api' : 'https://living-result-backend.onrender.com/api');

// ===== GLOBAL REFRESH POLLING =====
let currentSiteVersion = null;
async function checkSiteVersion() {
  try {
    const res = await fetch(`${API_URL}/settings/version`, { cache: 'no-store' });
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
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data) {
      
      // Handle Launch Status (Defaults to true/launched so live site doesn't break)
      const preLaunchOverlay = document.getElementById('preLaunchOverlay');
      let isAdmin = !!localStorage.getItem('adminToken');

      // Bulletproof Fallback: Verify admin status via cookie if localStorage is empty
      if (data.data.isLaunched === false && !isAdmin) {
          try {
              const authRes = await fetch(`${API_URL}/auth/me`, { credentials: 'include', cache: 'no-store' });
              const authData = await authRes.json();
              if (authData.success && authData.data && authData.data.role === 'admin') {
                  isAdmin = true;
              }
          } catch (e) { console.warn("Admin verify failed", e); }
      }

      if (preLaunchOverlay) {
          if (data.data.isLaunched === false && !isAdmin) {
              // Override inner HTML to show Maintenance Break and remove any old UI/animations
              preLaunchOverlay.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #0a0a0a; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.5); max-width: 500px; margin: auto;">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <h1 style="color: var(--text-primary); font-family: var(--font-heading); text-transform: uppercase; margin-bottom: 20px; font-size: 28px;">Maintenance <span style="color: var(--accent);">Break</span></h1>
                  <p style="color: var(--text-secondary); font-size: 16px; line-height: 1.5;">We are currently pushing updates to improve your experience.<br>Please check back shortly.</p>
                </div>
              `;
              preLaunchOverlay.style.display = 'flex';
              preLaunchOverlay.style.alignItems = 'center';
              preLaunchOverlay.style.justifyContent = 'center';
              preLaunchOverlay.style.background = 'rgba(0,0,0,0.95)';
              preLaunchOverlay.style.zIndex = '999999';
              document.body.style.overflow = 'hidden';
          } else {
              preLaunchOverlay.style.display = 'none';
              preLaunchOverlay.innerHTML = ''; // Clear it out when launched
              document.body.style.overflow = '';

              // Show a warning badge to the admin so they don't forget the site is in maintenance
              if (data.data.isLaunched === false && isAdmin && !document.getElementById('adminMaintenanceBadge')) {
                  const badge = document.createElement('div');
                  badge.id = 'adminMaintenanceBadge';
                  badge.style.position = 'fixed';
                  badge.style.bottom = '20px';
                  badge.style.left = '20px';
                  badge.style.background = '#e74c3c';
                  badge.style.color = '#fff';
                  badge.style.padding = '10px 16px';
                  badge.style.borderRadius = '8px';
                  badge.style.fontSize = '13px';
                  badge.style.fontWeight = 'bold';
                  badge.style.zIndex = '999999';
                  badge.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
                  badge.innerHTML = '🔧 Admin Bypass: Site is in Maintenance Mode';
                  document.body.appendChild(badge);
                  } else if (data.data.isLaunched !== false) {
                      const existingBadge = document.getElementById('adminMaintenanceBadge');
                      if (existingBadge) existingBadge.remove();
              }
          }
      }

      if (data.data.fomo) window.lrFomoSettings = data.data.fomo;

      const noticeStrip = data.data.noticeStrip || {};
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
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
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
  const authTabs = document.getElementById('authTabs');
  const loginForm = document.getElementById('loginForm');
  const loggedInState = document.getElementById('loggedInState');
  const userNameDisplay = document.getElementById('userNameDisplay');

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include'
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
      if (authTabs) authTabs.style.display = 'flex';
      if (loggedInState) loggedInState.style.display = 'none';
      switchAuthTab('login');
    }
  } catch (error) {
    console.error('Error fetching auth status:', error);
    if (authTabs) authTabs.style.display = 'flex';
    if (loggedInState) loggedInState.style.display = 'none';
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    closeAuthModal();
    checkAuthStatus();
  }
}

// ===== DATABASE / API LOGIC =====
async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      allProducts = data.data.map(p => {
        if (p.sizes) p.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));
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
        if (p.description && p.description.includes('<!--[SUBCAT:')) {
          const match = p.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
          if (match && match[1]) {
            p.subCategory = match[1];
            p.description = p.description.replace(match[0], '');
          }
        }
        return p;
      });
      if (!document.getElementById('singleProductContainer')) {
        renderProducts();
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

async function fetchCombos() {
  try {
    const res = await fetch(`${API_URL}/combos`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      allCombos = data.data;
      if (!document.getElementById('singleProductContainer')) {
        renderProducts(); // Refresh in case they are on the combos tab
      }
    }
  } catch (error) { console.error('Error fetching combos:', error); }
}

async function loadSingleProductPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const isCombo = params.get('combo') === 'true';
  if (!slug) {
    window.location.href = 'index.html';
    return;
  }
  try {
    if (isCombo) {
      const res = await fetch(`${API_URL}/combos`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        allCombos = data.data;
        const combo = allCombos.find(c => c.comboSlug === slug);
        if (combo) {
            currentProductData = {
                _id: combo._id,
                id: combo._id,
                name: combo.comboName,
                slug: combo.comboSlug,
                price: combo.finalPrice,
                oldPrice: combo.autoCalculatedMrp,
                discount: Math.round(((combo.autoCalculatedMrp - combo.finalPrice) / combo.autoCalculatedMrp) * 100) || 0,
                category: 'combos',
                rating: 5,
                numReviews: 24,
                stockLeft: 99,
                bestSeller: true,
                showScarcity: true,
                glutenFree: false,
                description: combo.description || '',
                ingredients: combo.products.map(p => `• ${p.name} (x${p.quantity})`).join('\n'),
                nutritionalFacts: ['Please refer to individual product labels for detailed nutritional facts.'],
                flavors: combo.flavors && combo.flavors.length > 0 ? combo.flavors : [{ name: 'Premium Bundle', image: (combo.images && combo.images.length > 0 ? combo.images[0] : combo.comboBanner) || 'images/logo.png', inStock: true }],
                sizes: combo.sizes || [],
                images: combo.images && combo.images.length > 0 ? combo.images : (combo.comboBanner ? [combo.comboBanner] : []),
                isCombo: true,
                comboProducts: combo.products
            };
            if (currentProductData.sizes) currentProductData.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));
            currentSelectedFlavorIndex = 0;
            currentSelectedSizeIndex = 0;
            renderSingleProductPage();
            return;
        }
      }
    }

    const res = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      currentProductData = data.data;
      if (currentProductData.sizes) currentProductData.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));
      const displayPrice = (currentProductData.sizes && currentProductData.sizes.length > 0) ? currentProductData.sizes[0].price : currentProductData.price;
      trackProductViewEvent(currentProductData._id, currentProductData.name, "product_page", displayPrice);
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
      if (currentProductData.description && currentProductData.description.includes('<!--[SUBCAT:')) {
        const match = currentProductData.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
        if (match && match[1]) {
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

// ===== SHARE PRODUCT LOGIC =====
async function shareProduct(url, title, btnEl) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "share", {
      method: navigator.share ? "native_share" : "copy_link",
      content_type: "product",
      item_id: title
    });
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: `Check out ${title} on Living Result!`,
        url: url
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      const originalHTML = btnEl.innerHTML;
      btnEl.innerHTML = '<span style="font-size:12px;font-weight:600;padding:0 2px;">Link Copied!</span>';
      setTimeout(() => { btnEl.innerHTML = originalHTML; }, 2000);
    } catch (err) {
      console.error('Copy failed', err);
      alert('Failed to copy link. Please manually copy the URL from your browser.');
    }
  }
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

  // FOMO Logic
  const savings = currentOldPrice > currentPrice ? currentOldPrice - currentPrice : 0;
  const savingsHTML = savings > 0 ? `<div style="font-size: 13px; color: var(--green); font-weight: 600; margin-bottom: 15px;">You Save ₹${savings.toLocaleString()}!</div>` : '';
  const viewersCount = Math.floor(Math.random() * 20) + 4;
  const showViewers = Math.random() > 0.15;

  // Market Comparison Logic
  const marketAvg = currentOldPrice > currentPrice ? currentOldPrice : Math.round(currentPrice * 1.35);
  const marketComparisonHTML = `
    <div class="market-comparison-card">
      <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; text-align: center; font-weight: 600;">Market Value Comparison</div>
      <table>
        <tr>
          <td style="color: var(--text-secondary);">Average Market Price</td>
          <td style="color: var(--text-secondary); text-align: right; text-decoration: line-through;">₹${marketAvg.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color: var(--accent); font-weight: bold; font-size: 16px;">Living Result Launch Price</td>
          <td style="color: var(--accent); text-align: right; font-weight: bold; font-size: 16px;">₹${currentPrice.toLocaleString()}</td>
        </tr>
      </table>
    </div>
  `;

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
    
    const isOutOfStock = !f.inStock;
    const outOfStockClass = isOutOfStock ? 'out-of-stock' : '';

    return `<button 
              class="flavor-pill ${i === currentSelectedFlavorIndex ? 'active' : ''} ${outOfStockClass}" 
              onclick="selectPageFlavor(${i})">
      ${f.name} ${isOutOfStock ? '<span class="sold-out-text">(Sold Out)</span>' : ''}
    </button>`;
  }).join("");

  const sizePills = (product.sizes && product.sizes.length > 0) ? product.sizes.map((s, i) => {
    const isOutOfStock = s.inStock === false;
    const outOfStockClass = isOutOfStock ? 'out-of-stock' : '';
    return `<button class="flavor-pill ${i === currentSelectedSizeIndex ? 'active' : ''} ${outOfStockClass}" onclick="selectPageSize(${i})">
      ${s.weight} ${isOutOfStock ? '<span class="sold-out-text">(Sold Out)</span>' : ''}
    </button>`;
  }).join("") : "";

  const nutritionList = product.nutritionalFacts.map(fact => `<li>${fact}</li>`).join("");
  document.title = `${product.name} | Living Result`;

  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <a href="index.html#products" style="color: var(--text-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; transition: color 0.3s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-muted)'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Shop
      </a>
    </div>
    <div class="modal-grid" style="position: relative; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
      <button class="modal-close" onclick="window.location.href='index.html#products'" title="Go Back">&times;</button>
      <div class="modal-image-col">
        <div class="main-image-wrapper" onmousemove="handleImageZoom(event, this)" onmouseleave="resetImageZoom(this)" ontouchstart="handleTouchStart(event)" ontouchend="handleTouchEnd(event)" style="position: relative;">
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
        <h1 style="font-family: var(--font-heading); font-size: 32px; margin-bottom: 10px; color: var(--text-primary); text-transform: uppercase; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
          ${product.name}
          <button onclick="shareProduct('${window.location.origin}/product.html?slug=${product.slug}', '${product.name.replace(/'/g, "\\'")}', this)" style="background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: 0.3s; display: flex; align-items: center; justify-content: center; width: fit-content;" onmouseover="this.style.color='var(--accent)'; this.style.borderColor='var(--accent)';" onmouseout="this.style.color='var(--text-muted)'; this.style.borderColor='var(--border)';" title="Share Product">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </h1>
        <div class="launch-pricing-badge">⚡ Introductory Launch Pricing Active</div>
        <div style="font-size: 12px; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Verified Independent Reseller
        </div>
        ${product.glutenFree ? `<span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(46, 204, 64, 0.2); color: var(--green); border: 1px solid var(--green); margin-bottom: 15px;">🌾 Gluten Free</span>` : ''}
          <div class="modal-price" style="margin-bottom: 5px;">₹${currentPrice.toLocaleString()} ${currentOldPrice > currentPrice ? `<span style="font-size: 14px; text-decoration: line-through; color: var(--text-muted); font-weight: normal; margin-left: 10px;">₹${currentOldPrice.toLocaleString()}</span>` : ''}</div>
          ${savingsHTML}
          <div class="dynamic-viewers-count" style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px; display: flex; align-items: center; gap: 6px; transition: opacity 0.5s ease; opacity: ${showViewers ? 1 : 0};">👀 <span>${viewersCount}</span> people viewing this right now</div>
          ${currentWeight ? `<div class="modal-weight" style="color: var(--accent); font-weight: 600; font-size: 14px; margin-bottom: 20px;">Weight: ${currentWeight}</div>` : ''}
          ${sizePills ? `<div class="flavor-selector" style="margin-bottom:15px;"><span class="flavor-label">Select Size:</span><div class="flavor-pills">${sizePills}</div></div>` : ''}
        <div class="flavor-selector"><span class="flavor-label">Select Flavor:</span><div class="flavor-pills">${flavorPills}</div></div>
        ${marketComparisonHTML}
        <div style="margin: 30px 0; display: flex; flex-direction: column; gap: 12px;">
          ${flavor.inStock && (!size || size.inStock !== false)
      ? `<div style="display: flex; gap: 10px; align-items: center;">
                <div class="qty-control">
                  <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
                  <span class="qty-num" id="modalQty">1</span>
                  <button class="qty-btn" onclick="changeModalQty(1)">+</button>
                </div>
                <button onclick="addToCartFromPage()" class="btn-add-cart" style="flex:1; padding: 12px 16px;">Add to Cart</button>
              </div>`
      : `<button class="btn-primary" style="width: 100%; justify-content: center; padding: 18px; background: var(--border); color: var(--text-muted); cursor: not-allowed;" disabled>Out of Stock</button>`}
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

// ===== GALLERY SWIPE LOGIC =====
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}

function handleSwipeGesture() {
  if (currentGalleryImages.length <= 1) return; // Skip if only 1 image

  const threshold = 50; // Minimum distance required to trigger a swipe

  // Calculate the swipe direction
  if (touchStartX - touchEndX > threshold) navigateGallery(1); // Swipe Left -> Next Image
  if (touchEndX - touchStartX > threshold) navigateGallery(-1); // Swipe Right -> Prev Image
}

let currentComboSelection = null;

function openComboFlavorSelector(comboSlug) {
    const combo = allCombos.find(c => c.comboSlug === comboSlug);
    if (!combo) return;

    currentComboSelection = combo;
    const container = document.getElementById('comboFlavorContainer');
    let html = '';
    
    // Combo's own sizes
    if (combo.sizes && combo.sizes.length > 0) {
        let sizeOptions = '';
        combo.sizes.forEach((s, index) => {
            if (s.inStock !== false) {
                sizeOptions += `<option value="${index}">${s.weight} - ₹${s.price.toLocaleString()}</option>`;
            }
        });
        if (sizeOptions) {
            html += `<div style="margin-bottom: 15px;"><label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 5px;">Combo Size</label><select id="combo-size-select" style="width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; color: #fff; font-family: inherit;">${sizeOptions}</select></div>`;
        }
    }
    
    // Combo's own flavors
    if (combo.flavors && combo.flavors.length > 0) {
        let flavorOptions = '';
        combo.flavors.forEach(f => {
            if (f.inStock !== false) {
                flavorOptions += `<option value="${f.name}">${f.name}</option>`;
            }
        });
        if (flavorOptions) {
            html += `<div style="margin-bottom: 15px;"><label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 5px;">Combo Flavor</label><select id="combo-flavor-select" style="width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; color: #fff; font-family: inherit;">${flavorOptions}</select></div>`;
        }
    }

    combo.products.forEach((p, index) => {
        const fullProd = allProducts.find(ap => ap._id === p._id);
        let options = '';
        if (fullProd && fullProd.flavors) {
            fullProd.flavors.forEach(f => {
                if (f.inStock) { options += `<option value="${f.name}">${f.name}</option>`; }
            });
        }
        if (!options) options = `<option value="Default">Default</option>`;

        html += `
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 5px;">Choose Flavor for ${p.name} (x${p.quantity})</label>
                <select id="combo-subflavor-${index}" style="width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; color: #fff; font-family: inherit;">
                    ${options}
                </select>
            </div>
        `;
    });

    container.innerHTML = html;
    const overlay = document.getElementById('comboFlavorModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeComboFlavorModal(e) {
    if (e && e.target.id !== "comboFlavorModalOverlay" && !e.target.closest('.modal-close')) return;
    const overlay = document.getElementById("comboFlavorModalOverlay");
    if (overlay) {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function confirmComboToCart() {
    if (!currentComboSelection) return;
    const combo = currentComboSelection;
    
    let basePrice = combo.finalPrice;
    let comboWeight = combo.totalWeight ? combo.totalWeight.display : '';
    let comboFlavorName = 'Custom Bundle';

    // Check size selection
    const sizeSelect = document.getElementById('combo-size-select');
    let sizeIndex = 0;
    if (sizeSelect) {
        sizeIndex = parseInt(sizeSelect.value);
        const size = combo.sizes[sizeIndex];
        if (size) {
            basePrice = size.price;
            comboWeight = size.weight;
        }
    } else if (combo.sizes && combo.sizes.length > 0) {
        basePrice = combo.sizes[0].price;
        comboWeight = combo.sizes[0].weight;
    }

    // Check flavor selection
    const flavorSelect = document.getElementById('combo-flavor-select');
    if (flavorSelect) {
        comboFlavorName = flavorSelect.value;
    } else if (combo.flavors && combo.flavors.length > 0) {
        comboFlavorName = combo.flavors[0].name;
    }
    
    const selections = [];
    combo.products.forEach((p, index) => {
        const select = document.getElementById(`combo-subflavor-${index}`);
        selections.push({ productId: p._id, name: p.name, quantity: p.quantity, flavor: select ? select.value : 'Default' });
    });

    const flavorKey = selections.map(s => s.flavor.replace(/\s+/g, '')).join('-');
    const key = `combo-${combo._id}-${comboFlavorName.replace(/\s+/g, '')}-${sizeIndex}-${flavorKey}`;
    
    const existing = cart.find(i => i.key === key);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            key: key,
            comboId: combo._id,
            isCombo: true,
            productId: combo._id,
            name: combo.comboName,
            flavorName: comboFlavorName,
            comboSelections: selections,
            weight: comboWeight,
            price: basePrice,
            image: (combo.images && combo.images.length > 0) ? combo.images[0] : (combo.comboBanner || 'images/logo.png'),
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    updateFloatingCart();
    closeComboFlavorModal();
    toggleCart();
}

function addToCartFromPage() {
  const qtyEl = document.getElementById('modalQty');
  const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
  const product = currentProductData;
  if (product.isCombo) {
      openComboFlavorSelector(product.slug);
      return;
  }
  const flavorIndex = currentSelectedFlavorIndex;
  const flavor = product.flavors && product.flavors.length > 0 ? product.flavors[flavorIndex] : { name: '', image: '' };

  const sizeIndex = currentSelectedSizeIndex || 0;
  const size = product.sizes && product.sizes.length > 0 ? product.sizes[sizeIndex] : null;
  const price = size ? size.price : product.price;
  const weight = size ? size.weight : '';

  const key = `${product._id}-${flavorIndex}-${sizeIndex}`; // Use MongoDB _id
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty += qty; }
  else { cart.push({ key, productId: product._id, flavorIndex, sizeIndex, name: product.name, flavorName: flavor.name, weight: weight, price: price, image: flavor.image, qty }); }

  saveCart();
  updateCartUI();
  updateFloatingCart();
  toggleCart();

  // Add GA4 standard add_to_cart event
  if (typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: price * qty,
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: price,
        quantity: qty
      }]
    });
  }
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

// ===== SOCIAL PROOF POPUPS =====
async function initSocialProofPopups() {
  let popups = [
    "Aritra from Salt Lake just ordered Hydra Whey",
    "5 orders placed from New Town in the last 24 hours",
    "ISO Plasma is trending in Ballygunge right now",
    "Rahul from Jadavpur just ordered Hulk Mass Gainer",
    "Vikram from Park Street secured Launch Pricing on Creatine",
    "12 people from South Kolkata added Biozyme Whey to their cart today"
  ];

  // Fetch real confirmed orders from the backend to blend in
  try {
    const res = await fetch(`${API_URL}/orders/recent`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      popups = [...data.data, ...popups]; // Combine real and original popups
    }
  } catch (err) {
    console.warn("Could not load real recent orders for social proof.");
  }

  const showPopup = () => {
    // Respect Admin Master Toggle
    if (window.lrFomoSettings && window.lrFomoSettings.socialProof === false) {
      scheduleNext();
      return;
    }

    const popupEl = document.getElementById('socialProofPopup');
    if (!popupEl) return;
    
    const textEl = document.getElementById('socialProofText');
    if(textEl) textEl.textContent = popups[Math.floor(Math.random() * popups.length)];
    
    popupEl.classList.add('active');
    setTimeout(() => {
      popupEl.classList.remove('active');
      scheduleNext();
    }, 5000);
  };

  const scheduleNext = () => {
    const baseInterval = (window.lrFomoSettings && window.lrFomoSettings.popupInterval ? window.lrFomoSettings.popupInterval : 35) * 1000;
    // Jitter: +/- 40% of the base interval to make it feel organic
    const jitter = baseInterval * 0.4 * (Math.random() * 2 - 1);
    setTimeout(showPopup, Math.max(10000, baseInterval + jitter));
  };

  // Initial start with a random delay between 10-20 seconds
  setTimeout(showPopup, 10000 + Math.random() * 10000);
}

// ===== EXIT INTENT POPUP =====
function initExitIntentPopup() {
  const showExitIntent = () => {
    // Respect Admin Master Toggle
    if (window.lrFomoSettings && window.lrFomoSettings.exitIntent === false) return;
    if (sessionStorage.getItem('lr_exit_intent_shown') === 'true') return;
    
    const popup = document.getElementById('exitIntentOverlay');
    if (popup) {
      popup.classList.add('active');
      sessionStorage.setItem('lr_exit_intent_shown', 'true');
    }
  };

  // DESKTOP: Trigger on mouse leaving viewport vertically
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) showExitIntent();
  });

  // MOBILE: Trigger on Back Button OR Fast Upward Scroll
  if (window.innerWidth <= 768) {
    // 1. History API Trick (Back Button Intercept)
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', () => {
      if (sessionStorage.getItem('lr_exit_intent_shown') !== 'true') {
        showExitIntent();
        history.pushState(null, null, location.href); // Keep them on the page this once
      }
    });

    // 2. Fast Upward Scroll Detection
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const scrollVelocity = lastScrollY - currentScrollY; // Positive = scrolling UP
      if (currentScrollY > 300 && scrollVelocity > 80) showExitIntent(); // Rapid scroll upwards
      lastScrollY = currentScrollY;
    }, { passive: true });
  }
}

function closeExitIntentPopup(e) {
  if (e && e.target.id !== "exitIntentOverlay" && !e.target.closest('.modal-close') && !e.target.closest('.btn-primary')) return;
  const popup = document.getElementById('exitIntentOverlay');
  if (popup) popup.classList.remove('active');
}

// ===== EMOTIONAL FITNESS MESSAGING =====
function initEmotionalMessaging() {
  const messages = [
    "Results don’t wait. Neither should you.",
    "Your future physique depends on the choices you make today.",
    "Serious results start with serious decisions."
  ];
  const el = document.getElementById('emotionalMessaging');
  if (!el) return;
  
  let i = 0;
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % messages.length;
      el.textContent = messages[i];
      el.style.opacity = 1;
    }, 500); // Wait for fade out before changing text
  }, 5000); // Rotate every 5 seconds
}

// ===== DYNAMIC VIEWERS LOGIC =====
function initDynamicViewers() {
  setInterval(() => {
    // Respect Admin Master Toggle for Scarcity
    if (window.lrFomoSettings && window.lrFomoSettings.scarcity === false) return;
    
    document.querySelectorAll('.dynamic-viewers-count').forEach(el => {
      // Jitter the update time so they don't all change at the exact same millisecond
      setTimeout(() => {
        if (Math.random() < 0.15) { // 15% chance to hide it completely (nobody watching)
          el.style.opacity = 0;
        } else {
          const span = el.querySelector('span');
          if (span) {
            let currentCount = parseInt(span.textContent) || 5;
            // Fluctuate by -2 to +3 viewers
            let diff = Math.floor(Math.random() * 6) - 2;
            let newCount = currentCount + diff;
            if (newCount < 2) newCount = Math.floor(Math.random() * 4) + 2; // Keep it realistic
            if (newCount > 35) newCount = 35; // Cap it so it doesn't get crazy high
            
            span.textContent = newCount;
            el.style.opacity = 1;
          }
        }
      }, Math.random() * 10000); // Random delay between 0-10 seconds
    });
  }, 35000); // Trigger check every 35 seconds
}