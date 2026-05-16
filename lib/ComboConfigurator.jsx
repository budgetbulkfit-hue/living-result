'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import useCart from '@/lib/cartStore';
import { subscribeToRestock } from '@/lib/api';

const COMBO_DISCOUNT = 30;

const QUICK_TEMPLATES = [
  { id: 'bulking', name: '💪 BULKING STACK', coreSubcat: 'Mass Gainer', boostSubcat: 'Creatine', reason: ['✔ Extreme Bulking', '✔ Strength', '✔ Fast Recovery'] },
  { id: 'lean', name: '⚡ LEAN STACK', coreSubcat: 'Iso Plasma', boostSubcat: 'Creatine', reason: ['✔ Lean Muscle', '✔ Zero Fat', '✔ Definition'] },
  { id: 'performance', name: '🔥 STRENGTH STACK', coreSubcat: 'Whey Protein', boostSubcat: 'Creatine', reason: ['✔ Daily Fuel', '✔ Performance', '✔ Endurance'] },
];

function getProductPrice(product, sizeIdx, flavorIdx) {
  if (!product) return 0;
  if (product.sizes?.length > 0 && product.sizes[sizeIdx]) return product.sizes[sizeIdx].price;
  if (product.flavors?.length > 0 && product.flavors[flavorIdx]) return product.flavors[flavorIdx].price;
  return product.price || 0;
}

function getProductImage(product, flavorIdx) {
  if (!product) return '/images/logo.webp';
  const img = product.flavors?.[flavorIdx]?.image || product.flavors?.[0]?.image || `/images/${product.slug}.webp`;
  return img ? img.replace(/\.png$/i, '.webp') : img;
}

