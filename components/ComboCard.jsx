'use client';

import { useState } from 'react';
import useCart from '@/lib/cartStore';
import ComboFlavorModal from './ComboFlavorModal';

export default function ComboCard({ combo }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const finalPrice = combo.finalPrice || combo.autoCalculatedPrice || 0;
  const oldPrice = combo.sizes?.[0]?.oldPrice || combo.autoCalculatedMrp || 0;
  const savings = combo.totalSavings || 0;
  const savingsPct = oldPrice > finalPrice ? Math.round(((oldPrice - finalPrice) / oldPrice) * 100) : 0;
  const bannerImage = combo.comboBanner || combo.images?.[0] || combo.products?.[0]?.image;

  const handleAddToCart = ({ combo: c, comboSelections }) => {
    const key = `combo-${c._id}-${Date.now()}`;
    addItem({
      key,
      comboId: c._id,
      name: c.comboName,
      flavorName: 'Combo Stack',
      weight: c.totalWeight?.display || '',
      price: c.finalPrice || c.autoCalculatedPrice || 0,
      image: c.comboBanner || c.products?.[0]?.image || '',
      qty: 1,
      isCombo: true,
      comboSelections,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <>
      <div className="product-card combo-card" onClick={() => setModalOpen(true)} style={{ position: 'relative', cursor: 'pointer' }}>
        {/* Purple Stack badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #9b59b6, #8e44ad)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 2, boxShadow: '0 2px 8px rgba(155,89,182,0.4)' }}>
          💎 Premium Stack
        </div>

        {/* Savings badge */}
        {savingsPct > 0 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(46,204,64,0.2)', color: 'var(--green)', border: '1px solid var(--green)', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', zIndex: 2 }}>
            SAVE {savingsPct}%
          </div>
        )}

        {/* Banner / Product Images */}
        <div className="product-image" style={{ height: '220px', background: '#0a0a0a', position: 'relative' }}>
          {bannerImage ? (
            <img
              src={bannerImage}
              alt={combo.comboName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius) var(--radius) 0 0' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ display: 'flex', gap: '8px', padding: '20px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {combo.products?.slice(0, 3).map((p, i) => (
                <img key={i} src={p.image} alt={p.name} style={{ height: '120px', objectFit: 'contain' }} />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{combo.comboName}</h3>

          {/* Products included */}
          <div style={{ marginBottom: '10px' }}>
            {combo.products?.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', padding: '3px 0', borderBottom: i < combo.products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span>• {p.name} × {p.quantity || 1}</span>
                <span style={{ color: 'var(--text-secondary)' }}>₹{(p.price || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Combo Pricing Box */}
          <div className="combo-pricing-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="current-price" style={{ fontSize: '22px', fontWeight: '700', color: '#9b59b6' }}>
                ₹{finalPrice.toLocaleString()}
              </span>
              {oldPrice > finalPrice && (
                <span className="old-price">₹{oldPrice.toLocaleString()}</span>
              )}
            </div>
            {savings > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600', marginTop: '4px' }}>
                💰 You save ₹{savings.toLocaleString()} on this stack!
              </div>
            )}
            {combo.totalWeight?.display && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Total weight: {combo.totalWeight.display}
              </div>
            )}
          </div>

          {/* Claim CTA */}
          <button
            className="btn-primary btn-combo"
            onClick={() => setModalOpen(true)}
            style={{ width: '100%', justifyContent: 'center', background: addedFeedback ? 'var(--green)' : 'linear-gradient(135deg, #9b59b6, #8e44ad)', boxShadow: '0 4px 20px rgba(155,89,182,0.3)' }}
          >
            {addedFeedback ? '✓ Added to Cart!' : '⚡ Claim This Stack'}
          </button>
        </div>
      </div>

      <ComboFlavorModal
        combo={combo}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
