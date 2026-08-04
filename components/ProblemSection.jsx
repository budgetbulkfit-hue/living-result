'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const SIMULATED_RESULTS = [
  {
    brand: 'Marketplace Brands',
    price: '₹3,899',
    issue: 'Spiked prices, fake batch review confusion',
    icon: '✖',
  },
  {
    brand: '40+ Variant Clones',
    price: '₹3,299',
    issue: 'Paralysis by analysis. Which one actually works?',
    icon: '✖',
  },
  {
    brand: 'Raw White-Labels',
    price: '₹1,999',
    issue: 'Chalky texture, severe digestion and bloating issues',
    icon: '✖',
  },
];

export default function ProblemSection() {
  const [inView, setInView] = useState(false);
  const [typedText, setTypedText] = useState('');
  const sectionRef = useRef(null);
  const fullText = 'best whey protein for lean muscle in india';

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
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Typing simulator effect
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section
      className="lr-problem"
      id="problem"
      ref={sectionRef}
      aria-label="The Noise — The Problem with Traditional Supplement Stores"
    >
      <div className="container lr-problem__container">
        {/* Section Header */}
        <div className="lr-problem__header">
          <p className="lr-section-tag">CHAPTER 02 — THE NOISE</p>
          <h2 className="lr-problem__title">
            50 TABS OPEN. <span className="lr-text-dim">ZERO CERTAINTY.</span>
          </h2>
          <p className="lr-problem__subtitle">
            Buying supplements in India shouldn’t require a biochemistry degree or hours dodging counterfeit batches.
          </p>
        </div>

        {/* Interactive Search Simulator Console */}
        <div className="lr-problem__terminal">
          <div className="lr-problem__terminal-bar">
            <div className="lr-problem__terminal-dots">
              <span /><span /><span />
            </div>
            <div className="lr-problem__search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="lr-problem__typed-text">
                {typedText}
                <span className="lr-problem__cursor">|</span>
              </span>
            </div>
          </div>

          <div className="lr-problem__results">
            <div className="lr-problem__results-header">
              <span>Simulated Search Results: 142 Products Found</span>
              <span className="lr-problem__status-badge">Confusion High</span>
            </div>

            <div className="lr-problem__results-list">
              {SIMULATED_RESULTS.map((item, idx) => (
                <div
                  key={item.brand}
                  className={`lr-problem__result-item ${inView ? 'is-revealed' : ''}`}
                  style={{ animationDelay: `${(idx + 1) * 0.35 + 1.2}s` }}
                >
                  <div className="lr-problem__result-left">
                    <span className="lr-problem__cross">{item.icon}</span>
                    <div>
                      <strong className="lr-problem__brand-name">{item.brand}</strong>
                      <p className="lr-problem__issue">{item.issue}</p>
                    </div>
                  </div>
                  <span className="lr-problem__price-tag">{item.price}</span>
                </div>
              ))}
            </div>

            {/* Emotional Punchline */}
            <div className={`lr-problem__verdict ${inView ? 'is-revealed' : ''}`} style={{ animationDelay: '2.5s' }}>
              <div className="lr-problem__verdict-divider" />
              <p className="lr-problem__verdict-quote">
                “You spent 3 hours reading conflicting reviews. You still aren’t sure what to buy.”
              </p>
              <h3 className="lr-problem__breakthrough">
                THERE IS A BETTER WAY.
              </h3>
              <p className="lr-problem__solution-text">
                We curating the top 1% proven formulations and testing every single batch. No noise. No generic white-labels.
              </p>
            </div>
          </div>
        </div>

        {/* Curiosity Bridge to AI Advisor */}
        <div className="lr-curiosity-bridge">
          <Link href="#advisor" className="lr-curiosity-bridge__link">
            <span className="lr-curiosity-bridge__text">Don’t know what you need? Solve it in 30 seconds</span>
            <span className="lr-curiosity-bridge__arrow">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
