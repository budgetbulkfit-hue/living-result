'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const REAL_PRODUCTS_MARQUEE_1 = [
  { src: '/images/hydra-whey-protein.webp', name: 'Hydra Whey Protein', badge: '100% Genuine Sealed' },
  { src: '/images/hulk-mass-gainer.webp', name: 'Hulk Mass Gainer', badge: 'Verified Dense Fuel' },
  { src: '/images/iso-plasma-zero-protein.webp', name: 'ISO Plasma Zero', badge: 'Zero Carb Isolate' },
  { src: '/images/mb-iso-1.webp', name: 'MuscleBlaze Biozyme Iso', badge: 'Authorized Import' },
  { src: '/images/amg-1.webp', name: 'Anabolic Mass Gainer', badge: 'Clean Complex Carbs' },
  { src: '/images/wcp-1.webp', name: 'Whey Core Performance', badge: 'Direct Sourced' },
];

const REAL_PRODUCTS_MARQUEE_2 = [
  { src: '/images/mb-1.webp', name: 'Biozyme Performance Whey', badge: 'Direct Authorized' },
  { src: '/images/onsm1.webp', name: 'Optimum Nutrition Serious Mass', badge: 'Authenticity Seal' },
  { src: '/images/g-s-w-1.webp', name: 'Gold Standard 100% Whey', badge: 'Original Seal' },
  { src: '/images/aaw-1.webp', name: 'Advanced Anabolic Whey', badge: 'High Biological Value' },
  { src: '/images/awp-1.webp', name: 'Anabolic Whey Performance', badge: 'Tested Batch' },
  { src: '/images/creatine.webp', name: 'Micronized Creatine', badge: 'Pure Pharmaceutical Grade' },
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Rahul V.',
    location: 'Delhi',
    category: 'whey',
    rating: 5,
    date: '2 days ago',
    metrics: 'Great mixability · Zero bloating',
    quote:
      'Checked the scratch code on the official importer portal as soon as the package arrived — 100% genuine sealed unit. The flavor is clean and mixes effortlessly without foam.',
    product: 'Hydra Whey Protein (Chocolate Fudge)',
    helpfulCount: 42,
  },
  {
    id: 2,
    name: 'Amanpreet S.',
    location: 'Chandigarh',
    category: 'gainer',
    rating: 5,
    date: '4 days ago',
    metrics: '+3.8kg clean weight gain in 4 weeks',
    quote:
      'I usually get heavy stomach distress with gainers from other sellers. Hulk Mass Gainer from Living Result is smooth, digests easy, and the direct sourcing price saved me over ₹800 compared to other stores.',
    product: 'Hulk Mass Gainer (Cookies & Cream)',
    helpfulCount: 67,
  },
  {
    id: 3,
    name: 'Vikram K.',
    location: 'Mumbai',
    category: 'whey',
    rating: 5,
    date: '1 week ago',
    metrics: 'Ultra-fast absorption · Zero sugar',
    quote:
      'ISO Plasma Zero is by far the best isolate for calorie deficits. No chalky residue, tastes natural, and verified seal intact. Fast delivery in Mumbai.',
    product: 'ISO Plasma Zero Protein',
    helpfulCount: 31,
  },
  {
    id: 4,
    name: 'Sneha P.',
    location: 'Bangalore',
    category: 'combo',
    rating: 5,
    date: '1 week ago',
    metrics: 'Complete stack value · 100% authentic',
    quote:
      'Ordered the Whey + Creatine stack combo. Both tubs had intact importer stickers and QR codes. Incredible price for two authentic essentials.',
    product: 'Stack Lab Power Combo',
    helpfulCount: 54,
  },
  {
    id: 5,
    name: 'Mohit R.',
    location: 'Jaipur',
    category: 'gainer',
    rating: 5,
    date: '2 weeks ago',
    metrics: 'Massive calorie surplus · Great taste',
    quote:
      'Genuine ON Serious Mass with Glanbia importer seal. The WhatsApp team guided me on the right scoop timing. Top notch service.',
    product: 'Optimum Nutrition Serious Mass',
    helpfulCount: 29,
  },
  {
    id: 6,
    name: 'Karthik N.',
    location: 'Hyderabad',
    category: 'whey',
    rating: 5,
    date: '2 weeks ago',
    metrics: 'Smooth digestion · Authentic batch',
    quote:
      'I was hesitant at first because the price was lower than big marketplaces, but everything is 100% original. Authentic verification passed on the brand app.',
    product: 'MuscleBlaze Biozyme Iso-Whey',
    helpfulCount: 38,
  },
];

