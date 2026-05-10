'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar({ cartCount = 0, onSearchOpen, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeHeight, setNoticeHeight] = useState(0);
  const navRef = useRef(null);

  // Scroll effect — makes navbar more opaque on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const closeMenu = () => setMobileOpen(false);

  const navStyle = {
    background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.92)',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        className={`mobile-overlay${mobileOpen ? ' active' : ''}`}
        onClick={closeMenu}
      />

      {/* NAVBAR */}
      <nav className="navbar" id="navbar" style={navStyle} ref={navRef}>
        <div className="container">
          {/* Logo */}
          <Link href="/" className="nav-logo" onClick={closeMenu}>
            <Image
              src="/images/logo.png"
              alt="Living Result"
              width={130}
              height={130}
              className="logo-img"
              priority
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className={`nav-menu${mobileOpen ? ' active' : ''}`} id="navMenu">
            <li><Link href="/" className="active" onClick={closeMenu}>Home</Link></li>
            <li><Link href="/#products" onClick={closeMenu}>Shop</Link></li>
            <li><Link href="/#products" onClick={closeMenu}>Categories</Link></li>
            <li><Link href="/#why-choose" onClick={closeMenu}>About</Link></li>
            <li><Link href="/#contact" onClick={closeMenu}>Contact</Link></li>
          </ul>

          {/* Nav Icons */}
          <div className="nav-icons">
            {/* Search */}
            <button
              aria-label="Search"
              id="searchBtn"
              onClick={onSearchOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Cart */}
            <button aria-label="Cart" id="cartBtn" onClick={onCartOpen} style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-count" id="cartCount">{cartCount}</span>
              )}
            </button>

            {/* Hamburger */}
            <button
              className="hamburger"
              id="hamburger"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
