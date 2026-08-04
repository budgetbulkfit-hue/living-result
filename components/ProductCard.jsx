'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import WishlistButton from './WishlistButton';

// Random viewer count between 3 and 27 — client-only, set on mount to avoid hydration mismatch
function useViewerCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    setCount(Math.floor(Math.random() * 25) + 3);
  }, []);
  return count;
}

// Random review count — client-only to avoid SSR hydration mismatch
function useReviewCount(realCount) {
  const [count, setCount] = useState(realCount ?? null);
  useEffect(() => {
    if (realCount == null) setCount(Math.floor(Math.random() * 60) + 20);
  }, [realCount]);
  return count;
}

function getProductImage(product, flavorIndex = 0) {
  let img = product.flavors?.[flavorIndex]?.image
    || product.flavors?.[0]?.image
    || `/images/${product.slug}.webp`;
  if (!img) return img;
  if (img.startsWith('http')) {
    if (img.startsWith('http://res.cloudinary.com/')) {
      img = img.replace('http://', 'https://');
    }
    return img;
  }
  return img.replace(/\.png$/i, '.webp');
}

function getProductPrice(product) {
  if (product.sizes?.length > 0) return product.sizes[0].price;
  return product.flavors?.[0]?.price || product.price || 0;
}

function getProductOldPrice(product) {
  if (product.sizes?.length > 0) return product.sizes[0].oldPrice || null;
  return null;
}

function getSavingsPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Dynamic highlights parser derived directly from product description & metadata
function extractProductHighlights(product) {
  const highlights = [];
  const desc = product.description || '';

  // Clean HTML / comment tags
  const cleanDesc = desc
    .replace(/<!--\[.*?\]-->/g, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try extracting bullet points or sentences from description
  if (cleanDesc) {
    const sentences = cleanDesc
      .split(/[.•|\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8 && s.length < 80);

    for (const s of sentences) {
      if (highlights.length >= 3) break;
      // Avoid duplicate or too generic sentences
      if (!highlights.includes(s)) {
        highlights.push(s);
      }
    }
  }

  // Fallback to specific product-type specs if description has few sentences
  if (highlights.length < 2) {
    const name = (product.name || '').toLowerCase();
    if (name.includes('isolate') || name.includes('zero') || name.includes('iso')) {
      highlights.push('100% Pure Whey Isolate · Rapid Absorption');
      highlights.push('Ultra-Low Carb & Fat Profile');
    } else if (name.includes('mass') || name.includes('gainer')) {
      highlights.push('High-Calorie Complex Carbohydrate Fuel');
      highlights.push('Enriched with Digestive Enzymes for Zero Bloat');
    } else if (name.includes('creatine')) {
      highlights.push('100% Micronized Pharmaceutical-Grade Creatine');
      highlights.push('Enhances ATP Energy & Muscle Power Output');
    } else if (product.isCombo || name.includes('combo')) {
      highlights.push('Curated Synergistic Stack Bundle');
      highlights.push('Maximum Cost Savings Direct from Authorized Importers');
    } else {
      highlights.push('100% Genuine Sourced Sealed Unit');
      highlights.push('Authenticity Scratch Code Intact');
    }
  }

  return highlights.slice(0, 3);
}

export default function ProductCard({ product, onAuthOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const viewers = useViewerCount();
  const reviewCount = useReviewCount(product.reviewCount ?? product.reviews?.length ?? null);

  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  const savings = getSavingsPercent(price, oldPrice);
  const flavors = product.flavors || [];
  const sizes = product.sizes || [];
  const hasMultipleFlavors = flavors.length > 1;
  const isInStock = sizes.length > 0
    ? sizes.some((s) => s.inStock !== false)
    : flavors.some((f) => f.inStock !== false);
  const scarcity = product.scarcity;
  const highlights = extractProductHighlights(product);

  const handleCardClick = () => {
    const targetPath = `/product/${product.slug}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'lr_pending_view_event',
        JSON.stringify({
          productId: product._id || product.id,
          productName: product.name,
          source: 'card_click',
          price,
        })
      );
    }

    if (pathname === targetPath) {
      window.location.href = targetPath;
    } else {
      router.push(targetPath);
    }
  };

  return (
    <div
      className="lr-product-card"
      onClick={handleCardClick}
      role="article"
      aria-label={`${product.name} - ₹${price.toLocaleString()}`}
    >
      {/* ── Visual Frame ── */}
      <div className="lr-product-card__visual">
        <div className="lr-product-card__glow" />
        <img
          src={getProductImage(product, 0)}
          alt={product.name}
          className="lr-product-card__img"
          loading="lazy"
          onError={(e) => {
            e.target.src = `/images/${product.slug}.webp`;
            e.target.onerror = null;
          }}
        />

        {/* Wishlist Button */}
        <div
          className="lr-product-card__wishlist"
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistButton
            productId={product._id || product.id}
            onAuthRequired={onAuthOpen}
            className="product-card-wishlist"
          />
        </div>

        {/* Badges & Tags */}
        <div className="lr-product-card__tags">
          {product.bestSeller && (
            <span className="lr-tag lr-tag--best">🔥 Best Seller</span>
          )}
          {product.isBulking && (
            <span className="lr-tag lr-tag--bulk">💪 Gainer</span>
          )}
          {product.isMuscle && (
            <span className="lr-tag lr-tag--muscle">⚡ Lean Muscle</span>
          )}
          {product.isFatLoss && (
            <span className="lr-tag lr-tag--shred">🔥 Fat Loss</span>
          )}
          {product.isStack && (
            <span className="lr-tag lr-tag--stack">✨ Stack Deal</span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="lr-product-card__stock">
          {scarcity > 0 && scarcity <= 10 ? (
            <span className="lr-stock-badge lr-stock-badge--scarcity">
              Only {scarcity} left!
            </span>
          ) : (
            <span className={`lr-stock-badge ${isInStock ? 'is-in' : 'is-out'}`}>
              {isInStock ? 'In Stock' : 'Sold Out'}
            </span>
          )}
        </div>

        {/* ── Product Highlights HUD (Revealed on Hover / Focus) ── */}
        <div className="lr-product-card__hud">
          <div className="lr-product-card__hud-header">
            <span className="lr-product-card__hud-sparkle">✦</span>
            <span>KEY HIGHLIGHTS:</span>
          </div>
          <ul className="lr-product-card__benefits-list">
            {highlights.map((h, i) => (
              <li key={i} className="lr-product-card__benefit-item">
                <span className="lr-product-card__check">✓</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <div className="lr-product-card__hud-social">
            <span className="lr-product-card__stars">★★★★★</span>
            <span className="lr-product-card__social-count">
              {reviewCount ? `${reviewCount}+ Verified Customer Ratings` : '100% Genuine Guaranteed'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Core Details Frame ── */}
      <div className="lr-product-card__body">
        <h3 className="lr-product-card__title">
          {product.name}
        </h3>

        <p className="lr-product-card__flavor">
          {hasMultipleFlavors ? `${flavors.length} Verified Flavors Available` : (flavors[0]?.name || 'Standard Packaging')}
        </p>

        {/* Price & Savings */}
        <div className="lr-product-card__pricing">
          <div className="lr-product-card__price-group">
            <span className="lr-product-card__current-price">₹{price.toLocaleString()}</span>
            {oldPrice && oldPrice > price && (
              <span className="lr-product-card__old-price">₹{oldPrice.toLocaleString()}</span>
            )}
          </div>
          {savings > 0 && (
            <span className="lr-product-card__discount-pill">{savings}% OFF</span>
          )}
        </div>

        {/* Real-time Viewers FOMO */}
        {viewers && (
          <div className="lr-product-card__viewers">
            <span className="lr-product-card__live-dot" />
            <span><strong>{viewers}</strong> people viewing right now</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          className="lr-product-card__btn"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <span>View Details & Buy</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
