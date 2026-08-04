'use client';

import { useEffect, useRef } from 'react';

export default function ContactSection() {
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
      className="lr-contact"
      id="contact"
      aria-labelledby="contact-heading"
      ref={sectionRef}
    >
      <div className="lr-contact__inner">
        <p className="lr-contact__label lr-reveal">Get in Touch</p>
        <h2
          className="lr-contact__title lr-reveal lr-reveal-delay-1"
          id="contact-heading"
        >
          We&apos;re Here<br />to Help
        </h2>
        <p className="lr-contact__sub lr-reveal lr-reveal-delay-2">
          Have questions about products, your order, or need personalised fitness advice?
          Reach out directly — real people, real answers.
        </p>

        <div className="lr-contact__cards lr-reveal lr-reveal-delay-3">
          {/* WhatsApp */}
          <a
            href="https://wa.me/917003714398"
            className="lr-contact-card lr-contact-card--wa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
          >
            <div className="lr-contact-card__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 0 1 2.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" />
              </svg>
            </div>
            <div className="lr-contact-card__name">WhatsApp</div>
            <div className="lr-contact-card__desc">
              Chat with us instantly. Order queries, product advice, and everything in between.
            </div>
            <span className="lr-contact-card__cta">Chat Now</span>
          </a>

          {/* Instagram */}
          <a
            href="https://ig.me/m/livingresult_official"
            className="lr-contact-card lr-contact-card--ig"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message us on Instagram"
          >
            <div className="lr-contact-card__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div className="lr-contact-card__name">Instagram</div>
            <div className="lr-contact-card__desc">
              DM us on Instagram. Follow us for the latest drops, offers, and community content.
            </div>
            <span className="lr-contact-card__cta">DM Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}
