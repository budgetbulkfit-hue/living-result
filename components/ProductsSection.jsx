'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import ComboCard from './ComboCard';

// Derive sub-categories from unique products
function getSubCats(products) {
  const cats = ['All', ...new Set(products.map((p) => p.subCategory).filter(Boolean))];
  return cats;
}

export default function ProductsSection({ uniqueProducts = [], commonProducts = [], combos = [] }) {
  const [activeTab, setActiveTab] = useState('unique');
  const [viewAll, setViewAll] = useState(false);
  const [activeSubCat, setActiveSubCat] = useState('All');
  const scrollRef = useRef(null);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('lr_activeTab');
    const savedSubCat = sessionStorage.getItem('lr_activeSubCat');
    if (savedTab) setActiveTab(savedTab);
    if (savedSubCat) setActiveSubCat(savedSubCat);
  }, []);

  // Save state to sessionStorage on change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setViewAll(false);
    setActiveSubCat('All');
    sessionStorage.setItem('lr_activeTab', tab);
    sessionStorage.setItem('lr_activeSubCat', 'All');
  };

  const handleSubCatChange = (cat) => {
    setActiveSubCat(cat);
    sessionStorage.setItem('lr_activeSubCat', cat);
  };

  let baseProducts = [];
  if (activeTab === 'unique') baseProducts = uniqueProducts;
  else if (activeTab === 'common') baseProducts = commonProducts;

  const subCats = activeTab !== 'combos' ? getSubCats(baseProducts) : [];

  // Filter products based on active tab + subcat
  let displayProducts = [];
  if (activeTab !== 'combos') {
    displayProducts = activeSubCat === 'All'
      ? baseProducts
      : baseProducts.filter((p) => p.subCategory === activeSubCat);
  }

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const tabStyle = (tab) => ({
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
    fontSize: '17px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
    fontFamily: 'var(--font-heading)',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
    ...(tab === 'combos' && { color: activeTab === 'combos' ? '#9b59b6' : 'var(--text-muted)', borderBottomColor: activeTab === 'combos' ? '#9b59b6' : 'transparent', textShadow: activeTab === 'combos' ? '0 0 10px rgba(155,89,182,0.4)' : 'none' }),
  });

  return (
    <section className="products" id="products">
      <div className="container">
        {/* Section Header */}
        <div className="products-header">
          <div>
            <p className="section-label">Our Arsenal</p>
            <h2 className="section-title">ENGINEERED FOR ELITE PERFORMANCE</h2>
          </div>
          <button
            className="btn-outline"
            onClick={() => setViewAll((v) => !v)}
          >
            {viewAll ? 'Scroll View' : 'View All'}
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          <button style={tabStyle('unique')} onClick={() => handleTabChange('unique')}>
            Unique Collection
          </button>
          <button style={tabStyle('common')} onClick={() => handleTabChange('common')}>
            Everyday Essentials
          </button>
          <button style={tabStyle('combos')} onClick={() => handleTabChange('combos')}>
            💎 Premium Stacks
          </button>
        </div>

        {/* ── Category Info Box ── */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: activeTab === 'unique' ? 'rgba(255, 68, 0, 0.1)' : activeTab === 'common' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 68, 0, 0.08)',
          borderLeft: `4px solid ${activeTab === 'unique' || activeTab === 'combos' ? 'var(--accent)' : 'var(--text-muted)'}`,
          borderRadius: '4px'
        }}>
          <h4 style={{
            color: activeTab === 'unique' || activeTab === 'combos' ? 'var(--accent)' : 'var(--text-primary)',
            marginBottom: '10px',
            fontSize: '20px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '1px'
          }}>
            {activeTab === 'unique' && 'Exclusive & Unmatched'}
            {activeTab === 'common' && 'Premium Standards'}
            {activeTab === 'combos' && '🔥 Best Combos on the Internet'}
          </h4>
          <p style={{
            color: activeTab === 'unique' || activeTab === 'combos' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {activeTab === 'unique' && (
              <>
                Cannot find this anywhere else! These are top-of-the-line products engineered for peak performance.<br/>
                <strong style={{ color: 'var(--accent)' }}>Challenge us:</strong> If you can find this exact quality elsewhere, show us and we will give it to you at a lower price.
              </>
            )}
            {activeTab === 'common' && 'You may find these products on different platforms, but we guarantee you are getting them here at a lower rate than anywhere else.'}
            {activeTab === 'combos' && 'We\'ve handpicked the most powerful supplement pairings to maximise your gains, recovery and performance. Get more, save more — these bundles are unbeatable.'}
          </p>
        </div>

        {/* ── Sub-category Pills (Both tabs) ── */}
        {activeTab !== 'combos' && subCats.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {subCats.map((cat) => (
              <button
                key={cat}
                className={`flavor-pill${activeSubCat === cat ? ' active' : ''}`}
                onClick={() => handleSubCatChange(cat)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Combos Grid ── */}
        {activeTab === 'combos' && viewAll && (
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {combos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>No stacks available yet.</p>
            ) : (
              combos.map((combo) => <ComboCard key={combo._id} combo={combo} />)
            )}
          </div>
        )}

        {/* ── Combos: Scroll View ── */}
        {activeTab === 'combos' && !viewAll && (
          <div className="products-scroll-wrapper">
            {combos.length > 1 && (
              <button className="scroll-arrow scroll-left" onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
            )}
            <div className="products-scroll" ref={scrollRef}>
              {combos.map((combo) => (
                <ComboCard key={combo._id} combo={combo} />
              ))}
              {combos.length === 0 && (
                <p style={{ color: 'var(--text-muted)', padding: '60px 0' }}>No stacks available yet.</p>
              )}
            </div>
            {combos.length > 1 && (
              <button className="scroll-arrow scroll-right" onClick={() => scroll(1)} aria-label="Scroll right">›</button>
            )}
          </div>
        )}

        {/* ── Products: Scroll View ── */}
        {activeTab !== 'combos' && !viewAll && (
          <div className="products-scroll-wrapper">
            {displayProducts.length > 1 && (
              <button className="scroll-arrow scroll-left" onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
            )}
            <div className="products-scroll" ref={scrollRef}>
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {displayProducts.length === 0 && (
                <p style={{ color: 'var(--text-muted)', padding: '60px 0' }}>No products in this category.</p>
              )}
            </div>
            {displayProducts.length > 1 && (
              <button className="scroll-arrow scroll-right" onClick={() => scroll(1)} aria-label="Scroll right">›</button>
            )}
          </div>
        )}

        {/* ── Products: Grid View (View All) ── */}
        {activeTab !== 'combos' && viewAll && (
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {displayProducts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>No products found.</p>
            )}
          </div>
        )}

        {/* Product count footer */}
        {activeTab !== 'combos' && (
          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Showing {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </section>
  );
}
