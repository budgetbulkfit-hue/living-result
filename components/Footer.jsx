'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrivacyModal from './PrivacyModal';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const handleOpenPrivacy = (e) => { e.preventDefault(); setIsPrivacyOpen(true); };
  
  return (
    <>
      {/* PRIVACY MODAL */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      {/* BRAND SAFETY STRIP */}
      <div className="brand-safety">
        <div className="container">
          <p style={{ fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', fontSize: '20px' }}>
            WE ARE AN INDEPENDENT RESELLER
          </p>
          <p>&quot;Living Result was built to make fitness supplements more affordable and accessible. We believe honest pricing, practical guidance, and consistency create real results.&quot;</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Image
                src="/images/logo.png"
                alt="Living Result"
                width={80}
                height={80}
                style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/#products">Shop</Link>
              <Link href="/#why-choose">About</Link>
              <button
                onClick={handleOpenPrivacy}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', padding: 0 }}
                onMouseOver={(e) => (e.target.style.color = 'var(--accent)')}
                onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
              >
                Privacy Policy
              </button>
              <button
                onClick={handleOpenPrivacy}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', padding: 0 }}
                onMouseOver={(e) => (e.target.style.color = 'var(--accent)')}
                onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
              >
                Terms
              </button>
            </div>
          </div>

          <div className="footer-disclaimer">
            <p>
              Disclaimer: Living Result products are dietary supplements intended to support fitness goals when combined
              with proper diet, training, hydration, and sleep. Results may vary from person to person based on body type,
              lifestyle, consistency, and genetics. These products are not medicines and are not intended to diagnose,
              treat, cure, or prevent any disease. Please consult a healthcare professional before use if you have any
              medical condition, allergies, or are under medication.{' '}
              <br /><br />
              <strong>* Note: Delivery charges will apply accordingly.</strong>
            </p>
          </div>

          <div className="footer-copy">
            &copy; 2026 Living Result. All rights reserved. | #WEARETHELIVINGRESULT
          </div>
        </div>
      </footer>
    </>
  );
}
