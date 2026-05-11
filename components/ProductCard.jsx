'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useCart from '@/lib/cartStore';

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
  const addItem = useCart((s) => s.addItem);
  const viewers = useViewerCount();
  const reviewCount = useReviewCount(product.reviewCount ?? product.reviews?.length ?? null);

  const [selectedFlavor, setSelectedFlavor] = useState(0);
  const [showFlavors, setShowFlavors] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const cardRef = useRef(null);

  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  const savings = getSavingsPercent(price, oldPrice);
  const flavors = product.flavors || [];
  const sizes = product.sizes || [];
  const hasMultipleFlavors = flavors.length > 1;
  const isInStock = sizes.length > 0 ? sizes[0].inStock !== false : flavors[0]?.inStock !== false;
  const scarcity = product.scarcity;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // If multiple flavors — show inline flavor picker
    if (hasMultipleFlavors && !showFlavors) {
      setShowFlavors(true);
      return;
    }
    // Add to cart
    const flavor = flavors[selectedFlavor] || flavors[0] || {};
    const size = sizes[0];
    const itemPrice = size?.price || flavor.price || price;
    const weight = size?.weight || '';
    const key = `${product._id}-${selectedFlavor}-0`;
    addItem({
      key,
      productId: product._id,
      name: product.name,
      flavorName: flavor.name || 'Regular',
      weight,
      price: itemPrice,
      image: getProductImage(product, selectedFlavor),
      qty: 1,
    });
    setShowFlavors(false);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

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
          src={getProductImage(product, selectedFlavor)}
          alt={product.name}
          onError={(e) => { e.target.src = `/images/${product.slug}.png`; e.target.onerror = null; }}
          style={{ maxHeight: '180px', objectFit: 'contain', transition: '0.3s ease' }}
        />

        {/* Badges */}
        {product.bestSeller && (
          <span className="best-seller-badge">🔥 Best Seller</span>
        )}
        {product.glutenFree && (
          <span className="gluten-free-badge">✓ Gluten Free</span>
        )}

        {/* Scarcity badge */}
        {scarcity > 0 && scarcity <= 10 && (
          <span className="stock-badge out-of-stock" style={{ top: product.bestSeller ? '40px' : '12px', right: '12px' }}>
            Only {scarcity} left!
          </span>
        )}
        {(!scarcity || scarcity > 10) && (
          <span className={`stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`} style={{ opacity: 0.8 }}>
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
        )}
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

        {/* Inline Flavor Picker (shown when user clicks Add) */}
        {showFlavors && (
          <div
            className="flavor-selector"
            onClick={(e) => e.stopPropagation()}
            style={{ marginBottom: '10px' }}
          >
            <span className="flavor-label">Select Flavor:</span>
            <div className="flavor-pills">
              {flavors.map((f, idx) => (
                <button
                  key={idx}
                  className={`flavor-pill${selectedFlavor === idx ? ' active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedFlavor(idx); }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        {isInStock ? (
          <button
            className="btn-add-cart"
            onClick={handleAddToCart}
            style={{ width: '100%', background: addedFeedback ? 'var(--green)' : 'var(--accent)' }}
          >
            {addedFeedback ? (
              <>✓ Added to Cart</>
            ) : showFlavors ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Confirm &amp; Add
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Add to Cart
              </>
            )}
          </button>
        ) : (
          <button className="btn-notify" onClick={(e) => e.stopPropagation()}>
            Notify When Available
          </button>
        )}
      </div>
    </div>
  );
}
