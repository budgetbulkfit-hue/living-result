'use client';

import { useEffect, useState, useRef } from 'react';

export default function ExitIntentWrapper({ enabled = true, onCartOpen }) {
  const [isVisible, setIsVisible] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem('lr_exit_shown')) return;

    // Desktop: mouse leaves viewport at top
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !shownRef.current) {
        shownRef.current = true;
        sessionStorage.setItem('lr_exit_shown', '1');
        setIsVisible(true);
      }
    };

    // Mobile: rapid scroll upward detection
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    const handleScroll = () => {
      const currentY = window.scrollY;
      const currentTime = Date.now();
      const velocity = (lastScrollY - currentY) / (currentTime - lastScrollTime);
      if (velocity > 3 && currentY < 200 && !shownRef.current) {
        shownRef.current = true;
        sessionStorage.setItem('lr_exit_shown', '1');
        setIsVisible(true);
      }
      lastScrollY = currentY;
      lastScrollTime = currentTime;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);

  const handleClose = () => setIsVisible(false);
  const handleShop = () => { setIsVisible(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); };
  const handleCart = () => { setIsVisible(false); onCartOpen?.(); };

  if (!isVisible) return null;

  return (
    <div
      className="modal-overlay active"
      id="exitIntentOverlay"
      style={{ zIndex: 99999 }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-content" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
        <button className="modal-close" onClick={handleClose}>&times;</button>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Wait — Don&apos;t Miss Out!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
          You&apos;re this close to achieving your fitness goals.<br />
          <strong style={{ color: 'var(--accent)' }}>Launch pricing is still active</strong> — grab your supplements before prices go back up!
        </p>
        <div style={{ background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>⚡ Limited-Time Launch Offer</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Premium Supplements at Unbeatable Prices</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={handleShop} style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
            Shop Now
          </button>
          <button className="btn-outline" onClick={handleClose} style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
}
