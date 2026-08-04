'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrivacyModal from './PrivacyModal';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleOpenPrivacy = (e) => { e.preventDefault(); setIsPrivacyOpen(true); };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSent(true);
    }
  };

  return (
    <>
      {/* PRIVACY MODAL — preserved exactly */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* PREMIUM MONOLITH FOOTER */}
      <footer className="lr-footer" id="footer">
        <div className="lr-footer__inner">
          {/* Operational Status Pill */}
          <div className="lr-footer__status-bar">
            <div className="lr-footer__status-indicator">
              <span className="lr-footer__status-pulse" />
              <span>All Systems Operational · Same-Day Dispatch Active Across India</span>
            </div>
            <div className="lr-footer__status-cert">
              <span>100% Genuine Importer Sealed · Official Authentic Sourcing</span>
            </div>
          </div>

          {/* 3-column grid */}
          <div className="lr-footer__grid">

            {/* ── Column 1: Brand ── */}
            <div>
              <div className="lr-footer__brand-logo">
                <Image
                  src="/images/logo.webp"
                  alt="Living Result"
                  width={100}
                  height={100}
                  style={{ height: '72px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <p className="lr-footer__brand-tagline">
                &ldquo;Living Result was built to make elite fitness supplements affordable
                and accessible. Honest pricing, honest products, real results.&rdquo;
              </p>
              <div className="lr-footer__socials">
                <a
                  href="https://instagram.com/livingresult_official"
                  className="lr-footer__social-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/917003714398"
                  className="lr-footer__social-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 0 1 2.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Column 2: Quick Links ── */}
            <div>
              <p className="lr-footer__col-title">The Standard</p>
              <nav className="lr-footer__links" aria-label="Footer navigation">
                <Link href="/" className="lr-footer__link">Home</Link>
                <Link href="/#products" className="lr-footer__link">The Arsenal</Link>
                <Link href="/#advisor" className="lr-footer__link">AI Sports Advisor</Link>
                <Link href="/#philosophy" className="lr-footer__link">Our Standard</Link>
                <Link href="/#movement" className="lr-footer__link">The Movement</Link>
                <Link href="/#action" className="lr-footer__link">Direct Concierge</Link>
                <button
                  className="lr-footer__link"
                  onClick={handleOpenPrivacy}
                  type="button"
                >
                  Privacy Policy
                </button>
                <button
                  className="lr-footer__link"
                  onClick={handleOpenPrivacy}
                  type="button"
                >
                  Terms of Service
                </button>
              </nav>
            </div>

            {/* ── Column 3: Newsletter ── */}
            <div>
              <p className="lr-footer__col-title">Stay in the Loop</p>
              <p className="lr-footer__newsletter-text">
                Get new batch drop notifications, secret promo codes, and verified workout programming.
              </p>
              {newsletterSent ? (
                <p style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 600 }}>
                  ✓ You&apos;re in! Welcome to the collective.
                </p>
              ) : (
                <form
                  className="lr-footer__newsletter-form"
                  onSubmit={handleNewsletter}
                  aria-label="Newsletter signup"
                >
                  <input
                    type="email"
                    className="lr-footer__newsletter-input"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    aria-label="Email address"
                    required
                  />
                  <button
                    type="submit"
                    className="lr-footer__newsletter-btn"
                    aria-label="Subscribe to newsletter"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="lr-footer__bottom">
            <p className="lr-footer__disclaimer">
              Disclaimer: Living Result products are dietary supplements intended to support
              fitness goals when combined with proper diet, training, hydration, and sleep.
              Results may vary from person to person based on body type, lifestyle, consistency,
              and genetics. These products are not medicines and are not intended to diagnose,
              treat, cure, or prevent any disease. Please consult a healthcare professional
              before use if you have any medical condition, allergies, or are under medication.
              <strong> * Note: Delivery charges will apply accordingly.</strong>
            </p>
            <div className="lr-footer__copy-row">
              <span className="lr-footer__copyright">
                &copy; 2026 Living Result. All rights reserved.
              </span>
              <span className="lr-footer__hashtag">#WEARETHELIVINGRESULT</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