export default function ComboConfigurator({ products = [] }) {
  const addItem = useCart(s => s.addItem);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Group Products
  const coreProducts = useMemo(() => {
    return products.filter(p => p.stackGroup === 'core' || ['Whey Protein', 'Mass Gainer', 'Iso Plasma'].includes(p.subCategory))
      .sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0));
  }, [products]);

  const boostProducts = useMemo(() => {
    return products.filter(p => p.stackGroup === 'boost' || p.subCategory === 'Creatine')
      .sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0));
  }, [products]);

  // Selections
  const [coreSel, setCoreSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [boostSel, setBoostSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [activeReason, setActiveReason] = useState(null);
  
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Initialize with Bulking Stack
  useEffect(() => {
    if (coreProducts.length > 0 && boostProducts.length > 0 && !coreSel.product && !boostSel.product) {
      applyTemplate(QUICK_TEMPLATES[0]);
    }
  }, [coreProducts, boostProducts]);

  const applyTemplate = (tpl) => {
    const cProd = coreProducts.find(p => p.subCategory === tpl.coreSubcat) || coreProducts[0];
    const bProd = boostProducts.find(p => p.subCategory === tpl.boostSubcat) || boostProducts[0];
    if (cProd) setCoreSel({ product: cProd, sizeIdx: 0, flavorIdx: 0 });
    if (bProd) setBoostSel({ product: bProd, sizeIdx: 0, flavorIdx: 0 });
    setActiveReason(tpl.reason);
  };

  // Pricing
  const corePrice = getProductPrice(coreSel.product, coreSel.sizeIdx, coreSel.flavorIdx);
  const boostPrice = getProductPrice(boostSel.product, boostSel.sizeIdx, boostSel.flavorIdx);
  const subtotal = corePrice + boostPrice;
  const finalPrice = subtotal > 0 ? Math.max(0, subtotal - COMBO_DISCOUNT) : 0;
  const isComplete = coreSel.product && boostSel.product;

  const cSizeObj = coreSel.product?.sizes?.[coreSel.sizeIdx];
  const cFlavorObj = coreSel.product?.flavors?.[coreSel.flavorIdx];
  const bSizeObj = boostSel.product?.sizes?.[boostSel.sizeIdx];
  const bFlavorObj = boostSel.product?.flavors?.[boostSel.flavorIdx];

  const coreInStock = coreSel.product ? (cSizeObj ? cSizeObj.inStock !== false : (cFlavorObj ? cFlavorObj.inStock !== false : coreSel.product.inStock !== false)) : true;
  const boostInStock = boostSel.product ? (bSizeObj ? bSizeObj.inStock !== false : (bFlavorObj ? bFlavorObj.inStock !== false : boostSel.product.inStock !== false)) : true;
  const isInStock = coreInStock && boostInStock;

  const handleAddToCart = () => {
    if (!isComplete) return;
    
    // Fallback ID for sizes if _id is missing
    const cSizeObj = coreSel.product.sizes?.[coreSel.sizeIdx];
    const bSizeObj = boostSel.product.sizes?.[boostSel.sizeIdx];

    const item = {
      key: `custom-combo-${Date.now()}`,
      isCombo: true,
      isCustomCombo: true,
      name: "STACK LAB™ Custom Stack",
      price: finalPrice,
      qty: 1,
      image: getProductImage(coreSel.product, coreSel.flavorIdx), // Main fallback for vanilla cart
      generatedThumbnail: true, // Marker for CartSidebar
      coreImg: getProductImage(coreSel.product, coreSel.flavorIdx),
      boostImg: getProductImage(boostSel.product, boostSel.flavorIdx),
      comboSelections: [
        {
          role: "core",
          productId: coreSel.product._id,
          name: coreSel.product.name,
          flavor: coreSel.product.flavors?.[coreSel.flavorIdx]?.name || 'Regular',
          sizeId: cSizeObj?._id || cSizeObj?.weight || '',
          weight: cSizeObj?.weight || '', // Keep for backward compat
          unitPrice: corePrice,
          quantity: 1
        },
        {
          role: "boost",
          productId: boostSel.product._id,
          name: boostSel.product.name,
          flavor: boostSel.product.flavors?.[boostSel.flavorIdx]?.name || 'Regular',
          sizeId: bSizeObj?._id || bSizeObj?.weight || '',
          weight: bSizeObj?.weight || '',
          unitPrice: boostPrice,
          quantity: 1
        }
      ]
    };

    addItem(item);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    try {
      const outOfStockProduct = !coreInStock ? coreSel.product : boostSel.product;
      const oosSizeObj = !coreInStock ? cSizeObj : bSizeObj;
      const oosFlavorObj = !coreInStock ? cFlavorObj : bFlavorObj;
      
      const res = await subscribeToRestock({
        email: notifyEmail,
        phone: notifyPhone,
        productId: outOfStockProduct._id,
        variantKey: `${oosFlavorObj?.name || 'Regular'}-${oosSizeObj?.weight || 'Default'}`
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

  const renderSelector = (title, sel, setSel, options) => {
    if (!options.length) return null;
    return (
      <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
        
        {/* Product Select */}
        <select 
          style={{ width: '100%', padding: '10px', background: '#0a0a0a', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '10px' }}
          value={sel.product?._id || ''}
          onChange={(e) => {
            const p = options.find(o => o._id === e.target.value);
            setSel({ product: p, sizeIdx: 0, flavorIdx: 0 });
            setActiveReason(null);
          }}
        >
          <option value="" disabled>Select Product...</option>
          {options.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
        </select>

        {sel.product && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Flavor Select */}
            {sel.product.flavors?.length > 0 && (
              <select 
                style={{ width: '100%', padding: '8px', background: '#111', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px' }}
                value={sel.flavorIdx}
                onChange={(e) => setSel({ ...sel, flavorIdx: parseInt(e.target.value, 10) })}
              >
                {sel.product.flavors.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
              </select>
            )}
            
            {/* Size Select */}
            {sel.product.sizes?.length > 0 && (
              <select 
                style={{ width: '100%', padding: '8px', background: '#111', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px' }}
                value={sel.sizeIdx}
                onChange={(e) => setSel({ ...sel, sizeIdx: parseInt(e.target.value, 10) })}
              >
                {sel.product.sizes.map((s, i) => <option key={i} value={i}>{s.weight}</option>)}
              </select>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="stack-lab-container" style={{ margin: '40px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', textTransform: 'uppercase', letterSpacing: '2px', background: 'linear-gradient(135deg, #ff6a00, #ff0044)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          STACK LAB™
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>Build your ultimate custom performance stack and save.</p>
      </div>

      {/* Quick Templates */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        {QUICK_TEMPLATES.map(tpl => (
          <button 
            key={tpl.id}
            onClick={() => applyTemplate(tpl)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', 
              padding: '10px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap',
              cursor: 'pointer', transition: '0.2s ease', hover: { background: 'var(--accent)' }
            }}
            onMouseOver={(e) => e.target.style.borderColor = 'var(--accent)'}
            onMouseOut={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left: Configurator */}
        <div>
          {renderSelector("1. MAIN FUEL (CORE)", coreSel, setCoreSel, coreProducts)}
          
          <div style={{ textAlign: 'center', margin: '-10px 0 10px 0', color: 'var(--accent)', fontWeight: 'bold' }}>+</div>
          
          {renderSelector("2. PERFORMANCE BOOST", boostSel, setBoostSel, boostProducts)}

          {!isComplete && (
            <div style={{ padding: '15px', background: 'rgba(255,106,0,0.1)', color: 'var(--accent)', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', border: '1px dashed var(--accent)' }}>
              🔥 Add a Boost Product for ₹{COMBO_DISCOUNT} OFF!
            </div>
          )}
        </div>

        {/* Right: Live Poster & Summary */}
        <div style={{ position: 'sticky', top: '20px' }}>
          {/* Dynamic Poster Engine */}
          <div style={{ 
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '300px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* Background Effects */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,106,0,0.15) 0%, transparent 70%)' }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #000, transparent)' }}></div>
            
            {/* Products Layer */}
            {coreSel.product && (
              <img 
                src={getProductImage(coreSel.product, coreSel.flavorIdx)} 
                style={{ position: 'absolute', height: '70%', left: '15%', bottom: '10%', zIndex: 2, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))', transition: '0.3s ease' }} 
                alt="Core"
              />
            )}
            {boostSel.product && (
              <img 
                src={getProductImage(boostSel.product, boostSel.flavorIdx)} 
                style={{ position: 'absolute', height: '55%', right: '15%', bottom: '5%', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))', transition: '0.3s ease' }} 
                alt="Boost" 
              />
            )}

            {/* Overlay Text */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 3 }}>
              <span style={{ background: 'var(--accent)', color: '#fff', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', letterSpacing: '1px' }}>
                STACK LAB™
              </span>
            </div>
            
            {!coreSel.product && !boostSel.product && (
              <div style={{ color: 'var(--text-muted)', zIndex: 3, fontStyle: 'italic' }}>Select products to preview stack</div>
            )}
          </div>

          {/* Why This Stack? */}
          {activeReason && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
              <h5 style={{ color: '#fff', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase' }}>Why This Stack?</h5>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                {activeReason.map((r, i) => <div key={i}>{r}</div>)}
              </div>
            </div>
          )}

          {/* Price & Action */}
          {isComplete && (
            <div style={{ marginTop: '20px', padding: '20px', background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#2ecc71', fontSize: '13px', fontWeight: 'bold' }}>
                <span>Stack Discount</span>
                <span>-₹{COMBO_DISCOUNT}</span>
              </div>
              <hr style={{ borderColor: 'var(--border)', margin: '15px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Final Price</span>
                <span style={{ color: 'var(--accent)', fontWeight: '900', fontSize: '24px' }}>₹{finalPrice.toLocaleString()}</span>
              </div>
              
              <div style={{ background: 'rgba(46,204,64,0.1)', color: '#2ecc71', padding: '8px', textAlign: 'center', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>
                🔥 YOU SAVE ₹{COMBO_DISCOUNT}
              </div>

              {isInStock ? (
                <button 
                  onClick={handleAddToCart}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
                >
                  {addedSuccess ? '✓ ADDED TO CART' : '🛒 ADD STACK TO CART'}
                </button>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!showNotifyForm && !notifySuccess && (
                    <button
                      className="btn-notify"
                      style={{ width: '100%', padding: '16px', fontSize: '15px' }}
                      onClick={() => setShowNotifyForm(true)}
                    >
                      Out of Stock - Notify Me
                    </button>
                  )}

                  {showNotifyForm && !notifySuccess && (
                    <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="email"
                        placeholder="Your Email Address"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: '#fff' }}
                      />
                      <input
                        type="tel"
                        placeholder="Your Phone Number"
                        value={notifyPhone}
                        onChange={(e) => setNotifyPhone(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: '#fff' }}
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '14px 20px', justifyContent: 'center' }}>Notify When Available</button>
                    </form>
                  )}
                  {notifySuccess && <div style={{ color: 'var(--green)', fontSize: '14px', textAlign: 'center', padding: '10px' }}>✓ You're on the restock list!</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
