'use client';

import Link from 'next/link';
import AIRecommender from './AIRecommender';

export default function AIAdvisorSection() {
  return (
    <section
      className="lr-advisor-section"
      id="advisor"
      aria-label="Personal AI Sports Nutrition Advisor"
    >
      <div className="container lr-advisor-section__container">
        {/* Header framing the bespoke concierge */}
        <div className="lr-advisor-section__header">
          <div className="lr-advisor-section__tag">
            <span className="lr-advisor-section__ai-sparkle">✦</span>
            <span>EXCLUSIVE INTELLIGENCE ENGINE</span>
          </div>
          <h2 className="lr-advisor-section__title">
            MEET YOUR PERSONAL <span className="lr-text-accent">SUPPLEMENT ADVISOR.</span>
          </h2>
          <p className="lr-advisor-section__subtitle">
            Tell us your exact training split, dietary preferences, or current plateau.
            Our proprietary algorithm builds your targeted stack in under 30 seconds.
          </p>
        </div>

        {/* Existing AIRecommender with all internal chat logic intact */}
        <div className="lr-advisor-section__card">
          <AIRecommender />
        </div>

        {/* Curiosity Bridge to Arsenal */}
        <div className="lr-curiosity-bridge">
          <Link href="#products" className="lr-curiosity-bridge__link">
            <span className="lr-curiosity-bridge__text">Explore the curated formulations ↓</span>
            <span className="lr-curiosity-bridge__arrow">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
