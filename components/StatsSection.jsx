'use client';

import { useEffect, useRef, useState } from 'react';

// Animate a number from 0 to target using rAF — fires only once when in view
function useCountUp(target, suffix = '', decimals = 0) {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation for reduced-motion users — just show final value
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target + suffix);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          observer.disconnect();

          const duration = 1800;
          const start = performance.now();
          const isText = typeof target === 'string';

          if (isText) {
            // Text targets — just show after brief delay
            setTimeout(() => setDisplay(target + suffix), 300);
            return;
          }

          const end = parseFloat(target);
          const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out expo
            const eased = 1 - Math.pow(2, -10 * progress);
            const current = end * eased;
            setDisplay(current.toFixed(decimals) + suffix);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, decimals]);

  return { display, ref };
}

const stats = [
  {
    target: 50000,
    suffix: '+',
    label: 'Happy Customers',
    display: '50K+',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    target: 100,
    suffix: '%',
    label: 'Authentic Products',
    display: '100%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    target: 'Verified',
    suffix: '',
    label: 'Independent Reseller',
    display: 'Verified',
    isText: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
  {
    target: '24',
    suffix: '/7',
    label: 'Customer Support',
    display: '24/7',
    isText: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

// Individual counter card
function StatCard({ stat }) {
  const isText = stat.isText;
  const { display, ref } = useCountUp(
    isText ? stat.display : stat.target,
    isText ? '' : stat.suffix,
    0
  );

  return (
    <div className="lr-stat-card lr-reveal" ref={ref}>
      <div className="lr-stat-card__icon" aria-hidden="true">
        {stat.icon}
      </div>
      <div
        className="lr-stat-card__number"
        aria-label={`${isText ? stat.display : display} ${stat.label}`}
      >
        {isText ? stat.display : display}
      </div>
      <div className="lr-stat-card__label">{stat.label}</div>
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('.lr-reveal').forEach((n) => n.classList.add('lr-visible'));
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
      { threshold: 0.1 }
    );
    el.querySelectorAll('.lr-reveal').forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="lr-stats" aria-label="Key statistics" ref={sectionRef}>
      <div className="lr-stats__inner">
        <div className="lr-stats__grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
