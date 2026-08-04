'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const [stage, setStage] = useState(0); // 0: Blackout, 1: Beat 1, 2: Beat 2, 3: Full Emergence
  const heroRef = useRef(null);

  useEffect(() => {
    // 3-Beat Staged Tension Emergence
    // If user prefers reduced motion, jump straight to stage 3
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(3);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 400);   // Beat 1: "Everyone sells supplements."
    const t2 = setTimeout(() => setStage(2), 2200);  // Beat 2: "Almost nobody sells certainty."
    const t3 = setTimeout(() => setStage(3), 4200);  // Beat 3: "Living Result — Stop Guessing."

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Cursor glow effect (GPU / CSS Custom Properties) - Desktop only
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--cursor-x', `${x}px`);
      el.style.setProperty('--cursor-y', `${y}px`);
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const skipIntro = () => setStage(3);

  return (
    <section
      className={`lr-hero-v2 ${stage === 3 ? 'is-emerged' : ''}`}
      id="hero"
      ref={heroRef}
      aria-label="Living Result — The Performance Standard"
      onClick={stage < 3 ? skipIntro : undefined}
    >
      {/* ── STAGE 0 - 2: THE TENSION PROLOGUE ── */}
      {stage < 3 && (
        <div className="lr-hero-v2__prologue" aria-live="polite">
          <div className="lr-hero-v2__prologue-center">
            {stage === 1 && (
              <p className="lr-hero-v2__beat lr-hero-v2__beat--1">
                Everyone sells supplements.
              </p>
            )}
            {stage === 2 && (
              <p className="lr-hero-v2__beat lr-hero-v2__beat--2">
                Almost nobody sells <span className="lr-text-glow">certainty.</span>
              </p>
            )}
          </div>
          <button
            className="lr-hero-v2__skip-btn"
            onClick={skipIntro}
            aria-label="Skip introduction"
          >
            Skip Intro ▾
          </button>
        </div>
      )}

      {/* ── STAGE 3: FULL HERO EMERGENCE ── */}
      <div className={`lr-hero-v2__main ${stage === 3 ? 'is-visible' : ''}`}>
        {/* Background silhouette atmosphere */}
        <div className="lr-hero-v2__bg" aria-hidden="true">
          <Image
            src="/images/hero-athlete.webp"
            alt=""
            fill
            className="lr-hero-v2__bg-img"
            priority
            quality={85}
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
          />
          <div className="lr-hero-v2__overlay" />
          <div className="lr-hero-v2__cursor-glow" />
        </div>

        <div className="container lr-hero-v2__container">
          {/* Brand Identity Tagline */}
          <div className="lr-hero-v2__kicker">
            <span className="lr-hero-v2__status-dot" />
            <span className="lr-hero-v2__kicker-text">The Performance Standard · 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="lr-hero-v2__headline">
            STOP GUESSING.
            <span className="lr-hero-v2__headline-accent">START BECOMING.</span>
          </h1>

          {/* Subtext: Direct Sourcing & Authenticity */}
          <p className="lr-hero-v2__subtext">
            100% genuine sealed supplements sourced directly from official brand importers.
            Authentic scratch codes intact, zero counterfeit risk, and unbeatable direct-to-athlete pricing.
          </p>

          {/* Preempting Objections - Quick Trust Matrix */}
          <div className="lr-hero-v2__trust-grid" role="list">
            <div className="lr-hero-v2__trust-item" role="listitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>100% Sealed & Authentic</span>
            </div>
            <div className="lr-hero-v2__trust-item" role="listitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Direct Authorized Importers</span>
            </div>
            <div className="lr-hero-v2__trust-item" role="listitem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Unbeatable Direct Prices</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="lr-hero-v2__actions">
            <Link href="#products" className="lr-btn-primary lr-hero-v2__cta-primary">
              <span>Explore The Arsenal</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="#advisor" className="lr-btn-ghost lr-hero-v2__cta-secondary">
              <span>⚡ Ask AI Advisor</span>
            </Link>
          </div>

          {/* Curiosity Bridge */}
          <div className="lr-curiosity-bridge">
            <Link href="#advisor" className="lr-curiosity-bridge__link" aria-label="Explore our curated arsenal">
              <span className="lr-curiosity-bridge__text">Explore genuine supplements & stacks</span>
              <span className="lr-curiosity-bridge__arrow">↓</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