export default function MovementSection() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [helpfulMap, setHelpfulMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Review Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    product: 'Hydra Whey Protein',
    category: 'whey',
    rating: 5,
    metrics: '',
    quote: '',
  });

  // Load custom reviews from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lr_user_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews([...parsed, ...INITIAL_REVIEWS]);
        }
      }
    } catch (e) {
      console.warn('Could not read user reviews', e);
    }
  }, []);

  const handleHelpful = (id) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) return;

    const newReview = {
      id: Date.now(),
      name: formData.name.trim(),
      location: formData.location.trim() || 'India',
      category: formData.category || 'whey',
      rating: Number(formData.rating) || 5,
      date: 'Just now',
      metrics: formData.metrics.trim() || 'Verified Genuine Purchase',
      quote: formData.quote.trim(),
      product: formData.product.trim() || 'Living Result Genuine Supplement',
      helpfulCount: 1,
      isUserSubmitted: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      const existing = JSON.parse(localStorage.getItem('lr_user_reviews') || '[]');
      localStorage.setItem('lr_user_reviews', JSON.stringify([newReview, ...existing]));
    } catch (err) {
      console.warn('Could not save review locally', err);
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      setFormData({
        name: '',
        location: '',
        product: 'Hydra Whey Protein',
        category: 'whey',
        rating: 5,
        metrics: '',
        quote: '',
      });
    }, 1800);
  };

  const filteredReviews = reviews.filter(
    (r) => activeFilter === 'all' || r.category === activeFilter
  );

  return (
    <section
      className="lr-movement"
      id="movement"
      aria-label="Genuine Product Gallery & Customer Reviews"
    >
      <div className="container lr-movement__container">
        {/* Section Header */}
        <div className="lr-movement__header">
          <p className="lr-section-tag">AUTHENTIC PRODUCT GALLERY & REVIEWS</p>
          <h2 className="lr-movement__title">
            TESTED. SEALED. <span className="lr-text-accent">PROVEN GENUINE.</span>
          </h2>
          <p className="lr-movement__subtitle">
            Direct-sourced authenticated supplements powering athletes, lifters, and fitness enthusiasts across India.
          </p>
        </div>

        {/* Dual Product Showcase Marquees */}
        <div className="lr-movement__marquee-wrap" aria-label="Authentic product gallery">
          <div className="lr-movement__marquee lr-movement__marquee--left">
            <div className="lr-movement__marquee-track">
              {[...REAL_PRODUCTS_MARQUEE_1, ...REAL_PRODUCTS_MARQUEE_1].map((prod, i) => (
                <div key={i} className="lr-movement__prod-card">
                  <div className="lr-movement__prod-img-box">
                    <Image
                      src={prod.src}
                      alt={prod.name}
                      width={220}
                      height={200}
                      className="lr-movement__prod-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="lr-movement__prod-meta">
                    <span className="lr-movement__prod-name">{prod.name}</span>
                    <span className="lr-movement__prod-badge">{prod.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lr-movement__marquee lr-movement__marquee--right">
            <div className="lr-movement__marquee-track">
              {[...REAL_PRODUCTS_MARQUEE_2, ...REAL_PRODUCTS_MARQUEE_2].map((prod, i) => (
                <div key={i} className="lr-movement__prod-card">
                  <div className="lr-movement__prod-img-box">
                    <Image
                      src={prod.src}
                      alt={prod.name}
                      width={220}
                      height={200}
                      className="lr-movement__prod-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="lr-movement__prod-meta">
                    <span className="lr-movement__prod-name">{prod.name}</span>
                    <span className="lr-movement__prod-badge">{prod.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Action Bar: Filters & Write Review CTA */}
        <div className="lr-movement__bar">
          <div className="lr-movement__filters" role="tablist">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'whey', label: 'Whey & Isolates' },
              { id: 'gainer', label: 'Mass Gainers' },
              { id: 'combo', label: 'Combos & Stacks' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeFilter === tab.id}
                className={`lr-movement__filter-btn ${activeFilter === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="lr-movement__write-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <span>+ Write A Review</span>
          </button>
        </div>

        {/* Customer Reviews Grid */}
        <div className="lr-movement__stories-grid">
          {filteredReviews.map((review) => {
            const addedHelpful = helpfulMap[review.id] || 0;
            return (
              <div key={review.id} className="lr-movement__story-card">
                {/* Header */}
                <div className="lr-movement__story-top">
                  <div className="lr-movement__author">
                    <span className="lr-movement__avatar">{review.name.charAt(0)}</span>
                    <div>
                      <strong className="lr-movement__author-name">
                        {review.name}
                        <span className="lr-movement__verified-check">✓ Verified Buyer</span>
                      </strong>
                      <span className="lr-movement__location">
                        {review.location} · {review.date}
                      </span>
                    </div>
                  </div>
                  <div className="lr-movement__rating">
                    {'★'.repeat(review.rating)}
                  </div>
                </div>

                {/* Key Result / Metric */}
                {review.metrics && (
                  <div className="lr-movement__metric-pill">
                    <span className="lr-movement__metric-icon">✓</span>
                    <span>{review.metrics}</span>
                  </div>
                )}

                {/* Body Quote */}
                <p className="lr-movement__quote">“{review.quote}”</p>

                {/* Product Reference */}
                <div className="lr-movement__products-used">
                  <span className="lr-movement__products-label">Product Purchased:</span>
                  <span className="lr-movement__p-tag">{review.product}</span>
                </div>

                {/* Card Footer: Helpful button */}
                <div className="lr-movement__story-footer">
                  <button
                    type="button"
                    className="lr-movement__helpful-btn"
                    onClick={() => handleHelpful(review.id)}
                    aria-label="Mark review as helpful"
                  >
                    <span>👍 Helpful ({review.helpfulCount + addedHelpful})</span>
                  </button>
                  <span className="lr-movement__guarantee-text">100% Genuine Sealed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Write A Review Modal */}
        {isModalOpen && (
          <div className="lr-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div
              className="lr-modal-dialog"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
            >
              <div className="lr-modal-header">
                <h3 id="review-modal-title" className="lr-modal-title">
                  Share Your Verified Experience
                </h3>
                <button
                  type="button"
                  className="lr-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close review dialog"
                >
                  ✕
                </button>
              </div>

              {formSubmitted ? (
                <div className="lr-modal-success">
                  <div className="lr-modal-success__icon">✓</div>
                  <h4>Review Published Successfully!</h4>
                  <p>Thank you for contributing your genuine feedback to the community.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="lr-review-form">
                  <div className="lr-form-grid-2">
                    <div className="lr-form-group">
                      <label className="lr-form-label">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Vikram Sharma"
                        className="lr-form-input"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="lr-form-group">
                      <label className="lr-form-label">Your City / State</label>
                      <input
                        type="text"
                        name="location"
                        placeholder="e.g. Chandigarh, Punjab"
                        className="lr-form-input"
                        value={formData.location}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="lr-form-grid-2">
                    <div className="lr-form-group">
                      <label className="lr-form-label">Product Category *</label>
                      <select
                        name="category"
                        className="lr-form-select"
                        value={formData.category}
                        onChange={handleFormChange}
                      >
                        <option value="whey">Whey & Isolates</option>
                        <option value="gainer">Mass Gainers</option>
                        <option value="combo">Combos & Creatine</option>
                      </select>
                    </div>
                    <div className="lr-form-group">
                      <label className="lr-form-label">Star Rating *</label>
                      <select
                        name="rating"
                        className="lr-form-select"
                        value={formData.rating}
                        onChange={handleFormChange}
                      >
                        <option value="5">★★★★★ (5 Stars - Excellent)</option>
                        <option value="4">★★★★☆ (4 Stars - Great)</option>
                        <option value="3">★★★☆☆ (3 Stars - Average)</option>
                      </select>
                    </div>
                  </div>

                  <div className="lr-form-group">
                    <label className="lr-form-label">Product Name / Flavor</label>
                    <input
                      type="text"
                      name="product"
                      placeholder="e.g. Hydra Whey Protein (Chocolate Fudge)"
                      className="lr-form-input"
                      value={formData.product}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="lr-form-group">
                    <label className="lr-form-label">Key Highlight (Brief)</label>
                    <input
                      type="text"
                      name="metrics"
                      placeholder="e.g. 100% Genuine scratch code verified, great taste"
                      className="lr-form-input"
                      value={formData.metrics}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="lr-form-group">
                    <label className="lr-form-label">Your Review *</label>
                    <textarea
                      name="quote"
                      required
                      rows={4}
                      placeholder="Share your honest feedback regarding product authenticity, mixability, taste, delivery, and results..."
                      className="lr-form-textarea"
                      value={formData.quote}
                      onChange={handleFormChange}
                    />
                  </div>

                  <button type="submit" className="lr-submit-btn">
                    Post Verified Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Curiosity Bridge to Action Hub */}
        <div className="lr-curiosity-bridge">
          <Link href="#action" className="lr-curiosity-bridge__link">
            <span className="lr-curiosity-bridge__text">Ready to experience genuine quality? Connect with us ↓</span>
            <span className="lr-curiosity-bridge__arrow">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
