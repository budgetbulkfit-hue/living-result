/**
 * lib/api.js
 * Central fetch helpers for all Living Result API calls.
 * These work in both Server Components (SSR/SSG) and Client Components.
 *
 * API URL is controlled via environment variables:
 *   - Local dev:  NEXT_PUBLIC_API_URL=http://localhost:5000/api  (in .env.local)
 *   - Production: set NEXT_PUBLIC_API_URL on Vercel to the Render backend URL
 */

export const API_BASE = typeof window !== 'undefined' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend-production.up.railway.app/api');

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * Fetch all products. Parses inline metadata flags embedded in description.
 * Safe for Server Components (no-store cache ensures fresh data on each SSR request).
 */
export async function getProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.success) return [];

    return data.data.map((p) => {
      // Sort sizes by price ascending
      if (p.sizes) p.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));

      // Parse inline flags from description string
      if (p.description?.includes('<!--[GF]-->')) {
        p.glutenFree = true;
        p.description = p.description.replace(/ ?<!--\[GF\]-->/g, '');
      }
      if (p.description?.includes('<!--[IMAGES:')) {
        const match = p.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
        if (match?.[1]) {
          try { p.images = JSON.parse(match[1]); } catch (_) {}
          p.description = p.description.replace(match[0], '');
        }
      }
      if (p.description?.includes('<!--[SUBCAT:')) {
        const match = p.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
        if (match?.[1]) {
          p.subCategory = match[1];
          p.description = p.description.replace(match[0], '');
        }
      }
      if (p.description?.includes('<!--[STACK:')) {
        const match = p.description.match(/ ?<!--\[STACK:(.*?)\]-->/);
        if (match?.[1]) {
          p.stackGroup = match[1];
          p.description = p.description.replace(match[0], '');
        }
      }
      if (p.description?.includes('<!--[STACK_PRIORITY:')) {
        const match = p.description.match(/ ?<!--\[STACK_PRIORITY:(.*?)\]-->/);
        if (match?.[1]) {
          p.stackPriority = parseInt(match[1], 10);
          p.description = p.description.replace(match[0], '');
        }
      }
      return p;
    });
  } catch (err) {
    console.error('[api] getProducts error:', err.message);
    return [];
  }
}

/**
 * Fetch a single product by slug. Also parses inline metadata.
 */
export async function getProductBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (!data.success) return null;

    const p = data.data;
    if (p.sizes) p.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));

    if (p.description?.includes('<!--[GF]-->')) {
      p.glutenFree = true;
      p.description = p.description.replace(/ ?<!--\[GF\]-->/g, '');
    }
    if (p.description?.includes('<!--[IMAGES:')) {
      const match = p.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
      if (match?.[1]) {
        try { p.images = JSON.parse(match[1]); } catch (_) {}
        p.description = p.description.replace(match[0], '');
      }
    }
    if (p.description?.includes('<!--[SUBCAT:')) {
      const match = p.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
      if (match?.[1]) {
        p.subCategory = match[1];
        p.description = p.description.replace(match[0], '');
      }
    }
    if (p.description?.includes('<!--[STACK:')) {
      const match = p.description.match(/ ?<!--\[STACK:(.*?)\]-->/);
      if (match?.[1]) {
        p.stackGroup = match[1];
        p.description = p.description.replace(match[0], '');
      }
    }
    if (p.description?.includes('<!--[STACK_PRIORITY:')) {
      const match = p.description.match(/ ?<!--\[STACK_PRIORITY:(.*?)\]-->/);
      if (match?.[1]) {
        p.stackPriority = parseInt(match[1], 10);
        p.description = p.description.replace(match[0], '');
      }
    }
    return p;
  } catch (err) {
    console.error('[api] getProductBySlug error:', err.message);
    return null;
  }
}

// ─── Combos ──────────────────────────────────────────────────────────────────

/** Fetch all combo packs. */
export async function getCombos() {
  try {
    const res = await fetch(`${API_BASE}/combos`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('[api] getCombos error:', err.message);
    return [];
  }
}

/** Fetch a single combo by its slug (includes fully populated comboGroups). */
export async function getComboBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/combos/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('[api] getComboBySlug error:', err.message);
    return null;
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Fetch global site settings (FOMO toggles, notice strip, maintenance mode).
 * Returns null on failure so callers can fall back gracefully.
 */
export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('[api] getSettings error:', err.message);
    return null;
  }
}

/**
 * Fetch the current site version number (used for polling-based auto-refresh).
 */
