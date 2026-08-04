'use client';

import { useEffect, useRef } from 'react';

// Lightweight scroll reveal — IntersectionObserver, zero libraries
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Immediately visible if reduced motion preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('.lr-reveal').forEach((node) => node.classList.add('lr-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    el.querySelectorAll('.lr-reveal').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const pillars = [
  {
    num: '01',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Only The Best',
    text: "Overwhelmed by endless choices on other platforms? We cut through the noise. You'll only find the elite, proven winners in each category — no mediocre products, no compromises.",
  },
  {
    num: '02',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: '100% Lab-Tested',
    text: "Every supplement we carry is rigorously tested, personally trusted, and only here because it produces real results. If it doesn't work, we don't sell it. Simple.",
  },
  {
    num: '03',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Lowest Price Promise',
    text: "You won't find high-grade products at these prices anywhere else. Find the exact same product cheaper elsewhere? Show us — we'll beat it. That's our unbreakable promise.",
  },
];

export default function StorySection() {
  const sectionRef = useReveal();

  return (
    <section className="lr-story" id="story" aria-labelledby="story-heading" ref={sectionRef}>
      {/* Decorative background text */}
      <div className="lr-story__bg-text" aria-hidden="true">LIVING</div>

      <div className="lr-story__inner">
        {/* Header */}
        <div className="lr-story__header">
          <p className="lr-story__label lr-reveal">The Living Result Difference</p>
          <h2 className="lr-story__title lr-reveal lr-reveal-delay-1" id="story-heading">
            Why We Exist
            <span>& Why It Matters</span>
          </h2>
        </div>

        {/* Pillars grid */}
        <div className="lr-story__pillars">
          {pillars.map((p, i) => (
            <div
              key={p.num}
              className={`lr-story__pillar lr-reveal lr-reveal-delay-${i + 2}`}
            >
              <div className="lr-story__pillar-num" aria-hidden="true">{p.num}</div>
              <div className="lr-story__pillar-icon">{p.icon}</div>
              <h3 className="lr-story__pillar-title">{p.title}</h3>
              <p className="lr-story__pillar-text">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
