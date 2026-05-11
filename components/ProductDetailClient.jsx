'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useCart from '@/lib/cartStore';
import ImageGallery from './ImageGallery';
import { subscribeToRestock } from '@/lib/api';

function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  const filename = src.replace(/^\/?(images\/)?/, '');
  return `/images/${filename}`;
}

export default function ProductDetailClient({ product }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const [selectedFlavor, setSelectedFlavor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('about');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  const flavors = product.flavors || [];
  const sizes = product.sizes || [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  // Pricing — size takes precedence
  const currentSize = sizes[selectedSize];
  const currentFlavor = flavors[selectedFlavor];
  const price = currentSize?.price || currentFlavor?.price || product.price || 0;
  const oldPrice = currentSize?.oldPrice || null;
  const savings = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const isInStock = currentSize ? currentSize.inStock !== false : (currentFlavor?.inStock !== false);

  const handleAddToCart = () => {
    const key = product.isCombo ? `combo-${product._id}-${Date.now()}` : `${product._id}-${selectedFlavor}-${selectedSize}`;
    
    const itemData = {
      key,
      productId: product._id,
      name: product.name,
      flavorName: product.isCombo ? 'Combo Stack' : (currentFlavor?.name || 'Regular'),
      weight: product.isCombo ? product.weight : (currentSize?.weight || ''),
      price,
      image: product.isCombo ? product.image : (resolveImage(currentFlavor?.image) || `/images/${product.slug}.png`),
      qty,
      isCombo: product.isCombo || false,
    };

    if (product.isCombo && product.products) {
      // Default to first flavor for each product if isCombo
      itemData.comboSelections = product.products.map(p => ({
        productId: p._id,
        name: p.name,
        flavor: 'Regular',
        quantity: p.quantity || 1
      }));
    }

    addItem(itemData);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';
      await fetch(`${API}/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      setReviewSubmitted(true);
    } catch (_) {
      setReviewSubmitted(true); // optimistic UX
    }
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await subscribeToRestock({
        email: notifyEmail,
        productId: product._id,
        variantKey: `${currentFlavor?.name || 'Regular'}-${currentSize?.weight || 'Default'}`
      });
      if (res.success) {
        setNotifySuccess(true);
        setNotifyEmail('');
      }
    } catch (err) {
      console.error('Notification failed:', err);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const tabBtnStyle = (tab) => ({
    padding: '10px 0',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
    transition: '0.2s',
    fontFamily: 'var(--font-body)',
    marginBottom: '-1px',
  });

  return (
    <div className="modal-grid">

      {/* ── LEFT: Image Gallery ── */}
      <ImageGallery
        images={product.images || []}
        flavors={flavors}
        selectedFlavorIndex={selectedFlavor}
        productName={product.name}
      />

      {/* ── RIGHT: Product Info ── */}
      <div className="modal-info-col">

        {/* Back */}
        <button
          onClick={handleBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
        >
          ← Back to Shop
        </button>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {product.bestSeller && <span className="best-seller-badge" style={{ position: 'static' }}>🔥 Best Seller</span>}
          {product.glutenFree && <span className="gluten-free-badge" style={{ position: 'static' }}>✓ Gluten Free</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', textTransform: 'uppercase', lineHeight: 1.15, margin: 0 }}>
            {product.name}
          </h1>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href }).catch(()=>{});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="react-share-btn"
            title="Share Product"
            aria-label="Share"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>

        {/* Rating */}
        <div className="product-rating" style={{ marginBottom: '16px' }}>
          <span className="stars">{'★'.repeat(Math.round(product.rating || 5))}{'☆'.repeat(5 - Math.round(product.rating || 5))}</span>
          <span className="rating-count">({reviews.length || 0} reviews)</span>
        </div>

        {/* Price */}
        <div className="modal-price">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
              ₹{price.toLocaleString()}
            </span>
            {oldPrice && oldPrice > price && (
              <span className="old-price" style={{ fontSize: '18px' }}>₹{oldPrice.toLocaleString()}</span>
            )}
            {savings > 0 && (
              <span className="discount" style={{ fontSize: '14px' }}>{savings}% OFF</span>
            )}
          </div>
          {currentSize?.weight && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Weight: {currentSize.weight}
            </div>
          )}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
            *Delivery charges will apply accordingly.
          </div>
        </div>

        {/* Flavor Selector */}
        {flavors.length > 0 && !product.isCombo && (
          <div className="flavor-selector">
            <span className="flavor-label">Flavor: <strong style={{ color: 'var(--text-primary)' }}>{flavors[selectedFlavor]?.name}</strong></span>
            <div className="flavor-pills">
              {flavors.map((f, i) => (
                <button
                  key={i}
                  className={`flavor-pill${selectedFlavor === i ? ' active' : ''}${f.inStock === false ? ' disabled' : ''}`}
                  onClick={() => setSelectedFlavor(i)}
                  style={{ opacity: f.inStock === false ? 0.4 : 1, cursor: f.inStock === false ? 'not-allowed' : 'pointer' }}
                  title={f.inStock === false ? 'Out of Stock' : f.name}
                >
                  {f.name}
                  {f.inStock === false && <span style={{ fontSize: '9px', marginLeft: '4px', color: '#e74c3c' }}>✗</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Included in Stack (Combo only) */}
        {product.isCombo && product.products && (
          <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.5px' }}>
              Included in this Stack
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.products.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: i < product.products.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: i < product.products.length - 1 ? '10px' : 0 }}>
                  <span style={{ color: 'var(--text-primary)' }}>• {p.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>x{p.quantity || 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {sizes.length > 1 && (
          <div className="flavor-selector" style={{ marginTop: '16px' }}>
            <span className="flavor-label">Size: <strong style={{ color: 'var(--text-primary)' }}>{sizes[selectedSize]?.weight}</strong></span>
            <div className="flavor-pills">
              {sizes.map((s, i) => (
                <button
                  key={i}
                  className={`flavor-pill${selectedSize === i ? ' active' : ''}`}
                  onClick={() => setSelectedSize(i)}
                >
                  {s.weight}
                  <span style={{ marginLeft: '6px', color: 'var(--accent)', fontWeight: '700' }}>₹{s.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Qty + Add to Cart */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
          <div className="qty-control">
            <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
          </div>
          {isInStock ? (
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              style={{ flex: 1, justifyContent: 'center', background: addedFeedback ? 'var(--green)' : 'var(--accent)', transition: 'background 0.3s' }}
            >
              {addedFeedback ? '✓ Added to Cart!' : '🛒 Add to Cart'}
            </button>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!showNotifyForm && !notifySuccess && (
                <button 
                  className="btn-notify" 
                  style={{ width: '100%' }}
                  onClick={() => setShowNotifyForm(true)}
                >
                  Notify When Available
                </button>
              )}
              
              {showNotifyForm && !notifySuccess && (
                <form onSubmit={handleNotifySubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter email" 
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    required
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0 15px', fontSize: '12px' }}>Submit</button>
                </form>
              )}

              {notifySuccess && (
                <div style={{ color: 'var(--green)', fontSize: '13px', fontWeight: '600', padding: '10px', background: 'rgba(46, 204, 64, 0.1)', borderRadius: '6px', textAlign: 'center' }}>
                  ✓ We'll notify you when restocked!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Market Comparison */}
        {oldPrice && oldPrice > price && (
          <div className="market-comparison-card">
            <table>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)' }}>Market Price (MRP)</td>
                  <td style={{ textAlign: 'right', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{oldPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: '#fff', fontWeight: 'bold' }}>Living Result Price</td>
                  <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold' }}>₹{price.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '13px', color: 'var(--green)', fontWeight: 'bold' }}>
              💰 You save ₹{(oldPrice - price).toLocaleString()}!
            </div>
          </div>
        )}

        {/* Scarcity */}
        {product.scarcity > 0 && product.scarcity <= 10 && (
          <div style={{ color: '#e74c3c', fontSize: '13px', fontWeight: '600', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ Only {product.scarcity} left in stock — order soon!
          </div>
        )}

        {/* Info Tabs */}
        <div className="modal-tabs" style={{ marginTop: '28px' }}>
          {['about', 'nutrition', 'ingredients', 'reviews'].map((tab) => (
            <button key={tab} style={tabBtnStyle(tab)} onClick={() => setActiveTab(tab)}>
              {tab === 'about' ? 'About' : tab === 'nutrition' ? 'Nutritional Facts' : tab === 'ingredients' ? 'Ingredients' : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab: About */}
        {activeTab === 'about' && (
          <div className="modal-tab-content active" style={{ display: 'block' }}>
            <p style={{ lineHeight: 1.8, fontSize: '14px', color: 'var(--text-secondary)' }}>{product.description || 'Premium quality supplement for serious athletes.'}</p>
          </div>
        )}

        {/* Tab: Nutrition */}
        {activeTab === 'nutrition' && (
          <div className="modal-tab-content active" style={{ display: 'block' }}>
            {product.nutritionalFacts && product.nutritionalFacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {product.nutritionalFacts.map((line, idx) => (
                  <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>Nutrition details not available. Please check the product label.</p>
            )}
          </div>
        )}

        {/* Tab: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="modal-tab-content active" style={{ display: 'block' }}>
            {product.ingredients ? (
              <p style={{ lineHeight: 1.8, fontSize: '14px', color: 'var(--text-secondary)' }}>{product.ingredients}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                Ingredients not listed.
              </p>
            )}
          </div>
        )}

        {/* Tab: Reviews */}
        {activeTab === 'reviews' && (
          <div className="modal-tab-content active" style={{ display: 'block' }}>
            {reviews.length === 0 && !reviewSubmitted && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>No reviews yet. Be the first!</p>
            )}
            {reviews.slice(0, 5).map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.name}</span>
                  <span style={{ color: '#f5a623', fontSize: '13px' }}>{'★'.repeat(r.rating)}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{r.comment}</p>
              </div>
            ))}
            {/* Review Form */}
            {reviewSubmitted ? (
              <div style={{ color: 'var(--green)', fontSize: '14px', fontWeight: '600', marginTop: '16px' }}>✓ Thank you for your review!</div>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Write a Review</div>
                <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} required placeholder="Your name" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '13px' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: s <= reviewRating ? '#f5a623' : 'var(--border)' }}>★</button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required placeholder="Share your experience..." rows={3} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'vertical' }} />
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '13px' }}>Submit Review</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
