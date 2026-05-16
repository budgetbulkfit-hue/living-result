'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCart from '@/lib/cartStore';
import ImageGallery from './ImageGallery';
import { subscribeToRestock } from '@/lib/api';

function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  const filename = src.replace(/^\/?(images\/)?/, '');
  return `/images/${filename}`.replace(/\.png$/i, '.webp');
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
  const [notifyPhone, setNotifyPhone] = useState('');
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [comboSelections, setComboSelections] = useState({});
  const [groupSelections, setGroupSelections] = useState({}); // { groupKey: productId }
  const [groupProdSelections, setGroupProdSelections] = useState({}); // { productId: { flavorIndex, sizeIndex } }
  const [liveComboGroups, setLiveComboGroups] = useState(null); // fetched client-side if SSR didn't provide them
  const [liveProductsInCombo, setLiveProductsInCombo] = useState(null);

  const flavors = product.flavors || [];
  const sizes = product.sizes || [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  // Pricing — size takes precedence
  const currentSize = sizes[selectedSize];
  const currentFlavor = flavors[selectedFlavor];
  const price = currentSize?.price || currentFlavor?.price || product.price || 0;
  const oldPrice = currentSize?.oldPrice || null;
  const savings = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const isComboItem = product.isCombo || !!product.comboSlug;

  // Use live-fetched data if available (client-side), otherwise use what SSR provided
  const productsInCombo = isComboItem ? (liveProductsInCombo ?? product.products ?? product.comboProducts ?? []) : [];
  const comboGroups = isComboItem ? (liveComboGroups ?? product.comboGroups ?? []) : [];

  // Reset notify state when selections change
  useEffect(() => {
    setNotifySuccess(false);
    setShowNotifyForm(false);
  }, [selectedFlavor, selectedSize, groupSelections]);

  // Client-side fetch of full combo data (handles case where SSR page didn't merge comboGroups)
  useEffect(() => {
    if (!isComboItem) return;
    if (product.comboGroups && product.comboGroups.length > 0) return; // already have data from SSR

    const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';
    fetch(`${API}/combos/slug/${product.slug}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setLiveComboGroups(data.data.comboGroups || []);
          setLiveProductsInCombo(data.data.products || []);
        }
      })
      .catch(() => {}); // fail silently
  }, [isComboItem, product.slug, product.comboGroups]);

  // Init defaults for combo groups
  useEffect(() => {
    if (isComboItem && comboGroups.length > 0) {
      setGroupSelections(prev => {
        if (Object.keys(prev).length > 0) return prev;
        const initGrp = {};
        const initPrd = { ...groupProdSelections };
        comboGroups.forEach(g => {
          if (g.products && g.products.length > 0) {
            // Find first product in group that is in stock
            let bestEntry = g.products[0];
            for (const entry of g.products) {
              const prod = entry.productId || entry;
              const pSize = entry.fixedWeight ? prod.sizes?.find(s => s.weight === entry.fixedWeight) : prod.sizes?.[0];
              const pFlavor = prod.flavors?.[0];
              
              const isInStock = (pSize ? pSize.inStock !== false : true) && (pFlavor ? pFlavor.inStock !== false : true);
              if (isInStock) {
                bestEntry = entry;
                break;
              }
            }

            const pid = bestEntry.productId?._id || bestEntry.productId || bestEntry._id || bestEntry.id;
            if (pid) {
              initGrp[g.key] = pid;
              if (!initPrd[pid]) initPrd[pid] = { flavorIndex: 0, sizeIndex: 0 };
            }
          }
        });
        setGroupProdSelections(initPrd);
        return initGrp;
      });
    }
  }, [isComboItem, comboGroups]);

  const groupImages = [];
  if (isComboItem && comboGroups.length > 0) {
    comboGroups.forEach(g => {
      const selectedPid = groupSelections[g.key];
      if (selectedPid) {
        const entry = g.products.find(p => (p.productId?._id || p.productId || p._id || p.id) === selectedPid);
        if (entry?.image) {
          groupImages.push(entry.image);
        }
      }
    });
  }

  // Dynamic pricing & Stock Check
  let dynamicComboPrice = 0;
  let dynamicComboOldPrice = 0;
  let comboStockValid = true;

  if (isComboItem) {
    // 1. Sum up fixed legacy products
    productsInCombo.forEach(p => {
      dynamicComboPrice += (p.price || 0) * (p.quantity || 1);
      dynamicComboOldPrice += (p.oldPrice || p.price || 0) * (p.quantity || 1);
    });

    // 2. Sum up dynamic group selections
    comboGroups.forEach(g => {
      const selectedPid = groupSelections[g.key];
      if (selectedPid) {
        const entry = g.products.find(p => (p.productId?._id || p.productId || p._id || p.id) === selectedPid);
        const prod = entry?.productId || entry;
        if (prod) {
          const sels = groupProdSelections[selectedPid] || { flavorIndex: 0, sizeIndex: 0 };
          
          // Use fixedWeight if admin specified one, otherwise use sels.sizeIndex
          let pSize;
          if (entry.fixedWeight) {
            pSize = prod.sizes?.find(s => s.weight === entry.fixedWeight);
          }
          if (!pSize) {
            pSize = prod.sizes?.[sels.sizeIndex] || prod.sizes?.[0];
          }

          const pFlavor = prod.flavors?.[sels.flavorIndex];
          const pPrice = entry.customPrice != null ? entry.customPrice : (pSize ? pSize.price : prod.price);
          const pOldPrice = pSize?.oldPrice || prod.oldPrice || pPrice;
          const qty = entry.quantity || 1;
          
          dynamicComboPrice += pPrice * qty;
          dynamicComboOldPrice += pOldPrice * qty;

          // Check stock
          if (pSize && pSize.inStock === false) comboStockValid = false;
          else if (pFlavor && pFlavor.inStock === false) comboStockValid = false;
          else if (!pSize && !pFlavor && prod.inStock === false) comboStockValid = false;
        } else {
          comboStockValid = false;
        }
      } else {
        // Required group has no selection yet
        comboStockValid = false;
      }
    });

    // 3. Override if combo has a manual price
    if (product.manualOverridePrice) {
      dynamicComboPrice = product.manualOverridePrice;
    }
  }

  // Final Pricing — If we have a specific size selection for the combo itself (with its own price), use it.
  // This allows overriding the automatic sum in the Variant tab.
  const finalPrice = isComboItem ? (currentSize?.price || dynamicComboPrice) : (currentSize?.price || currentFlavor?.price || product.price || 0);
  const finalOldPrice = isComboItem ? (currentSize?.oldPrice || dynamicComboOldPrice) : (currentSize?.oldPrice || null);
  const finalSavings = finalOldPrice && finalOldPrice > finalPrice ? Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100) : 0;
  const isInStock = isComboItem ? comboStockValid : (currentSize ? currentSize.inStock !== false : (currentFlavor?.inStock !== false));

  const handleComboFlavorSelect = (productId, flavorName) => {
    setComboSelections(prev => ({
      ...prev,
      [productId]: flavorName
    }));
  };

  const handleAddToCart = () => {
    const safeId = product._id || product.id;
    const key = isComboItem ? `combo-${safeId}-${Date.now()}` : `${safeId}-${selectedFlavor}-${selectedSize}`;

    const itemData = {
      key,
      productId: safeId,
      comboId: isComboItem ? safeId : undefined,
      name: product.name || product.comboName || 'Premium Stack',
      flavorName: isComboItem ? (currentFlavor?.name || 'Combo Stack') : (currentFlavor?.name || 'Regular'),
      weight: isComboItem ? product.weight : (currentSize?.weight || ''),
      price: finalPrice,
      image: isComboItem ? (resolveImage(currentFlavor?.image) || product.image?.replace(/\.png$/i, '.webp')) : (resolveImage(currentFlavor?.image) || `/images/${product.slug}.webp`),
      qty,
      isCombo: isComboItem || false,
    };

    if (isComboItem) {
      itemData.comboSelections = [];
      if (productsInCombo.length > 0) {
        productsInCombo.forEach(p => {
          const pId = p._id || p.id;
          itemData.comboSelections.push({
            productId: pId,
            name: p.name,
            flavor: comboSelections[pId] || (p.flavors?.[0]?.name || 'Regular'),
            quantity: p.quantity || 1
          });
        });
      }
      if (comboGroups.length > 0) {
        comboGroups.forEach(g => {
          const selectedPid = groupSelections[g.key];
          if (selectedPid) {
            const entry = g.products.find(p => (p.productId?._id || p.productId || p._id || p.id) === selectedPid);
            const prod = entry?.productId || entry;
            if (prod) {
              const sels = groupProdSelections[selectedPid] || { flavorIndex: 0, sizeIndex: 0 };
              itemData.comboSelections.push({
                productId: selectedPid,
                name: prod.name,
                flavor: prod.flavors?.[sels.flavorIndex]?.name || 'Regular',
                weight: prod.sizes?.[sels.sizeIndex]?.weight || '',
                quantity: 1
              });
            }
          }
        });
      }
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
        phone: notifyPhone,
        productId: product._id,
        variantKey: `${currentFlavor?.name || 'Regular'}-${currentSize?.weight || 'Default'}`
      });
      if (res.success) {
        setNotifySuccess(true);
        setNotifyEmail('');
        setNotifyPhone('');
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
        groupImages={groupImages}
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
                navigator.share({ title: product.name, url: window.location.href }).catch(() => { });
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
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
              ₹{finalPrice.toLocaleString()}
            </span>
            {finalOldPrice && finalOldPrice > finalPrice && (
              <span className="old-price" style={{ fontSize: '18px' }}>₹{finalOldPrice.toLocaleString()}</span>
            )}
            {finalSavings > 0 && (
              <span className="discount" style={{ fontSize: '14px' }}>{finalSavings}% OFF</span>
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
        {flavors.length > 0 && (
          <div className="flavor-selector">
            <span className="flavor-label">Flavor: <strong style={{ color: 'var(--text-primary)' }}>{flavors[selectedFlavor]?.name}</strong></span>
            <div className="flavor-pills">
              {flavors.map((f, i) => (
                <button
                  key={i}
                  className={`flavor-pill${selectedFlavor === i ? ' active' : ''}${f.inStock === false ? ' disabled' : ''}`}
                  onClick={() => setSelectedFlavor(i)}
                  style={{ 
                    opacity: f.inStock === false ? 0.4 : 1, 
                    cursor: f.inStock === false ? 'not-allowed' : 'pointer',
                    textDecoration: f.inStock === false ? 'line-through' : 'none'
                  }}
                  title={f.inStock === false ? 'Out of Stock' : f.name}
                >
                  {f.name}
                  {f.inStock === false && <span style={{ fontSize: '9px', marginLeft: '4px', color: '#e74c3c', textDecoration: 'none' }}>✗</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Included in Stack (Combo only) */}
        {isComboItem && (productsInCombo.length > 0 || comboGroups.length > 0) && (
          <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px', letterSpacing: '1px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              Configure Your Stack
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. Combo Groups (Configurable Choices) - Priority UI */}
              {comboGroups.map((g, gi) => {
                const selectedPid = groupSelections[g.key];
                const entry = g.products.find(p => (p.productId?._id || p.productId || p._id || p.id) === selectedPid);
                const selectedProd = entry?.productId || entry;
                const sels = groupProdSelections[selectedPid] || { flavorIndex: 0, sizeIndex: 0 };

                return (
                  <div key={g.key} style={{ paddingBottom: '20px', borderBottom: (gi < comboGroups.length - 1 || productsInCombo.length > 0) ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>{g.label}:</div>
                    
                    {/* Product Selection Pills (Better UX than dropdown) */}
                    <div className="flavor-pills" style={{ marginBottom: '15px' }}>
                      {g.products.map(p => {
                          const pid = p.productId?._id || p.productId || p._id || p.id;
                          const pName = p.productId?.name || p.name || 'Unknown';
                          const isActive = selectedPid === pid;
                          const fullProd = p.productId || p;
                          const available = fullProd.sizes?.length > 0 ? fullProd.sizes.some(s => s.inStock !== false) : (fullProd.flavors?.length > 0 ? fullProd.flavors.some(f => f.inStock !== false) : (fullProd.stockLeft > 0 || fullProd.inStock !== false));
                          return (
                            <button 
                              key={pid}
                              className={`flavor-pill${isActive ? ' active' : ''}`}
                              onClick={() => {
                                setGroupSelections(prev => ({ ...prev, [g.key]: pid }));
                                setGroupProdSelections(prev => ({ ...prev, [pid]: prev[pid] || { flavorIndex: 0, sizeIndex: 0 } }));
                              }}
                              style={{ textDecoration: available ? 'none' : 'line-through', opacity: available ? 1 : 0.5 }}
                            >
                              {pName} {!available ? ' (OUT)' : ''}
                            </button>
                          );
                      })}
                    </div>

                    {/* Variant Selection for chosen product */}
                    {selectedProd && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                        
                        {/* Sizes / Weights */}
                        {selectedProd.sizes && selectedProd.sizes.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '50px' }}>WEIGHT:</span>
                            <div className="flavor-pills">
                              {selectedProd.sizes.map((s, si) => (
                                <button
                                  key={si}
                                  className={`flavor-pill${sels.sizeIndex === si ? ' active' : ''}${s.inStock === false ? ' disabled' : ''}`}
                                  onClick={() => setGroupProdSelections(prev => ({ ...prev, [selectedPid]: { ...sels, sizeIndex: si } }))}
                                  style={{ fontSize: '10px', padding: '3px 8px', textDecoration: s.inStock === false ? 'line-through' : 'none', opacity: s.inStock === false ? 0.5 : 1 }}
                                  disabled={s.inStock === false}
                                >
                                  {s.weight} {s.inStock === false && ' ✗'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Flavors */}
                        {selectedProd.flavors && selectedProd.flavors.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '50px' }}>FLAVOR:</span>
                            <div className="flavor-pills">
                              {selectedProd.flavors.map((f, fi) => (
                                <button
                                  key={fi}
                                  className={`flavor-pill${sels.flavorIndex === fi ? ' active' : ''}${f.inStock === false ? ' disabled' : ''}`}
                                  onClick={() => setGroupProdSelections(prev => ({ ...prev, [selectedPid]: { ...sels, flavorIndex: fi } }))}
                                  style={{ fontSize: '10px', padding: '3px 8px', textDecoration: f.inStock === false ? 'line-through' : 'none', opacity: f.inStock === false ? 0.5 : 1 }}
                                  disabled={f.inStock === false}
                                >
                                  {f.name} {f.inStock === false && ' ✗'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 2. Fixed Products (Non-configurable) */}
              {productsInCombo.length > 0 && (
                <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Included Basics:</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {productsInCombo.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '6px' }}>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>{p.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Included in Stack
                            </div>
                          </div>
                          <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>x{p.quantity || 1}</div>
                        </div>
                    ))}
                   </div>
                </div>
              )}

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
                  style={{ textDecoration: s.inStock === false ? 'line-through' : 'none', opacity: s.inStock === false ? 0.5 : 1 }}
                >
                  {s.weight}
                  <span style={{ marginLeft: '6px', color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>₹{s.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Qty + Add to Cart */}
        <div className="buy-actions-container" style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
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
                <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: '#fff' }}
                  />
                  <input
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: '#fff' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Join Notify List</button>
                </form>
              )}
              {notifySuccess && <div style={{ color: 'var(--green)', fontSize: '14px', textAlign: 'center', padding: '10px' }}>✓ You&apos;re on the list!</div>}
            </div>
          )}
        </div>

        {/* MOBILE STICKY BOTTOM BAR */}
        <div className="mobile-sticky-buy-bar">
          <div className="sticky-price-info">
            <span className="sticky-price">₹{finalPrice.toLocaleString()}</span>
            <span className="sticky-variant">{isComboItem ? 'Combo Stack' : (currentFlavor?.name || currentSize?.weight || '')}</span>
          </div>
          {isInStock ? (
            <button className="btn-add-cart sticky-cta" onClick={handleAddToCart}>
              {addedFeedback ? '✓ Added' : '🛒 Buy Now'}
            </button>
          ) : (
            <button className="btn-notify sticky-cta" onClick={() => setShowNotifyForm(true)}>Notify</button>
          )}
        </div>

        {/* Product Information Accordion (Mobile Friendly) */}
        <div className="product-details-accordion" style={{ marginTop: '30px' }}>
          <details className="accordion-item" open>
            <summary className="accordion-header">Description & About</summary>
            <div className="accordion-content">
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
                {product.description || 'Premium quality supplement for serious athletes.'}
              </p>
              <ul style={{ marginTop: '15px', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <li>✓ Professional Grade Formula</li>
                <li>✓ Maximizes Nutrient Absorption</li>
                <li>✓ Authentic & Lab Tested</li>
                <li>✓ Performance Oriented</li>
              </ul>
            </div>
          </details>

          {isComboItem && productsInCombo.length > 0 && (
            <details className="accordion-item">
              <summary className="accordion-header">Stack Details / What&apos;s Included</summary>
              <div className="accordion-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {productsInCombo.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < productsInCombo.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      {p.image && <img src={resolveImage(p.image)} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quantity: {p.quantity || 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          {product.nutritionalFacts && product.nutritionalFacts.length > 0 && (
            <details className="accordion-item">
              <summary className="accordion-header">Nutritional Facts</summary>
              <div className="accordion-content">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {product.nutritionalFacts.map((line, idx) => (
                    <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          {product.ingredients && (
            <details className="accordion-item">
              <summary className="accordion-header">Ingredients</summary>
              <div className="accordion-content">
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{product.ingredients}</p>
              </div>
            </details>
          )}


          <details className="accordion-item">
            <summary className="accordion-header">Customer Reviews ({reviews.length})</summary>
            <div className="accordion-content">
              {reviews.length === 0 && !reviewSubmitted && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No reviews yet. Be the first!</p>
              )}
              {reviews.slice(0, 5).map((r, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.name}</span>
                    <span style={{ color: '#f5a623', fontSize: '12px' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{r.comment}</p>
                </div>
              ))}

              {reviewSubmitted ? (
                <div style={{ color: 'var(--green)', fontSize: '13px', fontWeight: '600', marginTop: '16px' }}>✓ Thank you! Review submitted.</div>
              ) : (
                <form onSubmit={handleSubmitReview} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} required placeholder="Your name" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: s <= reviewRating ? '#f5a623' : 'var(--border)' }}>★</button>
                    ))}
                  </div>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required placeholder="Your feedback..." rows={2} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '12px' }}>Submit</button>
                </form>
              )}
            </div>
          </details>
        </div>

        {finalOldPrice && finalOldPrice > finalPrice && (
          <div className="market-comparison-card">
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Market Price (MRP)</td>
                  <td style={{ textAlign: 'right', textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '13px' }}>₹{finalOldPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Living Result Price</td>
                  <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold', fontSize: '16px' }}>₹{finalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '13px', color: 'var(--green)', fontWeight: 'bold' }}>
              💰 Instant Savings of ₹{(finalOldPrice - finalPrice).toLocaleString()}!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
