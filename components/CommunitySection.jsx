'use client';

import { useEffect, useRef } from 'react';

// Product images used as community stand-ins (using existing assets)
const row1Images = [
  { src: '/images/iso-plasma-zero-protein.webp', label: 'ISO Plasma' },
  { src: '/images/hydra-whey-protein.webp', label: 'Hydra Whey' },
  { src: '/images/why-us-image.webp', label: 'Community' },
  { src: '/images/hydra-mass-gainer.webp', label: 'Mass Gainer' },
  { src: '/images/why-choose-athlete.webp', label: 'Performance' },
  { src: '/images/hulk-mass-gainer.webp', label: 'Hulk Gainer' },
  // Duplicated for seamless loop
  { src: '/images/iso-plasma-zero-protein.webp', label: 'ISO Plasma' },
  { src: '/images/hydra-whey-protein.webp', label: 'Hydra Whey' },
  { src: '/images/why-us-image.webp', label: 'Community' },
  { src: '/images/hydra-mass-gainer.webp', label: 'Mass Gainer' },
  { src: '/images/why-choose-athlete.webp', label: 'Performance' },
  { src: '/images/hulk-mass-gainer.webp', label: 'Hulk Gainer' },
];

const row2Images = [
  { src: '/images/mb-bg-1.webp', label: 'Training' },
  { src: '/images/creatine.webp', label: 'Creatine' },
  { src: '/images/poster.webp', label: 'Results' },
  { src: '/images/mb-bg-2.webp', label: 'Gym Life' },
  { src: '/images/onsm1.webp', label: 'ON Series' },
  { src: '/images/aaw-1.webp', label: 'Athlete' },
  // Duplicated
  { src: '/images/mb-bg-1.webp', label: 'Training' },
  { src: '/images/creatine.webp', label: 'Creatine' },
  { src: '/images/poster.webp', label: 'Results' },
  { src: '/images/mb-bg-2.webp', label: 'Gym Life' },
  { src: '/images/onsm1.webp', label: 'ON Series' },
  { src: '/images/aaw-1.webp', label: 'Athlete' },
];

function MarqueeRow({ images, reverse = false, ariaLabel }) {
  return (
    <div className="lr-marquee-row" aria-hidden="true">
      <div className={`lr-marquee-track${reverse ? ' lr-marquee-track--reverse' : ''}`}>
        {images.map((img, i) => (
          <div className="lr-marquee-card" key={`${img.src}-${i}`}>
            <img
              src={img.src}
              alt={img.label}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="lr-marquee-card__overlay">
              <span className="lr-marquee-card__label">{img.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunitySection() {
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
    <section
      className="lr-community"
      id="community"
      aria-labelledby="community-heading"
      ref={sectionRef}
    >
      {/* Header */}
      <div className="lr-community__inner">
        <p className="lr-community__label lr-reveal">The Movement</p>
        <h2
          className="lr-community__title lr-reveal lr-reveal-delay-1"
          id="community-heading"
        >
          The Living Result Community
        </h2>
        <p className="lr-community__sub lr-reveal lr-reveal-delay-2">
          Thousands of athletes across India are transforming their physique with Living Result.
          Join the movement. Be part of something bigger.
        </p>
      </div>

      {/* Marquee rows — aria-hidden since decorative */}
      <MarqueeRow images={row1Images} ariaLabel="Community photos row 1" />
      <MarqueeRow images={row2Images} reverse ariaLabel="Community photos row 2" />

      {/* CTA */}
      <div className="lr-community__cta lr-reveal lr-reveal-delay-3">
        <a
          href="https://wa.me/917003714398"
          className="lr-btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex' }}
          aria-label="Join the Living Result community on WhatsApp"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 0 1 2.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" />
          </svg>
          Join the Movement
        </a>
      </div>
    </section>
  );
}
