'use client';

import { useState } from 'react';

export default function ComboFlavorModal({ combo, isOpen, onClose, onAddToCart }) {
  const [selections, setSelections] = useState({});
  const displayPrice = combo.sizes?.[0]?.price || combo.flavors?.[0]?.price || combo.finalPrice || combo.autoCalculatedPrice || 0;
  const oldPrice = combo.sizes?.[0]?.oldPrice || combo.autoCalculatedMrp || 0;
  const displaySavings = oldPrice > displayPrice ? oldPrice - displayPrice : (combo.totalSavings || 0);

  if (!isOpen || !combo) return null;

  // Products that have flavors available from the main product catalog
  // For combos, each product in combo.products has flavor options if their flavors array is populated
  const productsWithFlavors = combo.products?.filter((p) => p.flavors?.length > 0) || [];
  const needsFlavors = productsWithFlavors.length > 0;

  const handleSelect = (productId, flavor) => {
    setSelections((prev) => ({ ...prev, [productId]: flavor }));
  };

  const handleConfirm = () => {
    // Build combo selections — use selected flavor or 'Regular' for products without options
    const comboSelections = combo.products.map((p) => ({
      productId: p._id,
      name: p.name,
      flavor: selections[p._id] || (p.flavors?.length > 0 ? p.flavors[0].name : 'Regular'),
      quantity: p.quantity || 1,
    }));
    onAddToCart({ combo, comboSelections });
    setSelections({});
    onClose();
  };

  const allSelected = !needsFlavors || productsWithFlavors.every((p) => selections[p._id]);

  return (
    <div
      className="modal-overlay active"
      id="comboFlavorModal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{ maxWidth: '480px', padding: '32px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', textTransform: 'uppercase', marginBottom: '6px', color: '#9b59b6' }}>
          {combo.comboName}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          {needsFlavors ? 'Select your flavor preferences for each product:' : 'Confirm adding this stack to your cart:'}
        </p>

        {/* Product list with flavor selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {combo.products?.map((p, idx) => (
            <div key={p._id || idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img
                src={p.image || `/images/${p.slug || 'creatine'}.png`}
                alt={p.name}
                style={{ width: '56px', height: '56px', objectFit: 'contain', background: '#0e0e0e', borderRadius: '6px', padding: '4px', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>Qty: {p.quantity || 1} × ₹{(p.price || 0).toLocaleString()}</div>
                {p.flavors?.length > 0 && (
                  <div className="flavor-pills" style={{ flexWrap: 'wrap' }}>
                    {p.flavors.map((f, fi) => (
                      <button
                        key={fi}
                        className={`flavor-pill${selections[p._id] === f.name ? ' active' : ''}`}
                        onClick={() => handleSelect(p._id, f.name)}
                        style={{ fontSize: '11px', padding: '5px 12px' }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
                {(!p.flavors || p.flavors.length === 0) && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No flavor choice needed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px', background: 'rgba(155,89,182,0.08)', borderRadius: '8px', border: '1px dashed rgba(155,89,182,0.3)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stack Total</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#9b59b6' }}>₹{displayPrice.toLocaleString()}</div>
          </div>
          {displaySavings > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You Save</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--green)' }}>₹{displaySavings.toLocaleString()}</div>
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleConfirm}
          disabled={needsFlavors && !allSelected}
          style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #9b59b6, #8e44ad)', opacity: (needsFlavors && !allSelected) ? 0.6 : 1 }}
        >
          {needsFlavors && !allSelected ? 'Select All Flavors' : '⚡ Claim This Stack'}
        </button>
      </div>
    </div>
  );
}
