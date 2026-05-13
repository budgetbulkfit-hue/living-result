'use client';

import { useState, useMemo, useEffect } from 'react';
import useCart from '@/lib/cartStore';
import { subscribeToRestock } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const COMBO_DISCOUNT = 30;

const STACK_GOALS = [
  { 
    id: 'bulk', 
    name: '💪 BULK & SIZE', 
    desc: 'Massive strength & mass', 
    theme: { bg: 'linear-gradient(145deg, #1f1209, #3a1c00)', accent: '#ff6a00', glow: 'rgba(255, 106, 0, 0.4)', highlightColor: '#FFD700' },
    coreSubcat: ['Mass Gainer', 'Weight Gainer', 'Hydra Bulk Mass', 'mass'], 
    boostSubcat: ['Creatine', 'creatine'], 
    reason: ['✔ Hard Gainers', '✔ Heavy Lifters', '✔ Extreme Bulking'] 
  },
  { 
    id: 'lean', 
    name: '⚡ LEAN & SHRED', 
    desc: 'Lean muscle focus', 
    theme: { bg: 'linear-gradient(145deg, #09151f, #002b4d)', accent: '#00c6ff', glow: 'rgba(0, 198, 255, 0.4)', highlightColor: '#00f0ff' },
    coreSubcat: ['Whey Protein', 'Whey Protein Blend', 'Hydra Whey Protein', 'whey'], 
    boostSubcat: ['Creatine', 'creatine'], 
    reason: ['✔ Lean Muscle', '✔ Zero Fat', '✔ Definition'] 
  },
  { 
    id: 'performance', 
    name: '🧬 PERFORMANCE', 
    desc: 'Recovery & power', 
    theme: { bg: 'linear-gradient(145deg, #1f091f, #4d004d)', accent: '#ff00cc', glow: 'rgba(255, 0, 204, 0.4)', highlightColor: '#ff00cc' },
    coreSubcat: ['Iso Plasma', 'Isolate', 'ISO Plasma Zero Protein', 'iso'], 
    boostSubcat: ['Creatine', 'creatine'], 
    reason: ['✔ Daily Fuel', '✔ Fast Recovery', '✔ Endurance'] 
  },
];

function getProductPrice(product, sizeIdx, flavorIdx) {
  if (!product) return 0;
  if (product.sizes?.length > 0 && product.sizes[sizeIdx]) return product.sizes[sizeIdx].price;
  if (product.flavors?.length > 0 && product.flavors[flavorIdx]) return product.flavors[flavorIdx].price;
  return product.price || 0;
}

function getProductImage(product, flavorIdx) {
  if (!product) return '/images/logo.png';
  return product.flavors?.[flavorIdx]?.image || product.flavors?.[0]?.image || `/images/${product.slug}.png`;
}

