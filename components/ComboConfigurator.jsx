'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import useCart from '@/lib/cartStore';
import { subscribeToRestock } from '@/lib/api';
import { motion } from 'framer-motion';

const COMBO_DISCOUNT = 30;

const STACK_GOALS = [
  {
    id: 'bulk',
    name: '💪 BULK & SIZE',
    desc: 'Massive strength & mass',
    theme: { bg: 'linear-gradient(145deg,#1f1209,#3a1c00)', accent: '#ff6a00', glow: 'rgba(255,106,0,0.4)', highlight: '#FFD700' },
    coreSubcats: ['Mass Gainer', 'Weight Gainer', 'Hydra Bulk Mass'],
    reason: ['✔ Hard Gainers', '✔ Heavy Lifters', '✔ Extreme Bulking'],
  },
  {
    id: 'lean',
    name: '⚡ LEAN & SHRED',
    desc: 'Lean muscle focus',
    theme: { bg: 'linear-gradient(145deg,#09151f,#002b4d)', accent: '#00c6ff', glow: 'rgba(0,198,255,0.4)', highlight: '#00f0ff' },
    coreSubcats: ['Whey Protein', 'Whey Protein Blend', 'Hydra Whey Protein'],
    reason: ['✔ Lean Muscle', '✔ Zero Fat', '✔ Definition'],
  },
  {
    id: 'performance',
    name: '🧬 PERFORMANCE',
    desc: 'Recovery & power',
    theme: { bg: 'linear-gradient(145deg,#1f091f,#4d004d)', accent: '#ff00cc', glow: 'rgba(255,0,204,0.4)', highlight: '#ff00cc' },
    coreSubcats: ['Iso Plasma', 'Isolate', 'ISO Plasma Zero Protein'],
    reason: ['✔ Daily Fuel', '✔ Fast Recovery', '✔ Endurance'],
  },
];

function getPrice(p, sIdx, fIdx) {
  if (!p) return 0;
  if (p.sizes?.[sIdx]) return p.sizes[sIdx].price;
  if (p.flavors?.[fIdx]) return p.flavors[fIdx].price;
  return p.price || 0;
}

function getImg(p, fIdx = 0) {
  if (!p) return '/images/logo.png';
  return p.flavors?.[fIdx]?.image || p.flavors?.[0]?.image || `/images/${p.slug}.png`;
}

function isAvailable(p) {
  if (!p) return false;
  if (p.variants?.length) return p.variants.some(v => v.availableStock > 0);
  if (p.sizes?.length) return p.sizes.some(s => s.inStock !== false);
  if (p.flavors?.length) return p.flavors.some(f => f.inStock !== false);
  return (p.stockLeft || 0) > 0;
}

