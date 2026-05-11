'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  return product.flavors?.[flavorIndex]?.image
    || product.flavors?.[0]?.image
    || `/images/${product.slug}.png`;
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

export default function ProductCard({ product }) {
  const router = useRouter();
  const viewers = useViewerCount();
  const reviewCount = useReviewCount(product.reviewCount ?? product.reviews?.length ?? null);

  const [addedFeedback, setAddedFeedback] = useState(false);
  const cardRef = useRef(null);

  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  const savings = getSavingsPercent(price, oldPrice);
  const flavors = product.flavors || [];
  const sizes = product.sizes || [];
  const hasMultipleFlavors = flavors.length > 1;
  const isInStock = sizes.length > 0 
    ? sizes.some(s => s.inStock !== false) 
    : flavors.some(f => f.inStock !== false);
  const scarcity = product.scarcity;


  const handleCardClick = () => {
    router.push(`/product/${product.slug}`);
  };

  return (
    <div
      className="product-card"
      ref={cardRef}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* ── Image Section ── */}
      <div className="product-image">
        <img
          src={getProductImage(product, 0)}
          alt={product.name}
          onError={(e) => { e.target.src = `/images/${product.slug}.png`; e.target.onerror = null; }}
          style={{ maxHeight: '180px', objectFit: 'contain', transition: '0.3s ease' }}
        />

        {/* Badges & Quick Tags */}
        <div className="card-badge-container">
          {product.bestSeller && (
            <span className="quick-tag tag-best-seller">🔥 Best Seller</span>
          )}
          {product.isBulking && (
            <span className="quick-tag tag-bulking">💪 Bulking</span>
          )}
          {product.isMuscle && (
            <span className="quick-tag tag-muscle">⚡ Lean Muscle</span>
          )}
          {product.isFatLoss && (
            <span className="quick-tag tag-fat-loss">🔥 Fat Loss</span>
          )}
          {product.isStack && (
            <span className="quick-tag tag-premium">✨ Premium Stack</span>
          )}
          {product.glutenFree && (
            <span className="quick-tag tag-gluten-free">✓ Gluten Free</span>
          )}
          
          {/* Automatic Fallbacks (if no manual tag is selected) */}
          {!product.isBulking && !product.isMuscle && !product.isFatLoss && !product.isStack && (
            <>
              {product.name.toLowerCase().includes('mass gainer') && (
                <span className="quick-tag tag-bulking">💪 Bulking</span>
              )}
              {product.name.toLowerCase().includes('creatine') && (
                <span className="quick-tag tag-muscle">⚡ Lean Muscle</span>
              )}
              {product.name.toLowerCase().includes('fat burner') && (
                <span className="quick-tag tag-fat-loss">🔥 Fat Loss</span>
              )}
              {product.name.toLowerCase().includes('combo') && (
                <span className="quick-tag tag-premium">✨ Premium Stack</span>
              )}
            </>
          )}
        </div>

        {/* Scarcity / Stock badge */}
        <div className="stock-badge-container">
          {scarcity > 0 && scarcity <= 10 && (
            <span className="stock-badge scarcity-tag">
              Only {scarcity} left!
            </span>
          )}
          {(!scarcity || scarcity > 10) && (
            <span className={`stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>
      </div>

      {/* ── Info Section ── */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {/* Flavor sub-label */}
        <p className="product-flavor">
          {hasMultipleFlavors ? `${flavors.length} Flavors Available` : (flavors[0]?.name || 'Regular')}
        </p>

        {/* Pricing */}
        <div className="product-pricing">
          <span className="current-price">₹{price.toLocaleString()}</span>
          {oldPrice && oldPrice > price && (
            <span className="old-price">₹{oldPrice.toLocaleString()}</span>
          )}
          {savings > 0 && (
            <span className="discount">{savings}% OFF</span>
          )}
        </div>

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating || 5))}</span>
          <span className="rating-count">({reviewCount ?? '...'} reviews)</span>
        </div>

        {/* FOMO — Viewers */}
        {viewers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span><strong style={{ color: 'var(--accent)' }}>{viewers}</strong> people viewing this right now</span>
          </div>
        )}


        {/* View Product Button */}
        <button
          className="btn-add-cart"
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          style={{ width: '100%', background: 'var(--accent)', justifyContent: 'center', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}
        >
          ⚡ View Details
        </button>
      </div>
    </div>
  );
}
