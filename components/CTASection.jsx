'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section
      className="lr-cta-hub"
      id="action"
      aria-label="Direct Action & Concierge Gateway"
    >
      <div className="container lr-cta-hub__container">
        <div className="lr-cta-hub__header">
          <p className="lr-section-tag">CHAPTER 07 — THE DECISION</p>
          <h2 className="lr-cta-hub__title">
            READY TO BECOME <span className="lr-text-accent">THE RESULT?</span>
          </h2>
          <p className="lr-cta-hub__subtitle">
            Join 50,000+ athletes who stopped settling for generic marketplace clones.
            Get instant human support or order directly today.
          </p>
        </div>

        <div className="lr-cta-hub__cards">
          {/* WhatsApp VIP Direct Concierge */}
          <div className="lr-cta-hub__card lr-cta-hub__card--wa">
            <div className="lr-cta-hub__card-badge">⚡ INSTANT RESPONSE</div>
            <h3 className="lr-cta-hub__card-title">💬 Direct WhatsApp Concierge</h3>
            <p className="lr-cta-hub__card-desc">
              Not sure which product or stack fits your goals? Chat directly with our
              fitness advisors. Real people, authentic advice, instant ordering assistance.
            </p>
            <a
              href="https://wa.me/917003714398?text=Hi%20Living%20Result%2C%20I%20need%20guidance%20on%20building%20my%20supplement%20protocol."
              target="_blank"
              rel="noopener noreferrer"
              className="lr-btn-primary lr-cta-hub__btn"
            >
              <span>Chat on WhatsApp</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Instagram Athlete Community */}
          <div className="lr-cta-hub__card lr-cta-hub__card--ig">
            <div className="lr-cta-hub__card-badge">📸 50K+ ATHLETES</div>
            <h3 className="lr-cta-hub__card-title">📸 @livingresult_official</h3>
            <p className="lr-cta-hub__card-desc">
              Follow our daily workout breakdowns, direct importer unboxings,
              and member-only flash drop discounts.
            </p>
            <a
              href="https://instagram.com/livingresult_official"
              target="_blank"
              rel="noopener noreferrer"
              className="lr-btn-ghost lr-cta-hub__btn"
            >
              <span>Join on Instagram</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Security & Authenticity Trust Bar */}
        <div className="lr-cta-hub__trust-bar">
          <div className="lr-cta-hub__trust-item">
            <span>🔒</span>
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <div className="lr-cta-hub__trust-item">
            <span>⚡</span>
            <span>Pan-India Fragile Express Shipping</span>
          </div>
          <div className="lr-cta-hub__trust-item">
            <span>🛡️</span>
            <span>100% Genuine Importer Sealed Batches</span>
          </div>
        </div>
      </div>
    </section>
  );
}
