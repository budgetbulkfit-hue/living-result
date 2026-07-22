'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useAuthStore from '@/lib/authStore';

/**
 * AccountDropdown — Navbar component for logged-in users.
 * Shows "👤 Hi [Name] ▼" with a dropdown menu.
 * @param {function} onAuthOpen  Called to open AuthModal (unused when logged in, but passed for symmetry)
 */
export default function AccountDropdown({ onAuthOpen }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Account';

    return (
      <button 
        className="nav-login-btn" 
        onClick={onAuthOpen} 
        aria-label="Login or Create Account"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hide-on-mobile">Login</span>
      </button>
    );
  }

  return (
    <div className="account-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className={`account-dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}
      >
        <span className="account-avatar">
          {firstName[0]?.toUpperCase()}
        </span>
        <span className="account-name hide-on-mobile" style={{ fontSize: '13px' }}>Hi, {firstName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`account-chevron ${open ? 'rotated' : ''} hide-on-mobile`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="account-dropdown-menu" role="menu">
          <div className="account-dropdown-header">
            <span className="account-dropdown-name">{user?.name}</span>
            <span className="account-dropdown-email">{user?.email || user?.phone}</span>
          </div>
          <div className="account-dropdown-divider" />
          <Link href="/account" className="account-dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            My Dashboard
          </Link>
          <Link href="/account?tab=orders" className="account-dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            My Orders
          </Link>
          <Link href="/account?tab=wishlist" className="account-dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Wishlist
          </Link>
          <div className="account-dropdown-divider" />
          <button
            className="account-dropdown-item account-dropdown-logout"
            onClick={() => { setOpen(false); logout(); }}
            role="menuitem"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
