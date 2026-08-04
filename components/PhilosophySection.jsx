'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PILLARS = [
  {
    num: '01',
    title: 'Direct Sourced From Official Brand Importers',
    headline: '100% Genuine, sealed containers with verification intact.',
    explanation:
      'We never source from unverified open markets. Every tub, jar, and gainer comes directly from authorized Indian brand importers with official holographic seals and scratch authentication codes.',
  },
  {
    num: '02',
    title: 'Why Are Our Prices So Unbeatable?',
    headline: 'Zero marketplace commissions. Zero middleman markup.',
    explanation:
      'Large retail marketplaces charge heavy seller cuts and listing fees. By cutting out extra distribution layers and procuring in bulk, we pass maximum authentic savings directly to athletes.',
  },
  {
    num: '03',
    title: 'Zero Counterfeit Risk · Verifiable Authenticity',
    headline: 'Every batch is verifiable directly on official brand portals.',
    explanation:
      'Counterfeit supplements plague the fitness industry. Every unit we supply can be verified directly via the manufacturer’s official SMS or web authentication portal before opening.',
  },
  {
    num: '04',
    title: 'Unconditional Price Match & Instant Live Support',
    headline: 'Found a lower genuine price? We beat it instantly.',
    explanation:
      'If you find an authenticated lower price anywhere in India, drop us a direct message on WhatsApp and we will beat it. Real fitness experts on live standby to guide your stack.',
  },
];

export default function PhilosophySection() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section
      className="lr-philosophy"
      id="philosophy"
      aria-label="The Living Result Authenticity Standard"
    >
      <div className="container lr-philosophy__container">
        {/* Top Tagline */}
        <div className="lr-philosophy__header">
          <p className="lr-section-tag">CHAPTER 04 — THE AUTHENTICITY STANDARD</p>
          <h2 className="lr-philosophy__main-title">
            100% GENUINE. ZERO RISK. <br />
            <span className="lr-text-accent">DIRECT SOURCING POWER.</span>
          </h2>
          <p className="lr-philosophy__lead">
            Every product we stock is authenticated, sealed, and backed by our price-match guarantee.
          </p>
        </div>

        {/* 55/45 Split Layout */}
        <div className="lr-philosophy__grid">
          {/* Left: Interactive Objection-Killer Accordion */}
          <div className="lr-philosophy__pillars" role="tablist">
            {PILLARS.map((p, idx) => {
              const isActive = activePillar === idx;
              return (
                <div
                  key={p.num}
                  className={`lr-philosophy__pillar ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActivePillar(idx)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                >
                  <div className="lr-philosophy__pillar-top">
                    <span className="lr-philosophy__num">{p.num}</span>
                    <h3 className="lr-philosophy__pillar-title">{p.title}</h3>
                    <span className="lr-philosophy__toggle-icon">
                      {isActive ? '−' : '+'}
                    </span>
                  </div>
                  {isActive && (
                    <div className="lr-philosophy__pillar-body">
                      <p className="lr-philosophy__headline">{p.headline}</p>
                      <p className="lr-philosophy__desc">{p.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Dramatic Atmosphere Portrait */}
          <div className="lr-philosophy__visual">
            <div className="lr-philosophy__image-wrap">
              <Image
                src="/images/why-choose-athlete.webp"
                alt="Living Result Sourcing Standard"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="lr-philosophy__img"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div className="lr-philosophy__img-overlay" />
              <div className="lr-philosophy__badge">
                <span className="lr-philosophy__badge-icon">🛡️</span>
                <div>
                  <strong>100% Genuine Importer Sealed</strong>
                  <span>Authentic Scratch Codes Intact</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curiosity Bridge to Ledger */}
        <div className="lr-curiosity-bridge">
          <Link href="#ledger" className="lr-curiosity-bridge__link">
            <span className="lr-curiosity-bridge__text">Words are easy. Look at the ledger ↓</span>
            <span className="lr-curiosity-bridge__arrow">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
