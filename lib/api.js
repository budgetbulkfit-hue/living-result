/**
 * lib/api.js
 * Central fetch helpers for all Living Result API calls.
 * These work in both Server Components (SSR/SSG) and Client Components.
 *
 * API URL is controlled via environment variables:
 *   - Local dev:  NEXT_PUBLIC_API_URL=http://localhost:5000/api  (in .env.local)
 *   - Production: set NEXT_PUBLIC_API_URL on Vercel to the Render backend URL
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';

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
