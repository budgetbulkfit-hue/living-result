'use client';

import { useState, useEffect } from 'react';

const PULSE_ITEMS = [
  { icon: '🔥', text: '48 verified orders dispatched today across 18 Indian cities', time: '2m ago' },
  { icon: '💪', text: 'Vikram S. from Bangalore started his 12-Week Lean Bulk protocol', time: '6m ago' },
  { icon: '⭐', text: 'New 5-Star Review on ISO Plasma Zero: "Zero bloating, cleanest digestion"', time: '14m ago' },
  { icon: '📦', text: 'Hydra Whey Isolate (Chocolate Fudge) fresh batch restocked', time: '22m ago' },
  { icon: '⚡', text: 'AI Advisor built 1,280 personalized protocols this week', time: '35m ago' },
  { icon: '🏆', text: 'Stack Lab Combo (Creatine + Whey Isolate) ranked #1 trending protocol', time: '1h ago' },
];

export default function LivingFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PULSE_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeItem = PULSE_ITEMS[currentIndex];

  return (
    <div className="lr-living-feed" aria-label="Today at Living Result Live Activity">
      <div className="container lr-living-feed__container">
        <div className="lr-living-feed__badge">
          <span className="lr-living-feed__pulse-dot" />
          <span className="lr-living-feed__label">TODAY AT LIVING RESULT:</span>
        </div>

        <div className="lr-living-feed__ticker" aria-live="polite">
          <span className="lr-living-feed__icon">{activeItem.icon}</span>
          <span className="lr-living-feed__text">{activeItem.text}</span>
          <span className="lr-living-feed__time">{activeItem.time}</span>
        </div>

        <div className="lr-living-feed__dots">
          {PULSE_ITEMS.map((_, i) => (
            <button
              key={i}
              className={`lr-living-feed__dot ${currentIndex === i ? 'is-active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Show activity ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
