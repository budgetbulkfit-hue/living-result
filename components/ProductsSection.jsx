'use client';

import { useState, useRef } from 'react';
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

  const subCats = getSubCats(uniqueProducts);

  // Filter products based on active tab + subcat
  let displayProducts = [];
  if (activeTab === 'unique') {
    displayProducts = activeSubCat === 'All'
      ? uniqueProducts
      : uniqueProducts.filter((p) => p.subCategory === activeSubCat);
  } else if (activeTab === 'common') {
    displayProducts = commonProducts;
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
          {activeTab !== 'combos' && (
            <button
              className="btn-outline"
              onClick={() => setViewAll((v) => !v)}
            >
              {viewAll ? 'Scroll View' : 'View All'}
            </button>
          )}
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          <button style={tabStyle('unique')} onClick={() => { setActiveTab('unique'); setViewAll(false); setActiveSubCat('All'); }}>
            Unique Collection
          </button>
          <button style={tabStyle('common')} onClick={() => { setActiveTab('common'); setViewAll(false); }}>
            Everyday Essentials
          </button>
          <button style={tabStyle('combos')} onClick={() => { setActiveTab('combos'); setViewAll(true); }}>
            💎 Premium Stacks
          </button>
        </div>

        {/* ── Sub-category Pills (Unique tab only) ── */}
        {activeTab === 'unique' && subCats.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {subCats.map((cat) => (
              <button
                key={cat}
                className={`flavor-pill${activeSubCat === cat ? ' active' : ''}`}
                onClick={() => setActiveSubCat(cat)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Combos Grid ── */}
        {activeTab === 'combos' && (
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {combos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>No stacks available yet.</p>
            ) : (
              combos.map((combo) => <ComboCard key={combo._id} combo={combo} />)
            )}
          </div>
        )}

        {/* ── Products: Scroll View ── */}
        {activeTab !== 'combos' && !viewAll && (
          <div className="products-scroll-wrapper">
            {displayProducts.length > 3 && (
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
            {displayProducts.length > 3 && (
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
