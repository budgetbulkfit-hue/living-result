'use client';

import { useState, useEffect, useRef } from 'react';
import useCart from '@/lib/cartStore';
import { createOrder } from '@/lib/api';
import { orderOnWhatsApp } from '@/lib/whatsapp';
import PrivacyModal from './PrivacyModal';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917003714398';
const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || 'https://script.google.com/macros/s/AKfycbwWTolkQqA0LXgLwTYj8vnWMoEHQeonlhCc7-8RDEXgnGzZG6C22wK_RInl6Gkh0t3o8A/exec';

export default function CheckoutModal({ isOpen, onClose, fomoSettings = {} }) {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const getTotal = useCart((s) => s.getTotal);
  const [timerDisplay, setTimerDisplay] = useState('10:00');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const timerRef = useRef(null);
  const total = getTotal();

  // FOMO countdown timer — persists in localStorage
  useEffect(() => {
    if (!isOpen) return;
    const durationMins = fomoSettings?.timerDuration || 10;
    const key = 'lr_checkout_timer';
    let endTime = parseInt(localStorage.getItem(key) || '0', 10);
    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + durationMins * 60 * 1000;
      localStorage.setItem(key, String(endTime));
    }
    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) { clearInterval(timerRef.current); setTimerDisplay('00:00'); localStorage.removeItem(key); return; }
      const m = Math.floor(diff / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimerDisplay(`${m}:${s}`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [isOpen, fomoSettings?.timerDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || items.length === 0) return;
    setIsSubmitting(true);
    const name = e.target.checkoutName.value.trim();
    const phone = e.target.checkoutPhone.value.trim();
    const email = e.target.checkoutEmail.value.trim();
    const address = e.target.checkoutAddress.value.trim();
    const coupon = e.target.checkoutCoupon?.value.trim() || '';
    
    try {
      const orderData = await createOrder({
        customerDetails: { name, phone, email, address, coupon },
        products: items.map((i) => i.isCombo
          ? { comboId: i.comboId || i.productId, isCombo: true, name: i.name, flavor: i.flavorName, comboSelections: i.comboSelections, weight: i.weight || '', quantity: i.qty, price: i.price }
          : { productId: i.productId, name: i.name, flavor: i.flavorName, weight: i.weight || '', quantity: i.qty, price: i.price }),
        totalAmount: total,
      });
      if (!orderData.success) throw new Error(orderData.message || 'Order failed');
      const orderId = orderData.data.orderId;

      // Build WhatsApp message
      let msg = `🛒 *NEW ORDER — Living Result*\n🔖 *Order ID:* ${orderId}\n\n📦 *Items:*\n`;
      items.forEach((i) => {
        if (i.isCombo && i.comboSelections) {
          msg += `• ${i.name} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString()}\n`;
          i.comboSelections.forEach((s) => { msg += `   ↳ ${s.name} (${s.flavor}) x${s.quantity * i.qty}\n`; });
        } else {
          msg += `• ${i.name} (${[i.flavorName, i.weight].filter(Boolean).join(', ')}) × ${i.qty} — ₹${(i.price * i.qty).toLocaleString()}\n`;
        }
      });
      msg += `\n💰 *Total: ₹${total.toLocaleString()}*\n_(Delivery charges apply)_\n\n`;
      msg += `👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n✉️ *Email:* ${email}\n📍 *Address:* ${address}\n\n`;
      if (coupon) msg += `🎟️ *Coupon:* ${coupon}\n\n`;
      msg += `Please confirm my order! 🙏`;

      // Google Sheets logging (fire-and-forget)
      if (GOOGLE_SHEET_URL) {
        fetch(GOOGLE_SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: new Date().toLocaleString(), name, phone, email, address, coupon, total, items: items.map((i) => `${i.name} (${i.flavorName}) x${i.qty}`).join(' | ') }),
        }).catch(() => {});
      }

      clearCart();
      onClose();
      setShowSuccess(true);
      
      // Trigger the robust WhatsApp deep link redirect
      orderOnWhatsApp(msg);
    } catch (err) {
      alert(`Checkout Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontFamily: 'var(--font-body)' };

  return (
    <>
      <div className={`modal-overlay${isOpen ? ' active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
          <button className="modal-close" onClick={onClose}>&times;</button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', textTransform: 'uppercase', marginBottom: '20px' }}>Checkout Details</h2>

          {/* FOMO Timer */}
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', padding: '12px', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            🔥 Your pricing is reserved for: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timerDisplay}</span>
          </div>

          {/* Order Summary */}
          <div style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid var(--accent)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {items.map((i) => (
              <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{i.name} {i.weight ? `(${i.weight})` : ''} × {i.qty}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '13px' }}>₹{(i.price * i.qty).toLocaleString()}</span>
              </div>
            ))}
            <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '15px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Total to Pay:</span>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>₹{total.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>*Delivery charges will apply accordingly.</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Full Name</label>
              <input name="checkoutName" type="text" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Phone Number</label>
              <input name="checkoutPhone" type="tel" required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Email Address</label>
              <input name="checkoutEmail" type="email" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Delivery Address</label>
              <textarea name="checkoutAddress" required rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Coupon Code (Optional)</label>
              <input name="checkoutCoupon" type="text" placeholder="Enter discount code" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="agreeTerms" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                I agree to the <button type="button" onClick={() => setPrivacyOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', padding: 0, fontSize: 'inherit', cursor: 'pointer' }}>Terms and Conditions</button> and understand that delivery charges will be extra.
              </label>
            </div>

            <button type="submit" disabled={isSubmitting || !agreed} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#25D366', borderColor: '#25D366', opacity: (isSubmitting || !agreed) ? 0.7 : 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/>
              </svg>
              {isSubmitting ? 'Processing...' : 'Proceed to WhatsApp Order'}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <div className={`modal-overlay${showSuccess ? ' active' : ''}`} onClick={() => setShowSuccess(false)}>
        <div className="modal-content" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(46,204,64,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--green)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', textTransform: 'uppercase', marginBottom: '10px', color: '#fff' }}>Order Sent!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Your order has been securely created in our system.<br /><br />
            <span style={{ color: '#25D366', fontWeight: 'bold', fontSize: '15px' }}>Redirecting to WhatsApp to complete it...</span>
          </p>
          <button onClick={() => setShowSuccess(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Continue Shopping</button>
        </div>
      </div>

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
