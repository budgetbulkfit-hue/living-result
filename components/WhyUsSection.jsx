'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function useReveal(sectionRef) {
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    el.querySelectorAll('.lr-reveal').forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sectionRef]);
}

const points = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'The Best of the Best',
    text: "Overwhelmed by endless choices? We've done the research. Here you'll only find the elite, proven winners for each category. No filler, no compromises.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: '100% Lab-Tested Quality',
    text: 'Every supplement is rigorously tested, personally trusted, and used by us. If it doesn\'t produce real results, we don\'t sell it.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Our Unbeatable Promise',
    text: "You won't find this level of quality at these prices anywhere else. Find the exact same product cheaper? Show us and we'll beat it.",
  },
];

export default function WhyUsSection() {
  const sectionRef = useRef(null);
  useReveal(sectionRef);

  return (
    <section className="lr-whyus" id="why-choose" aria-labelledby="whyus-heading" ref={sectionRef}>
      <div className="lr-whyus__inner">
        {/* Left — image */}
        <div className="lr-whyus__image-col lr-reveal">
          <div className="lr-whyus__image-frame">
            <Image
              src="/images/why-us-image.webp"
              alt="Athlete holding Living Result supplement"
              width={600}
              height={640}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
              quality={80}
            />
          </div>
          {/* Floating badge */}
          <div className="lr-whyus__badge" aria-label="Lowest price guarantee">
            <span className="lr-whyus__badge-top">₹ Best</span>
            <span className="lr-whyus__badge-bottom">Price<br/>Guaranteed</span>
          </div>
        </div>

        {/* Right — content */}
        <div className="lr-whyus__content">
          <p className="lr-whyus__label lr-reveal">The Living Result Difference</p>
          <h2 className="lr-whyus__title lr-reveal lr-reveal-delay-1" id="whyus-heading">
            Curated for the 1%<br />
            Who <span>Refuse</span> to Settle.
          </h2>

          <div className="lr-whyus__points">
            {points.map((point, i) => (
              <div
                key={point.title}
                className={`lr-whyus__point lr-reveal lr-reveal-delay-${i + 2}`}
              >
                <div className="lr-whyus__point-icon" aria-hidden="true">
                  {point.icon}
                </div>
                <div>
                  <h3 className="lr-whyus__point-title">{point.title}</h3>
                  <p className="lr-whyus__point-text">{point.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`lr-reveal lr-reveal-delay-5`}>
            <Link href="#products" className="lr-btn-primary">
              Browse The Arsenal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
