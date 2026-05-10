'use client';

import { useState } from 'react';
import useCart from '@/lib/cartStore';

export default function CartSidebar({ isOpen, onClose, onCheckout }) {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const changeQty = useCart((s) => s.changeQty);
  const clearCart = useCart((s) => s.clearCart);
  const getTotal = useCart((s) => s.getTotal);

  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-overlay${isOpen ? ' active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`cart-sidebar${isOpen ? ' active' : ''}`} id="cartSidebar">
        <div className="cart-sidebar-header">
          <h3>Your Cart</h3>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-sidebar-body" id="cartBody">
          {items.length === 0 ? (
            /* ── Empty State ── */
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>Your cart is empty</p>
              <button className="btn-primary" onClick={onClose} style={{ fontSize: '12px', padding: '10px 24px' }}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* ── Cart Items ── */}
              {items.map((item) => {
                const subText = item.isCombo && item.comboSelections?.length > 0
                  ? item.comboSelections.map((s) => `${s.name}: ${s.flavor}`).join(' · ')
                  : `${item.flavorName}${item.weight ? ' | ' + item.weight : ''}`;

                return (
                  <div key={item.key} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <img
                      src={item.image}
                      style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#0e0e0e', borderRadius: '6px', padding: '4px', flexShrink: 0 }}
                      alt={item.name}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subText}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Qty Control */}
                        <div className="qty-control" style={{ borderColor: 'var(--border)' }}>
                          <button className="qty-btn" onClick={() => changeQty(item.key, -1)} style={{ width: '28px', height: '28px', fontSize: '15px' }}>−</button>
                          <span className="qty-num" style={{ fontSize: '13px' }}>{item.qty}</span>
                          <button className="qty-btn" onClick={() => changeQty(item.key, 1)} style={{ width: '28px', height: '28px', fontSize: '15px' }}>+</button>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '14px' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.key)}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', transition: 'color 0.2s', padding: '0 4px' }}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >✕</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── Totals & Checkout ── */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>

                {/* FOMO — Shaker Offer */}
                <div style={{ background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.2)', padding: '12px', borderRadius: '6px', marginBottom: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>🔥 Premium Shaker Worth ₹500 Available at Just ₹50</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>Exclusive launch offer for first 10 customers.</div>
                </div>

                {/* FOMO — Urgency */}
                <div style={{ color: '#e74c3c', fontSize: '12px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>
                  ⚠️ Your cart items are in high demand. Launch pricing is currently active.
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)' }}>₹{total.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '16px', fontStyle: 'italic' }}>
                  *Delivery charges will apply accordingly.
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={clearCart}
                    className="btn-outline"
                    style={{ width: '30%', justifyContent: 'center', padding: '16px', fontSize: '14px', textAlign: 'center' }}
                  >Clear All</button>
                  <button
                    onClick={onCheckout}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: '15px' }}
                  >Proceed to Checkout</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
