'use client';

import { useState } from 'react';
import Link from 'next/link';
import ComboConfigurator from '@/components/ComboConfigurator';

export default function StackLabPage({ products = [] }) {
  const [shareStatus, setShareStatus] = useState('idle'); // 'idle' | 'copied' | 'shared'
  const SHARE_URL = 'https://www.getlivingresult.in/stack-lab';
  const SHARE_TEXT = '🧪 Build your own custom supplement stack at Living Result Stack Lab™ — exclusively available here! Pick your fuel, boost, and flavors. Only at Living Result.';

  const handleShare = async () => {
    // Try native Web Share API (mobile browsers, Safari)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Stack Lab™ — Living Result', text: SHARE_TEXT, url: SHARE_URL });
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 3000);
        return;
      } catch (_) { /* user cancelled or unsupported */ }
    }
    // Fallback — copy link to clipboard
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (_) {
      // Final fallback — prompt
      window.prompt('Copy this link:', SHARE_URL);
    }
  };

  const shareButtons = [
    {
      label: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(SHARE_TEXT + '\n' + SHARE_URL)}`,
    },
    {
      label: 'Instagram',
      color: '#E1306C',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      href: `https://www.instagram.com/`,
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Hero Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0800 50%, #0a0a0a 100%)',
        borderBottom: '1px solid rgba(255,106,0,0.15)',
        padding: '60px 0 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(255,106,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>›</span>
            <span style={{ color: '#ff6a00' }}>Stack Lab™</span>
          </div>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.3)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#ff8533', textTransform: 'uppercase' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6a00', display: 'inline-block', boxShadow: '0 0 8px #ff6a00' }} />
            Exclusively At Living Result
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(42px, 8vw, 80px)', textTransform: 'uppercase', letterSpacing: '5px', background: 'linear-gradient(135deg,#ff6a00 0%,#ffb347 50%,#fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '16px' }}>
            🧪 Stack Lab™
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Build your <strong style={{ color: '#fff' }}>own custom supplement stack</strong>. Pick your fuel, pick your boost, mix flavors — and get an exclusive ₹30 combo discount. <span style={{ color: '#ff6a00', fontWeight: 700 }}>Nobody else offers this.</span>
          </p>

          {/* Share Buttons Row */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Native / Copy Share */}
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                background: shareStatus === 'copied' ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${shareStatus === 'copied' ? '#2ecc71' : 'rgba(255,255,255,0.15)'}`,
                color: shareStatus === 'copied' ? '#2ecc71' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              {shareStatus === 'copied' ? (
                <>✓ Link Copied!</>
              ) : shareStatus === 'shared' ? (
                <>✓ Shared!</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share Stack Lab
                </>
              )}
            </button>

            {/* WhatsApp */}
            <a
              href={shareButtons[0].href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '50px', fontSize: '13px', fontWeight: 700,
                background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
            >
              {shareButtons[0].icon}
              Share on WhatsApp
            </a>

            {/* Copy Link */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(SHARE_URL);
                  setShareStatus('copied');
                  setTimeout(() => setShareStatus('idle'), 3000);
                } catch (_) { window.prompt('Copy this link:', SHARE_URL); }
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Link
            </button>
          </div>
        </div>
      </section>

      {/* ── Exclusive Banner ── */}
      <div className="container" style={{ paddingTop: '40px' }}>
        <div style={{
          marginBottom: '32px',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(255,106,0,0.1) 0%, rgba(255,179,71,0.05) 100%)',
          border: '1px solid rgba(255,106,0,0.25)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '30px' }}>🔒</div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#ff6a00', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Only Here. Nowhere Else.
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              No other supplement store in India offers a custom stack builder like this.{' '}
              <strong style={{ color: '#fff' }}>Mix, match, and save</strong> — built exclusively for you at Living Result.
            </div>
          </div>
        </div>

        {/* ── The Configurator ── */}
        <ComboConfigurator products={products} />
      </div>
    </div>
  );
}
