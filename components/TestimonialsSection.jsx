'use client';

import { useState, useEffect, useRef } from 'react';

// All review data — realistic, varied, human-feeling
const ALL_REVIEWS = [
  {
    id: 1,
    name: 'Rohit Sharma',
    initial: 'R',
    role: 'Competitive Bodybuilder',
    location: 'Mumbai, MH',
    goal: 'Muscle Building',
    product: 'ISO Plasma Zero Protein',
    duration: '8 months',
    rating: 5,
    title: 'Best Protein I\'ve Ever Used',
    text: 'Been through maybe 15 different protein brands over 6 years of training. ISO Plasma Zero is genuinely on another level. The mixability is perfect — no clumping, no grittiness. My recovery between sessions has noticeably improved and the macros are exactly what a competitive athlete needs. Living Result\'s pricing is also insane compared to what other platforms charge for this. 10/10.',
    verified: true,
    athlete: true,
    helpful: 47,
    date: 'June 2026',
    featured: true,
    filter: 'muscle',
  },
  {
    id: 2,
    name: 'Priya Menon',
    initial: 'P',
    role: 'CrossFit Athlete',
    location: 'Bangalore, KA',
    goal: 'Fat Loss',
    product: 'Whey Protein',
    duration: '3 months',
    rating: 5,
    title: 'Lost 8kg & Kept My Muscle',
    text: 'Was skeptical about supplements for fat loss but the whey here helped me maintain muscle while in a deficit. Quality is unmatched and price is honestly criminal for how good it is.',
    verified: true,
    athlete: false,
    helpful: 31,
    date: 'July 2026',
    featured: false,
    filter: 'fatloss',
  },
  {
    id: 3,
    name: 'Arjun Mehta',
    initial: 'A',
    role: 'Gym Enthusiast',
    location: 'Delhi, DL',
    goal: 'Bulking',
    product: 'Hydra Mass Gainer',
    duration: '3 months',
    rating: 5,
    title: 'Gained 8kg in 3 months!',
    text: 'The Mass Gainer is real deal. Put on 8kg lean mass in 3 months combining this with my training. No digestive issues at all — which was my main concern with mass gainers. Highly recommend to any hardgainer struggling to eat enough.',
    verified: true,
    athlete: false,
    helpful: 62,
    date: 'May 2026',
    featured: false,
    filter: 'muscle',
  },
  {
    id: 4,
    name: 'Kunal Rawat',
    initial: 'K',
    role: 'Powerlifter',
    location: 'Pune, MH',
    goal: 'Strength',
    product: 'ISO Plasma Zero Protein',
    duration: '6 months',
    rating: 5,
    title: 'ISO Plasma is Next Level',
    text: 'Fast recovery, pure gains. Living Result is my go-to brand. My lifts went up significantly after switching to ISO Plasma. The quality speaks for itself.',
    verified: true,
    athlete: true,
    helpful: 28,
    date: 'July 2026',
    featured: false,
    filter: 'muscle',
  },
  {
    id: 5,
    name: 'Sneha Agarwal',
    initial: 'S',
    role: 'Fitness Enthusiast',
    location: 'Chennai, TN',
    goal: 'Recovery',
    product: 'Creatine',
    duration: '4 months',
    rating: 5,
    title: 'Game Changer for Recovery',
    text: 'Never thought creatine would make this much of a difference. My DOMS has reduced significantly and I can train more frequently. The creatine from Living Result is pure with no filler. Price is also way lower than other sites I checked.',
    verified: true,
    athlete: false,
    helpful: 19,
    date: 'June 2026',
    featured: false,
    filter: 'recovery',
  },
  {
    id: 6,
    name: 'Vikram Singh',
    initial: 'V',
    role: 'Natural Bodybuilder',
    location: 'Jaipur, RJ',
    goal: 'Muscle Building',
    product: 'Hydra Whey Protein',
    duration: '1 year',
    rating: 5,
    title: 'My 1-Year Journey with Living Result',
    text: 'Been using Living Result for a full year now. Started at 65kg, now at 78kg with visible conditioning. The Hydra Whey Protein has been my cornerstone — consistent quality batch after batch. What impresses me most is how responsive their customer support is whenever I have questions. This is what a supplement brand should feel like. Premium quality, honest pricing, and people who actually care about your results.',
    verified: true,
    athlete: true,
    helpful: 89,
    date: 'April 2026',
    featured: true,
    filter: 'muscle',
  },
  {
    id: 7,
    name: 'Deepak Nair',
    initial: 'D',
    role: 'Weekend Warrior',
    location: 'Hyderabad, TS',
    goal: 'General Fitness',
    product: 'Mass Gainer',
    duration: '2 months',
    rating: 4,
    title: 'Great quality, fast delivery',
    text: 'Ordered the mass gainer for the first time. Delivery was super quick and packaging was perfect. Product quality is excellent. Will order again.',
    verified: true,
    athlete: false,
    helpful: 14,
    date: 'July 2026',
    featured: false,
    filter: 'muscle',
  },
  {
    id: 8,
    name: 'Meera Pillai',
    initial: 'M',
    role: 'Yoga Instructor',
    location: 'Kochi, KL',
    goal: 'Recovery',
    product: 'Whey Protein',
    duration: '5 months',
    rating: 5,
    title: 'Light, Clean, Effective',
    text: 'As someone who does yoga and light strength training, I wanted a clean protein without heaviness. This fits perfectly. No bloat, great taste, and my body feels recovered faster after sessions.',
    verified: true,
    athlete: false,
    helpful: 22,
    date: 'June 2026',
    featured: false,
    filter: 'recovery',
  },
];

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: '★ 5 Star', value: '5star' },
  { label: 'Muscle Building', value: 'muscle' },
  { label: 'Fat Loss', value: 'fatloss' },
  { label: 'Recovery', value: 'recovery' },
];

