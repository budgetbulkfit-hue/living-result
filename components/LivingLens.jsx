'use client';

import { useState, useEffect } from 'react';

const GOALS = [
  { id: 'all', label: 'All Protocols', icon: '⚡' },
  { id: 'muscle', label: 'Build Muscle', icon: '💪' },
  { id: 'fatloss', label: 'Shred Fat', icon: '🔥' },
  { id: 'energy', label: 'Peak Energy', icon: '⚡' },
  { id: 'beginner', label: 'Beginner', icon: '🧪' },
];

export default function LivingLens() {
  const [activeGoal, setActiveGoal] = useState('all');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('lr_activeGoal') || 'all';
    setActiveGoal(saved);

    // Show after scrolling past 280px so it doesn't obstruct initial hero emergence
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelect = (id) => {
    setActiveGoal(id);
    sessionStorage.setItem('lr_activeGoal', id);
    window.dispatchEvent(new CustomEvent('lr-lens-change', { detail: { goal: id } }));
  };

  if (!visible) return null;

  return (
    <aside
      className="lr-living-lens"
      aria-label="Personalized Goal Lens"
      role="region"
    >
      <div className="lr-living-lens__inner">
        <span className="lr-living-lens__label">
          <span className="lr-living-lens__pulse" />
          Protocol Lens:
        </span>
        <div className="lr-living-lens__pills" role="tablist">
          {GOALS.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={activeGoal === g.id}
              className={`lr-living-lens__pill ${activeGoal === g.id ? 'is-active' : ''}`}
              onClick={() => handleSelect(g.id)}
            >
              <span className="lr-living-lens__icon">{g.icon}</span>
              <span className="lr-living-lens__text">{g.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
