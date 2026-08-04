'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const STATS = [
  {
    target: 50000,
    prefix: '',
    suffix: '+',
    label: 'Orders Fulfilled',
    sub: 'delivering authentic supplements across India',
  },
  {
    target: 100,
    prefix: '',
    suffix: '%',
    label: 'Genuine & Sealed',
    sub: 'official importer holographic seals intact',
  },
  {
    target: 0,
    prefix: '₹',
    suffix: '',
    label: 'Marketplace Markup',
    sub: 'direct volume procurement savings passed to you',
  },
  {
    target: 24,
    prefix: '',
    suffix: '/7',
    label: 'WhatsApp Support',
    sub: 'real fitness experts on live message standby',
  },
];

export default function LedgerSection() {
  const [inView, setInView] = useState(false);
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const duration = 1600;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      setCounts(
        STATS.map((s) => {
          if (s.target === 0) return 0;
          return Math.floor(eased * s.target);
        })
      );

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [inView]);

  return (
    <section
      className="lr-ledger"
      id="ledger"
      ref={sectionRef}
      aria-label="Institutional Proof Ledger"
    >
      <div className="container lr-ledger__container">
        <div className="lr-ledger__header">
          <p className="lr-section-tag">CHAPTER 05 — THE LEDGER</p>
          <h2 className="lr-ledger__title">THE NUMBERS NEVER LIE.</h2>
        </div>

        <div className="lr-ledger__grid">
          {STATS.map((stat, i) => (
            <div key={i} className="lr-ledger__item">
              <div className="lr-ledger__num">
                {stat.prefix}
                {counts[i].toLocaleString()}
                {stat.suffix}
              </div>
              <h3 className="lr-ledger__label">{stat.label}</h3>
              <p className="lr-ledger__sub">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Curiosity Bridge to Living Feed & Movement */}
        <div className="lr-curiosity-bridge">
          <Link href="#movement" className="lr-curiosity-bridge__link">
            <span className="lr-curiosity-bridge__text">See what happens in real life ↓</span>
            <span className="lr-curiosity-bridge__arrow">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