export async function getSiteVersion() {
  try {
    const res = await fetch(`${API_BASE}/settings/version`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.version : null;
  } catch (_) {
    return null;
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Fetch recent confirmed orders for the Social Proof Popup.
 */
export async function getRecentOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders/recent`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (_) {
    return [];
  }
}

/**
 * Create a new pending order on the backend.
 * Called from CheckoutModal (client-side) just before WhatsApp redirect.
 *
 * @param {{ customerDetails, products, totalAmount }} payload
 * @returns {{ success: boolean, data?: { orderId: string }, message?: string }}
 */
export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

/**
 * Submit a product review.
 * @param {string} productId  MongoDB _id of the product
 * @param {{ name: string, rating: number, comment: string }} payload
 */
export async function submitReview(productId, payload) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Fire a product view event (analytics only, fire-and-forget).
 * @param {string} productId
 * @param {string} source  e.g. 'card_click' | 'product_page'
 */
export function trackProductView(productId, source = 'unknown') {
  if (!productId) return;
  fetch(`${API_BASE}/products/${productId}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ source, ts: Date.now() }),
  }).catch(() => {});
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Authenticate admin user.
 * @param {string} email
 * @param {string} password
 */
export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Subscribe a user to restock notifications for a specific product/variant.
 * @param {{ email: string, phone: string, productId: string, variantKey: string }} payload
 */
export async function subscribeToRestock(payload) {
  // Map 'phone' to 'phoneNumber' for the backend
  const data = {
    ...payload,
    phoneNumber: payload.phone || payload.phoneNumber
  };
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

/** Fetch all notifications (Admin) */
export async function getNotifications(token) {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

/** Update notification status (Admin) */
export async function updateNotificationStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/** Delete notification (Admin) */
export async function deleteNotification(id, token) {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

/** Fetch product performance analytics (Admin) */
export async function getProductPerformance(token) {
  const res = await fetch(`${API_BASE}/products/analytics/performance`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

/** Fetch all orders (Admin) */
export async function getOrders(token) {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// ─── AI Stack Builder ────────────────────────────────────────────────────────

/**
 * Request an AI-generated stack recommendation based on a user query.
 * @param {string} query The user's fitness goal or preference.
 */
export async function recommendAiStack(query) {
  const res = await fetch(`${API_BASE}/ai/recommend-stack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

/**
 * Request AI product recommendations based on a natural language fitness goal.
 * Returns a conversational message, enriched product recommendations (with images/prices),
 * and a suggestStackLab flag if a custom combo would be more appropriate.
 * @param {string} query The user's fitness goal / question.
 */
export async function chatRecommend(query) {
  const res = await fetch(`${API_BASE}/ai/chat-recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

/**
 * Sync data to Google Sheets via backend proxy.
 * @param {string} googleWebAppUrl
 * @param {object} payload
 * @param {string} token
 */
export async function syncGoogleSheets(googleWebAppUrl, payload, token) {
  const res = await fetch(`${API_BASE}/settings/sync-sheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ googleWebAppUrl, payload })
  });
  return res.json();
}

// ─── Customer Auth (OTP) ─────────────────────────────────────────────────────

/**
 * Send OTP to customer email or phone.
 * @param {string} identifier  Email address or phone number
 * @param {'email'|'phone'} type
 */
export async function sendOtp(identifier, type) {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, type }),
  });
  return res.json();
}

/**
 * Verify OTP and log in / create account.
 * @param {string} identifier
 * @param {'email'|'phone'} type
 * @param {string} otp  6-digit code
 * @param {string} [name]  Required for new users
 */
export async function verifyOtp(identifier, type, otp, name) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, type, otp, name }),
  });
  return res.json();
}

/** Log out customer — clears JWT cookie on server */
export async function customerLogout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

/** Get current authenticated user from cookie */
export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) return { success: false };
  return res.json();
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/user/profile`, { credentials: 'include', cache: 'no-store' });
  return res.json();
}

export async function updateUserProfile(payload) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAiProfile(payload) {
  const res = await fetch(`${API_BASE}/user/ai-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── User Orders ──────────────────────────────────────────────────────────────

export async function getUserOrders() {
  const res = await fetch(`${API_BASE}/user/orders`, { credentials: 'include', cache: 'no-store' });
  return res.json();
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

/** Returns wishlist with populated product details */
export async function getWishlist() {
  const res = await fetch(`${API_BASE}/user/wishlist`, { credentials: 'include', cache: 'no-store' });
  return res.json();
}

export async function addToWishlist(productId) {
  const res = await fetch(`${API_BASE}/user/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId }),
  });
  return res.json();
}

export async function removeFromWishlist(productId) {
  const res = await fetch(`${API_BASE}/user/wishlist/${productId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export async function getAddresses() {
  const res = await fetch(`${API_BASE}/user/addresses`, { credentials: 'include', cache: 'no-store' });
  return res.json();
}

export async function addAddress(payload) {
  const res = await fetch(`${API_BASE}/user/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateAddress(id, payload) {
  const res = await fetch(`${API_BASE}/user/address/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAddress(id) {
  const res = await fetch(`${API_BASE}/user/address/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

export async function setDefaultAddress(id) {
  const res = await fetch(`${API_BASE}/user/address/${id}/default`, {
    method: 'PUT',
    credentials: 'include',
  });
  return res.json();
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export async function getRewards() {
  const res = await fetch(`${API_BASE}/user/rewards`, { credentials: 'include', cache: 'no-store' });
  return res.json();
}
