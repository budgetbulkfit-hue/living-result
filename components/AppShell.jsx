'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import CartSidebar from './CartSidebar';
import CheckoutModal from './CheckoutModal';
import SearchOverlay from './SearchOverlay';
import SocialProofPopup from './SocialProofPopup';
import ExitIntentWrapper from './ExitIntentWrapper';
import MobileTrustRow from './MobileTrustRow';
import WhatsAppQuickBuy from './WhatsAppQuickBuy';
import useCart from '@/lib/cartStore';
import useSettings from '@/lib/useSettings';

export default function AppShell({ children }) {
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const getTotalItems = useCart((s) => s.getTotalItems);
  const migrateLegacyCart = useCart((s) => s.migrateLegacyCart);
  const { noticeStrip, isLaunched, fomoSettings } = useSettings();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    migrateLegacyCart();
  }, [migrateLegacyCart]);

  const totalItems = mounted ? getTotalItems() : 0;

  const openCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };

  // Skip consumer shell for admin routes
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      {/* MAINTENANCE OVERLAY */}
      {mounted && !isLaunched && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.97)' }}>
          <div style={{ textAlign: 'center', padding: '40px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '500px', margin: 'auto' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '20px', fontSize: '28px' }}>
              Maintenance <span style={{ color: 'var(--accent)' }}>Break</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.5' }}>
              We are currently pushing updates to improve your experience. Please check back shortly.
            </p>
          </div>
        </div>
      )}

      {/* NOTICE STRIP */}
      {mounted && noticeStrip.enabled && noticeStrip.text && (
        <div className="notice-strip" id="noticeStrip">
          <div className="container">
            <p>{noticeStrip.text}</p>
          </div>
        </div>
      )}

      {/* MOBILE TRUST ROW */}
      <MobileTrustRow />

      {/* NAVBAR */}
      <Navbar
        cartCount={totalItems}
        onSearchOpen={() => setSearchOpen(true)}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* WHATSAPP QUICK BUY (Mobile Only) */}
      <WhatsAppQuickBuy />

      {/* CART SIDEBAR */}
      {mounted && (
        <CartSidebar
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={openCheckout}
        />
      )}

      {/* CHECKOUT MODAL */}
      {mounted && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          fomoSettings={fomoSettings}
        />
      )}

      {/* SEARCH OVERLAY */}
      {mounted && (
        <SearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* SOCIAL PROOF POPUP — fires after 12–18s */}
      {mounted && (
        <SocialProofPopup enabled={fomoSettings?.socialProof !== false} />
      )}

      {/* EXIT INTENT */}
      {mounted && (
        <ExitIntentWrapper
          enabled={fomoSettings?.exitIntent !== false}
          onCartOpen={() => setCartOpen(true)}
        />
      )}

      {/* FLOATING CART BUTTON */}
      {mounted && totalItems > 0 && (
        <button
          className="floating-cart-btn visible"
          id="floatingCartBtn"
          onClick={() => setCartOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          View Cart
          <span className="floating-cart-count">{totalItems}</span>
        </button>
      )}

      {/* PAGE CONTENT */}
      {children}
    </>
  );
}
