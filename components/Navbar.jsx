'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AccountDropdown from './AccountDropdown';

export default function Navbar({ cartCount = 0, onSearchOpen, onCartOpen, onAuthOpen }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeHeight, setNoticeHeight] = useState(0);
  const navRef = useRef(null);

  // Scroll effect — makes navbar more opaque on scroll and handles notice strip pushing
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 80);

      // Dynamic sticky navbar logic
      const strip = document.getElementById('noticeStrip');
      if (strip && navRef.current) {
        const stripHeight = strip.offsetHeight;
        navRef.current.style.top = scrollY > stripHeight ? '0px' : `${stripHeight - scrollY}px`;
      } else if (navRef.current) {
        navRef.current.style.top = '0px';
      }
    };

    // Run once on mount to set initial position
    setTimeout(handleScroll, 50);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const closeMenu = () => setMobileOpen(false);

  const navStyle = {
    background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.92)',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
  };

  // Premium: transparent navbar on hero page, glassmorphism on scroll
  const isHomepage = pathname === '/';
  const navClassName = isHomepage
    ? `navbar lr-navbar${scrolled ? ' lr-navbar--scrolled' : ' lr-navbar--transparent'}`
    : 'navbar';
  const navInlineStyle = isHomepage ? {} : navStyle;

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        className={`mobile-overlay${mobileOpen ? ' active' : ''}`}
        onClick={closeMenu}
      />

      {/* NAVBAR */}
      <nav className={navClassName} id="navbar" style={navInlineStyle} ref={navRef}>
        <div className="container">
          {/* Logo */}
          <a
            href="/"
            className="nav-logo"
            onClick={(e) => {
              closeMenu();
              if (pathname === '/') {
                e.preventDefault();
                window.location.href = '/';
              }
            }}
          >
            <Image
              src="/images/logo.webp"
              alt="Living Result"
              width={130}
              height={130}
              className="logo-img"
              priority
              style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          {/* Desktop Nav Links */}
          <ul className={`nav-menu${mobileOpen ? ' active' : ''}`} id="navMenu">
            <li><Link href="/" className="active" onClick={closeMenu}>Home</Link></li>
            <li><Link href="/#products" onClick={closeMenu}>The Arsenal</Link></li>
            <li><Link href="/#advisor" onClick={closeMenu}>AI Advisor</Link></li>
            <li><Link href="/#philosophy" onClick={closeMenu}>Authenticity</Link></li>
            <li><Link href="/#movement" onClick={closeMenu}>Reviews</Link></li>
            <li><Link href="/#action" onClick={closeMenu}>Concierge</Link></li>
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

            {/* Account */}
            <AccountDropdown onAuthOpen={onAuthOpen} />

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