export default function ComboConfigurator({ products = [] }) {
  const addItem = useCart(s => s.addItem);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const coreRef = useRef(null);
  const boostRef = useRef(null);

  const [activeGoal, setActiveGoal] = useState(STACK_GOALS[0]);
  const [coreSel, setCoreSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [boostSel, setBoostSel] = useState({ product: null, sizeIdx: 0, flavorIdx: 0 });
  const [viewAllCore, setViewAllCore] = useState(false);
  const [viewAllBoost, setViewAllBoost] = useState(false);

  // Notify state
  const [showNotify, setShowNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyOk, setNotifyOk] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const coreProducts = useMemo(() =>
    products.filter(p => {
      if (p.subCategory === 'Creatine' || p.name.toLowerCase().includes('creatine') || p.stackGroup === 'boost') return false;
      return p.stackGroup === 'core'
        || ['Whey Protein', 'Mass Gainer', 'Iso Plasma', 'Weight Gainer', 'Protein Blend', 'Isolate'].includes(p.subCategory)
        || p.name.toLowerCase().includes('hydra')
        || p.name.toLowerCase().includes('iso plasma')
        || p.name.toLowerCase().includes('mass')
        || p.name.toLowerCase().includes('whey');
    }).sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0)),
  [products]);

  const boostProducts = useMemo(() =>
    products.filter(p =>
      p.stackGroup === 'boost' || p.subCategory === 'Creatine' || p.name.toLowerCase().includes('creatine')
    ).sort((a, b) => (b.stackPriority || 0) - (a.stackPriority || 0)),
  [products]);

  // Auto-select on goal change
  useEffect(() => {
    const c = coreProducts[0] || null;
    const b = boostProducts[0] || null;
    setCoreSel({ product: c, sizeIdx: 0, flavorIdx: 0 });
    setBoostSel({ product: b, sizeIdx: 0, flavorIdx: 0 });
    setShowNotify(false);
    setNotifyOk(false);
    setViewAllCore(false);
    setViewAllBoost(false);
  }, [activeGoal, coreProducts, boostProducts]);

  const corePrice = getPrice(coreSel.product, coreSel.sizeIdx, coreSel.flavorIdx);
  const boostPrice = getPrice(boostSel.product, boostSel.sizeIdx, boostSel.flavorIdx);
  const total = corePrice + boostPrice;
  const finalPrice = total > 0 ? Math.max(0, total - COMBO_DISCOUNT) : 0;
  const isComplete = !!(coreSel.product && boostSel.product);

  const coreStock = isAvailable(coreSel.product);
  const boostStock = isAvailable(boostSel.product);
  const inStock = coreStock && boostStock;

  const stackPower = isComplete ? (activeGoal.id === 'bulk' ? 98 : activeGoal.id === 'lean' ? 95 : 92) : 50;

  const handleAddToCart = () => {
    if (!isComplete) return;
    const cSize = coreSel.product.sizes?.[coreSel.sizeIdx];
    const bSize = boostSel.product.sizes?.[boostSel.sizeIdx];
    addItem({
      key: `custom-combo-${Date.now()}`,
      isCombo: true,
      isCustomCombo: true,
      name: `STACK LAB™ ${activeGoal.name.replace(/[^a-zA-Z &]/g, '').trim()} Stack`,
      flavorName: 'Custom Stack',
      price: finalPrice,
      qty: 1,
      image: getImg(coreSel.product, coreSel.flavorIdx),
      comboSelections: [
        { role: 'core', productId: coreSel.product._id, name: coreSel.product.name, flavor: coreSel.product.flavors?.[coreSel.flavorIdx]?.name || 'Regular', weight: cSize?.weight || '', unitPrice: corePrice, quantity: 1 },
        { role: 'boost', productId: boostSel.product._id, name: boostSel.product.name, flavor: boostSel.product.flavors?.[boostSel.flavorIdx]?.name || 'Regular', weight: bSize?.weight || '', unitPrice: boostPrice, quantity: 1 },
      ],
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    try {
      const { subscribeToRestock: sub } = await import('@/lib/api');
      const bad = !coreStock ? coreSel.product : boostSel.product;
      const f = !coreStock ? coreSel.product.flavors?.[coreSel.flavorIdx] : boostSel.product.flavors?.[boostSel.flavorIdx];
      const s = !coreStock ? coreSel.product.sizes?.[coreSel.sizeIdx] : boostSel.product.sizes?.[boostSel.sizeIdx];
      await sub({ email: notifyEmail, phoneNumber: notifyPhone, productId: bad._id, variantKey: `${f?.name || 'Regular'}-${s?.weight || 'Default'}` });
      setNotifyOk(true);
    } catch { setNotifyOk(true); }
  };

  const renderProductList = (items, sel, setSel, scrollRef, label, stepNum, viewAll, setViewAll) => {
    const accent = activeGoal.theme.accent;
    const glow = activeGoal.theme.glow;
    const highlight = activeGoal.theme.highlight;
    const subcats = activeGoal.coreSubcats;

    return (
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: accent, color: '#000', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>STEP {stepNum}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', letterSpacing: '1px', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
              {label}
            </h3>
          </div>
          <button
            className="btn-outline"
            onClick={() => setViewAll(!viewAll)}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            {viewAll ? 'Show Scroll' : 'View All'}
          </button>
        </div>

        {viewAll ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
            {items.map(p => {
              const selected = sel.product?._id === p._id;
              const avail = isAvailable(p);
              const isHighlight = stepNum === 1 && subcats.some(s => p.subCategory === s || p.name.toLowerCase().includes(s.toLowerCase()));
              let border = '2px solid rgba(255,255,255,0.08)';
              let shadow = 'none';
              if (selected) { border = `2px solid ${accent}`; shadow = `0 0 18px ${glow}`; }
              else if (isHighlight) { border = `2px solid ${highlight}`; shadow = `0 0 8px ${highlight}55`; }

              return (
                <div
                  key={p._id}
                  onClick={() => setSel({ product: p, sizeIdx: 0, flavorIdx: 0 })}
                  style={{
                    background: selected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                    border, borderRadius: '12px', padding: '12px', cursor: 'pointer', position: 'relative', boxShadow: shadow, opacity: avail ? 1 : 0.55, transition: '0.2s'
                  }}
                >
                  <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <img src={getImg(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: '1.3' }}>{p.name}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="products-scroll-wrapper" style={{ margin: '0 -20px', padding: '0 20px' }}>
            <button className="scroll-arrow scroll-left" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</button>
            <div ref={scrollRef} className="products-scroll" style={{ gap: '14px', padding: '10px 0' }}>
              {items.map(p => {
                const selected = sel.product?._id === p._id;
                const avail = isAvailable(p);
                const isHighlight = stepNum === 1 && subcats.some(s => p.subCategory === s || p.name.toLowerCase().includes(s.toLowerCase()));
                let border = '2px solid rgba(255,255,255,0.08)';
                let shadow = 'none';
                if (selected) { border = `2px solid ${accent}`; shadow = `0 0 18px ${glow}`; }
                else if (isHighlight) { border = `2px solid ${highlight}`; shadow = `0 0 8px ${highlight}55`; }

                return (
                  <motion.div
                    key={p._id}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSel({ product: p, sizeIdx: 0, flavorIdx: 0 })}
                    style={{
                      flex: '0 0 150px', scrollSnapAlign: 'start', background: selected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border, borderRadius: '12px', padding: '12px', cursor: 'pointer', position: 'relative', boxShadow: shadow, opacity: avail ? 1 : 0.55
                    }}
                  >
                    <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <img src={getImg(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: '1.3' }}>{p.name}</div>
                  </motion.div>
                );
              })}
            </div>
            <button className="scroll-arrow scroll-right" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</button>
          </div>
        )}

        {sel.product && (
          <div style={{ marginTop: '14px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Selection Options</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(sel.product.flavors || []).length > 1 && sel.product.flavors.map((fl, i) => (
                <button key={i} onClick={() => setSel({ ...sel, flavorIdx: i })} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: sel.flavorIdx === i ? 'rgba(255,255,255,0.12)' : 'transparent', border: `1px solid ${sel.flavorIdx === i ? accent : 'var(--border)'}`, color: sel.flavorIdx === i ? '#fff' : 'var(--text-secondary)' }}>{fl.name}</button>
              ))}
              {(sel.product.sizes || []).length > 1 && sel.product.sizes.map((sz, i) => (
                <button key={i} onClick={() => setSel({ ...sel, sizeIdx: i })} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: sel.sizeIdx === i ? 'rgba(255,255,255,0.12)' : 'transparent', border: `1px solid ${sel.sizeIdx === i ? accent : 'var(--border)'}`, color: sel.sizeIdx === i ? '#fff' : 'var(--text-secondary)' }}>{sz.weight}</button>
              ))}
              {(!sel.product.flavors || sel.product.flavors.length <= 1) && (!sel.product.sizes || sel.product.sizes.length <= 1) && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No additional options available</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ margin: '40px 0', overflowX: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.35)', borderRadius: '50px', padding: '6px 20px', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#ff8533', textTransform: 'uppercase' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6a00', display: 'inline-block', boxShadow: '0 0 8px #ff6a00' }} />
          Exclusive Custom Builder
        </div>
        <motion.h2
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '42px' : '58px', textTransform: 'uppercase', letterSpacing: '5px', background: 'linear-gradient(135deg,#ff6a00 0%,#ffb347 50%,#fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '18px' }}
        >
          STACK LAB™
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          Build your <strong style={{ color: '#fff' }}>own custom stack</strong>. Pick your fuel, pick your boost, mix flavors — and get an exclusive ₹30 combo discount.
        </p>
      </div>

      {/* ── Goal Selector ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '15px', marginBottom: '40px' }}>
        {STACK_GOALS.map(goal => {
          const active = activeGoal.id === goal.id;
          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveGoal(goal)}
              style={{
                background: active ? goal.theme.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? goal.theme.accent : 'var(--border)'}`,
                borderRadius: '16px', padding: '22px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: active ? `0 10px 30px ${goal.theme.glow}` : 'none',
                transition: 'all 0.4s ease',
              }}
            >
              {active && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(45deg,transparent,${goal.theme.glow},transparent)`, opacity: 0.2 }} />}
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>{goal.name}</h3>
              <p style={{ color: active ? '#eee' : 'var(--text-muted)', fontSize: '13px' }}>{goal.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: '40px', alignItems: 'start' }}>
        {/* ── Left Column: Configuration ── */}
        <div style={{ overflow: 'hidden' }}>
          {renderProductList(coreProducts, coreSel, setCoreSel, coreRef, "CHOOSE YOUR FUEL", 1, viewAllCore, setViewAllCore)}
          {renderProductList(boostProducts, boostSel, setBoostSel, boostRef, "CHOOSE YOUR BOOST", 2, viewAllBoost, setViewAllBoost)}
        </div>

        {/* ── Right Column: Cinematic Summary ── */}
        <div style={{ position: isMobile ? 'static' : 'sticky', top: '100px' }}>
          <motion.div
            key={activeGoal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '30px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 20px 50px rgba(0,0,0,0.5)`,
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: activeGoal.theme.bg }} />
            
            {/* Visual Header */}
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
               <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#fff', textTransform: 'uppercase', marginBottom: '5px' }}>{activeGoal.name.split(' ')[1]} STACK</h4>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ height: '2px', width: '30px', background: activeGoal.theme.accent }} />
                  <span style={{ fontSize: '10px', color: activeGoal.theme.accent, fontWeight: 900, letterSpacing: '2px' }}>POWERED BY STACK LAB</span>
                  <div style={{ height: '2px', width: '30px', background: activeGoal.theme.accent }} />
               </div>
            </div>

            {/* Poster Items */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '30px', height: '180px' }}>
              <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} src={getImg(coreSel.product, coreSel.flavorIdx)} style={{ height: '160px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
              <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.1)', fontWeight: 900 }}>+</div>
              <motion.img animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }} src={getImg(boostSel.product, boostSel.flavorIdx)} style={{ height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
            </div>

            {/* Power Meter */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                <span>STACK POTENCY</span>
                <span style={{ color: activeGoal.theme.accent }}>{stackPower}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${stackPower}%` }} style={{ height: '100%', background: activeGoal.theme.bg, boxShadow: `0 0 10px ${activeGoal.theme.glow}` }} />
              </div>
            </div>

            {/* Intelligence */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: '16px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '9px', color: activeGoal.theme.accent, fontWeight: 900, marginBottom: '12px', letterSpacing: '1px' }}>SYSTEM INTELLIGENCE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeGoal.reason.map(r => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#fff' }}>
                    <span style={{ color: activeGoal.theme.accent }}>{r.split(' ')[0]}</span>
                    <span>{r.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & CTA */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Total Value: <span style={{ textDecoration: 'line-through' }}>₹{total}</span>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff', lineHeight: 1, marginBottom: '20px' }}>
                ₹{finalPrice}
              </div>

              {inStock ? (
                <button
                  className="btn-primary"
                  onClick={handleAddToCart}
                  style={{
                    width: '100%', padding: '20px', fontSize: '16px', fontWeight: 800, borderRadius: '14px',
                    background: addedSuccess ? '#2ecc71' : activeGoal.theme.bg,
                    boxShadow: addedSuccess ? '0 10px 25px rgba(46,204,113,0.3)' : `0 10px 25px ${activeGoal.theme.glow}`,
                    justifyContent: 'center'
                  }}
                >
                  {addedSuccess ? '✓ ADDED' : 'BUILD MY STACK'}
                </button>
              ) : (
                <div>
                  <button className="btn-primary" onClick={() => setShowNotify(!showNotify)} style={{ width: '100%', background: '#333', justifyContent: 'center', padding: '18px' }}>NOTIFY ME</button>
                  {showNotify && !notifyOk && (
                    <form onSubmit={handleNotify} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="email" placeholder="Email Address" required value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: '#000', border: '1px solid #222', color: '#fff', fontSize: '14px' }} />
                      <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Send</button>
                    </form>
                  )}
                  {notifyOk && <p style={{ color: '#2ecc71', fontSize: '14px', marginTop: '10px' }}>✓ Success!</p>}
                </div>
              )}
              
              <div style={{ marginTop: '15px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                * ₹30 COMBO DISCOUNT APPLIED AUTOMATICALLY
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