export default function ComboConfigurator({ products = [] }) {
  const addItem = useCart(s => s.addItem);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stack State
  const [activeGoal, setActiveGoal] = useState(STACK_GOALS[0]);
  const [coreSel, setCoreSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [boostSel, setBoostSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [step, setStep] = useState(1); // 1: Main Fuel, 2: Boost, 3: Review (Mobile)

  // Notify State
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Group Products
  const coreProducts = useMemo(() => {
    return products.filter(p => {
      const isCoreGroup = p.stackGroup === 'core';
      const isProteinSubcat = ['Whey Protein', 'Mass Gainer', 'Iso Plasma', 'Weight Gainer', 'Protein Blend', 'Isolate'].includes(p.subCategory);
      const isUniqueName = p.name.toLowerCase().includes('hydra') || p.name.toLowerCase().includes('iso plasma') || p.name.toLowerCase().includes('mass') || p.name.toLowerCase().includes('whey');
      return isCoreGroup || isProteinSubcat || isUniqueName;
    }).sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0));
  }, [products]);

  const boostProducts = useMemo(() => {
    return products.filter(p => p.stackGroup === 'boost' || p.subCategory === 'Creatine' || p.name.toLowerCase().includes('creatine'))
      .sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0));
  }, [products]);

  // Reset notify state when selections change
  useEffect(() => {
    setNotifySuccess(false);
    setShowNotifyForm(false);
  }, [coreSel, boostSel]);

  // Apply Goal Template
  useEffect(() => {
    const cProd = coreProducts.find(p => p.subCategory === activeGoal.coreSubcat) || coreProducts[0];
    const bProd = boostProducts.find(p => p.subCategory === activeGoal.boostSubcat) || boostProducts[0];
    if (cProd && !coreSel.product) setCoreSel({ product: cProd, sizeIdx: 0, flavorIdx: 0 });
    if (bProd && !boostSel.product) setBoostSel({ product: bProd, sizeIdx: 0, flavorIdx: 0 });
  }, [activeGoal, coreProducts, boostProducts]);

  // Pricing & Stock
  const corePrice = getProductPrice(coreSel.product, coreSel.sizeIdx, coreSel.flavorIdx);
  const boostPrice = getProductPrice(boostSel.product, boostSel.sizeIdx, boostSel.flavorIdx);
  const subtotal = corePrice + boostPrice;
  const finalPrice = subtotal > 0 ? Math.max(0, subtotal - COMBO_DISCOUNT) : 0;
  const isComplete = coreSel.product && boostSel.product;

  const checkStock = (prod, sizeObj, flavorObj) => {
    if (!prod) return true;
    if (prod.variants?.length > 0) {
      const flavorName = flavorObj?.name || 'Regular';
      const weightLabel = sizeObj?.weight || '';
      const v = prod.variants.find(v => v.flavor === flavorName && (!weightLabel || v.weight === weightLabel));
      if (v) return v.availableStock > 0;
    }
    if (sizeObj) return sizeObj.inStock !== false;
    if (flavorObj) return flavorObj.inStock !== false;
    return prod.stockLeft > 0;
  };

  const coreInStock = checkStock(coreSel.product, coreSel.product?.sizes?.[coreSel.sizeIdx], coreSel.product?.flavors?.[coreSel.flavorIdx]);
  const boostInStock = checkStock(boostSel.product, boostSel.product?.sizes?.[boostSel.sizeIdx], boostSel.product?.flavors?.[boostSel.flavorIdx]);
  const isInStock = coreInStock && boostInStock;

  const stackPower = isComplete ? (activeGoal.id === 'bulk' ? 98 : activeGoal.id === 'lean' ? 95 : 92) : 50;

  const handleAddToCart = () => {
    if (!isComplete) return;
    
    const cSizeObj = coreSel.product.sizes?.[coreSel.sizeIdx];
    const bSizeObj = boostSel.product.sizes?.[boostSel.sizeIdx];

    const item = {
      key: `custom-combo-${Date.now()}`,
      isCombo: true,
      isCustomCombo: true,
      name: `STACK LAB™ ${activeGoal.name.replace(/[^a-zA-Z &]/g, '').trim()} Stack`,
      flavorName: "Custom Stack",
      price: finalPrice,
      qty: 1,
      image: getProductImage(coreSel.product, coreSel.flavorIdx),
      generatedThumbnail: true,
      coreImg: getProductImage(coreSel.product, coreSel.flavorIdx),
      boostImg: getProductImage(boostSel.product, boostSel.flavorIdx),
      comboSelections: [
        {
          role: "core",
          productId: coreSel.product._id,
          name: coreSel.product.name,
          flavor: coreSel.product.flavors?.[coreSel.flavorIdx]?.name || 'Regular',
          sizeId: cSizeObj?._id || cSizeObj?.weight || '',
          weight: cSizeObj?.weight || '',
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
      const oosSizeObj = !coreInStock ? coreSel.product?.sizes?.[coreSel.sizeIdx] : boostSel.product?.sizes?.[boostSel.sizeIdx];
      const oosFlavorObj = !coreInStock ? coreSel.product?.flavors?.[coreSel.flavorIdx] : boostSel.product?.flavors?.[boostSel.flavorIdx];
      
      const res = await subscribeToRestock({
        email: notifyEmail,
        phoneNumber: notifyPhone,
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

  const renderProductCards = (options, sel, setSel) => {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Left Arrow */}
        <button 
          onClick={(e) => {
            const scrollContainer = e.currentTarget.nextElementSibling;
            if (scrollContainer) scrollContainer.scrollBy({ left: -250, behavior: 'smooth' });
          }}
          style={{
            position: 'absolute', left: '-15px', zIndex: 10,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
            color: '#fff', borderRadius: '50%', width: '32px', height: '32px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          &lt;
        </button>

        {/* Scroll Container */}
        <div className="horizontal-scroll" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', paddingLeft: '10px', paddingRight: '10px', msOverflowStyle: 'none', scrollbarWidth: 'none', scrollBehavior: 'smooth', width: '100%' }}>
          {options.map(p => {
            const isSelected = sel.product?._id === p._id;
            const available = isProductAvailable(p);
            
            // Check if this product belongs to the active goal's highlighted subcategories
            const isHighlighted = activeGoal.coreSubcat.some(sub => 
              p.subCategory?.toLowerCase() === sub.toLowerCase() || 
              p.name.toLowerCase().includes(sub.toLowerCase())
            );

            let borderColor = 'var(--border)';
            let boxShadow = 'none';

            if (isSelected) {
              borderColor = activeGoal.theme.accent;
              boxShadow = `0 0 20px ${activeGoal.theme.glow}`;
            } else if (isHighlighted) {
              borderColor = activeGoal.theme.highlightColor;
              boxShadow = `0 0 10px ${activeGoal.theme.highlightColor}40`;
            }

            return (
              <motion.div 
                key={p._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSel({ product: p, sizeIdx: 0, flavorIdx: 0 }); }}
                style={{
                  minWidth: '160px',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '15px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: boxShadow,
                  transition: '0.3s ease',
                  opacity: available ? 1 : 0.5
                }}
              >
                {(p.tags?.includes('bestseller') || p.isBestseller) && (
                  <div style={{ position: 'absolute', top: '-8px', left: '10px', background: 'var(--accent)', color: '#fff', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    BESTSELLER
                  </div>
                )}
                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <img src={getProductImage(p, 0)} alt={p.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: '1.2' }}>{p.name}</div>
                {!available && <div style={{ fontSize: '10px', color: 'var(--red)', textAlign: 'center', marginTop: '4px', fontWeight: 'bold' }}>OUT OF STOCK</div>}
              </motion.div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={(e) => {
            const scrollContainer = e.currentTarget.previousElementSibling;
            if (scrollContainer) scrollContainer.scrollBy({ left: 250, behavior: 'smooth' });
          }}
          style={{
            position: 'absolute', right: '-15px', zIndex: 10,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
            color: '#fff', borderRadius: '50%', width: '32px', height: '32px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          &gt;
        </button>
      </div>
    );
  };

  const renderVariantPills = (items, selectedIdx, onSelect, type) => {
    if (!items || items.length <= 1) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
        {items.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          const available = item.inStock !== false && item.availableStock !== 0; // simple check
          return (
            <div 
              key={idx}
              onClick={() => onSelect(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${isSelected ? activeGoal.theme.accent : 'var(--border)'}`,
                color: isSelected ? '#fff' : (available ? 'var(--text-secondary)' : '#555'),
                boxShadow: isSelected ? `0 0 10px ${activeGoal.theme.glow}` : 'none',
                transition: '0.2s ease',
                textDecoration: available ? 'none' : 'line-through'
              }}
            >
              {type === 'flavor' ? item.name : item.weight}
            </div>
          );
        })}
      </div>
    );
  };

  const isProductAvailable = (prod) => {
    if (!prod) return false;
    if (prod.variants?.length > 0) return prod.variants.some(v => v.availableStock > 0);
    if (prod.sizes?.length > 0) return prod.sizes.some(s => s.inStock !== false);
    if (prod.flavors?.length > 0) return prod.flavors.some(f => f.inStock !== false);
    return prod.stockLeft > 0;
  };

  const renderConfiguratorSteps = () => (
    <>
      {/* STEP 1 */}
      {(!isMobile || step === 1) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="config-step">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>STEP 1 — MAIN FUEL</h3>
            {!isMobile && coreSel.product && <span style={{ color: '#2ecc71', fontSize: '14px' }}>✔ SELECTED</span>}
          </div>
          {renderProductCards(coreProducts, coreSel, setCoreSel)}
          {coreSel.product && (
            <div style={{ marginTop: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Variant Select</div>
              {renderVariantPills(coreSel.product.flavors, coreSel.flavorIdx, (idx) => setCoreSel({...coreSel, flavorIdx: idx}), 'flavor')}
              {renderVariantPills(coreSel.product.sizes, coreSel.sizeIdx, (idx) => setCoreSel({...coreSel, sizeIdx: idx}), 'size')}
            </div>
          )}
          {isMobile && (
            <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setStep(2)}>NEXT STEP</button>
          )}
        </motion.div>
      )}

      {/* STEP 2 */}
      {(!isMobile || step === 2) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="config-step" style={{ marginTop: isMobile ? '0' : '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>STEP 2 — BOOST</h3>
            {!isMobile && boostSel.product && <span style={{ color: '#2ecc71', fontSize: '14px' }}>✔ SELECTED</span>}
          </div>
          {renderProductCards(boostProducts, boostSel, setBoostSel)}
          {boostSel.product && (
            <div style={{ marginTop: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Variant Select</div>
              {renderVariantPills(boostSel.product.flavors, boostSel.flavorIdx, (idx) => setBoostSel({...boostSel, flavorIdx: idx}), 'flavor')}
              {renderVariantPills(boostSel.product.sizes, boostSel.sizeIdx, (idx) => setBoostSel({...boostSel, sizeIdx: idx}), 'size')}
            </div>
          )}
          {isMobile && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>BACK</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>REVIEW STACK</button>
            </div>
          )}
        </motion.div>
      )}
    </>
  );

  return (
    <div className="stack-lab-container" style={{ margin: '40px 0', padding: isMobile ? '0 10px' : '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <motion.h2 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '32px' : '40px', textTransform: 'uppercase', letterSpacing: '3px', background: 'linear-gradient(135deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          BUILD YOUR STACK
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '10px' }}>Select your goal to configure the ultimate performance machine.</p>
      </div>

      {/* Goal Selector */}
      {(!isMobile || step === 1) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' }}>
          {STACK_GOALS.map(goal => {
            const isActive = activeGoal.id === goal.id;
            return (
              <motion.div
                key={goal.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveGoal(goal); if(isMobile) setStep(1); }}
                style={{
                  background: isActive ? goal.theme.bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? goal.theme.accent : 'var(--border)'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 10px 30px ${goal.theme.glow}` : 'none',
                  transition: 'all 0.4s ease'
                }}
              >
                {isActive && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(45deg, transparent, ${goal.theme.glow}, transparent)`, opacity: 0.2 }}></div>}
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>{goal.name}</h3>
                <p style={{ color: isActive ? '#eee' : 'var(--text-muted)', fontSize: '12px' }}>{goal.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile && step !== 3 ? '1fr' : isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '20px' : '40px', alignItems: 'start' }}>
        
        {/* Left: Configurator */}
        {(!isMobile || step !== 3) && (
          <div>
            {renderConfiguratorSteps()}
          </div>
        )}

        {/* Right: Cinematic Hero & Checkout */}
        {(!isMobile || step === 3) && (
          <div style={{ position: 'sticky', top: '90px' }}>
            {/* Cinematic Poster */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeGoal.id}
              style={{ 
                background: activeGoal.theme.bg, 
                border: `1px solid rgba(255,255,255,0.1)`, 
                borderRadius: '20px', overflow: 'hidden', position: 'relative', height: isMobile ? '300px' : '400px',
                boxShadow: `0 20px 50px rgba(0,0,0,0.8), inset 0 0 50px ${activeGoal.theme.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 1 }}></div>
              
              <AnimatePresence>
                {coreSel.product && (
                  <motion.img 
                    key={`core-${coreSel.product._id}-${coreSel.flavorIdx}`}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: [0, -10, 0], opacity: 1, scale: 1 }}
                    transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, opacity: { duration: 0.5 } }}
                    src={getProductImage(coreSel.product, coreSel.flavorIdx)} 
                    style={{ position: 'absolute', height: '75%', left: '10%', bottom: '10%', zIndex: 3, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.9))' }} 
                    alt="Core"
                  />
                )}
                {boostSel.product && (
                  <motion.img 
                    key={`boost-${boostSel.product._id}-${boostSel.flavorIdx}`}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: [0, -15, 0], opacity: 1, scale: 1 }}
                    transition={{ y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.2 }, opacity: { duration: 0.5 } }}
                    src={getProductImage(boostSel.product, boostSel.flavorIdx)} 
                    style={{ position: 'absolute', height: '55%', right: '15%', bottom: '5%', zIndex: 2, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.9))' }} 
                    alt="Boost" 
                  />
                )}
              </AnimatePresence>

              {/* Stack Power Meter */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 4, textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Stack Power</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${stackPower}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: activeGoal.theme.accent }}></motion.div>
                  </div>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{stackPower}%</span>
                </div>
              </div>

              {/* Stack Name Overlay */}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 4 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#fff', textTransform: 'uppercase', lineHeight: '1.1', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                  {activeGoal.name.replace(/[^a-zA-Z &]/g, '').trim()}<br/><span style={{ color: activeGoal.theme.accent }}>STACK</span>
                </h3>
              </div>
            </motion.div>

            {/* AI Intelligence */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeGoal.theme.accent, boxShadow: `0 0 10px ${activeGoal.theme.accent}` }}></div>
                <h4 style={{ color: '#fff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Intelligence</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {activeGoal.reason.map((r, i) => (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: activeGoal.theme.accent }}>✦</span> {r.replace('✔ ', '')}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Checkout Card */}
            {isComplete && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginTop: '20px', padding: '24px', background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 16px', background: 'rgba(46,204,64,0.1)', color: '#2ecc71', fontSize: '11px', fontWeight: 'bold', borderBottomLeftRadius: '12px' }}>
                  🔥 YOU SAVE ₹{COMBO_DISCOUNT}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <span>Stack Value</span>
                  <span style={{ textDecoration: 'line-through' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Price</span>
                  <span style={{ color: activeGoal.theme.accent, fontWeight: '900', fontSize: '32px', fontFamily: 'var(--font-heading)' }}>₹{finalPrice.toLocaleString()}</span>
                </div>
                
                {isInStock ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    style={{ width: '100%', padding: '18px', background: activeGoal.theme.accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 10px 20px ${activeGoal.theme.glow}` }}
                  >
                    {addedSuccess ? '✓ SECURED' : '🛒 INITIALIZE STACK'}
                  </motion.button>
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
                    {notifySuccess && <div style={{ color: 'var(--green)', fontSize: '14px', textAlign: 'center', padding: '10px' }}>✓ You&apos;re on the restock list!</div>}
                  </div>
                )}
              </motion.div>
            )}

            {isMobile && step === 3 && (
              <button className="btn-outline" style={{ width: '100%', marginTop: '15px' }} onClick={() => setStep(2)}>EDIT STACK</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