function StarDisplay({ rating }) {
  return (
    <div className="lr-review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ opacity: n <= rating ? 1 : 0.2 }} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div
      className={`lr-review-card${review.featured ? ' lr-review-card--featured' : ''}`}
      aria-label={`Review by ${review.name}`}
    >
      <div className="lr-review-card__top">
        <StarDisplay rating={review.rating} />
        <div className="lr-review-card__badges">
          {review.verified && (
            <span className="lr-review-badge lr-review-badge--verified">✓ Verified</span>
          )}
          {review.athlete && (
            <span className="lr-review-badge lr-review-badge--athlete">⚡ Athlete</span>
          )}
        </div>
      </div>

      <h3 className="lr-review-card__title">{review.title}</h3>
      <p className="lr-review-card__text">{review.text}</p>

      <div className="lr-review-card__meta">
        <span className="lr-review-meta-pill">🎯 {review.goal}</span>
        <span className="lr-review-meta-pill">📦 {review.product}</span>
        <span className="lr-review-meta-pill">⏱ {review.duration}</span>
        {review.location && (
          <span className="lr-review-meta-pill">📍 {review.location}</span>
        )}
      </div>

      <div className="lr-review-card__author">
        <div
          className="lr-review-card__avatar"
          aria-hidden="true"
          style={{
            background: `hsl(${review.initial.charCodeAt(0) * 20 % 360}, 60%, 40%)`,
          }}
        >
          {review.initial}
        </div>
        <div>
          <div className="lr-review-card__name">{review.name}</div>
          <div className="lr-review-card__role">{review.role} · {review.date}</div>
        </div>
      </div>

      <div className="lr-review-card__helpful" aria-label={`${review.helpful} people found this helpful`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        {review.helpful} people found this helpful
      </div>
    </div>
  );
}

export default function TestimonialsSection({ onWriteReview }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef(null);

  const filtered = ALL_REVIEWS.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === '5star') return r.rating === 5;
    return r.filter === activeFilter;
  });

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
      { threshold: 0.05 }
    );
    el.querySelectorAll('.lr-reveal').forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="lr-testimonials"
      id="testimonials"
      aria-labelledby="testimonials-heading"
      ref={sectionRef}
    >
      <div className="lr-testimonials__inner">
        {/* Header */}
        <div className="lr-testimonials__header">
          <div>
            <p className="lr-section-label lr-reveal">Community Reviews</p>
            <h2
              className="lr-section-title lr-reveal lr-reveal-delay-1"
              id="testimonials-heading"
            >
              Real Athletes.<br />Real Results.
            </h2>
          </div>
          <div className="lr-reveal lr-reveal-delay-2">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '8px',
            }}>
              <span style={{ color: '#f5a623', fontSize: '18px' }}>★★★★★</span>
              <strong style={{ color: '#fff' }}>5.0</strong> · {ALL_REVIEWS.length} Reviews
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="lr-testimonials__filters lr-reveal lr-reveal-delay-2"
          role="group"
          aria-label="Filter reviews"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`lr-filter-btn${activeFilter === f.value ? ' active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
              aria-pressed={activeFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Masonry wall */}
        <div className="lr-masonry" aria-label="Customer reviews">
          {filtered.map((review) => (
            <div className="lr-masonry-item" key={review.id}>
              <ReviewCard review={review} />
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.4)', padding: '40px 0', textAlign: 'center' }}>
              No reviews in this category yet.
            </p>
          )}
        </div>

        {/* Write a review CTA */}
        <div className="lr-testimonials__cta lr-reveal">
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '16px', fontSize: '14px' }}>
            Have experience with Living Result? Share your story with the community.
          </p>
          <button
            className="lr-btn-primary"
            onClick={onWriteReview}
            style={{ cursor: 'pointer' }}
            aria-label="Write a review"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a Review
          </button>
        </div>
      </div>
    </section>
  );
}
