'use client';

import { useState, useCallback } from 'react';

const GOALS = [
  { emoji: '💪', label: 'Build Muscle' },
  { emoji: '🔥', label: 'Lose Fat' },
  { emoji: '⚡', label: 'Increase Strength' },
  { emoji: '🔄', label: 'Improve Recovery' },
  { emoji: '🏃', label: 'Endurance' },
  { emoji: '🌱', label: 'General Health' },
];

const PRODUCTS = [
  'ISO Plasma Zero Protein',
  'Hydra Whey Protein',
  'Hydra Mass Gainer',
  'Creatine',
  'Pre-Workout',
  'Mass Gainer',
  'Other',
];

const DURATIONS = [
  'Less than 1 month',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  'More than 1 year',
];

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="lr-star-selector" role="group" aria-label="Select star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`lr-star-btn${n <= (hovered || value) ? ' active' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={n === value}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [rating, setRating] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    product: '',
    duration: '',
    name: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleGoal = (label) => {
    setSelectedGoals((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const validate = useCallback(() => {
    const errs = {};
    if (rating === 0) errs.rating = 'Please select a rating';
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (formData.text.trim().length < 20) errs.text = 'Please write at least 20 characters';
    if (!formData.name.trim()) errs.name = 'Your name is required';
    return errs;
  }, [rating, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    // Simulate moderation delay
    await new Promise((res) => setTimeout(res, 1200));
    setSubmitting(false);
    setStep('success');
  };

  const handleClose = () => {
    onClose();
    // Reset after animation completes
    setTimeout(() => {
      setStep('form');
      setRating(0);
      setSelectedGoals([]);
      setFormData({ title: '', text: '', product: '', duration: '', name: '', location: '' });
      setErrors({});
    }, 400);
  };

  // Trap focus in modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className={`lr-review-modal-overlay${isOpen ? ' open' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
      aria-hidden={!isOpen}
    >
      <div className="lr-review-modal">
        {step === 'success' ? (
          /* ── Success State ── */
          <div className="lr-modal-success">
            <div className="lr-modal-success__icon" aria-hidden="true">✓</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', textTransform: 'uppercase' }}>
              Thank You!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.6', maxWidth: '360px', textAlign: 'center' }}>
              Your review has been submitted and is now pending moderation. Once approved, it will appear in our community wall.
            </p>
            <button className="lr-btn-primary" onClick={handleClose} style={{ marginTop: '8px' }}>
              Close
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="lr-review-modal__header">
              <h2 className="lr-review-modal__title">Share Your Experience</h2>
              <button
                type="button"
                className="lr-review-modal__close"
                onClick={handleClose}
                aria-label="Close review form"
              >
                ✕
              </button>
            </div>

            {/* Star rating */}
            <div className="lr-form-field">
              <span className="lr-form-label" id="rating-label">
                Your Rating *
              </span>
              <StarSelector value={rating} onChange={setRating} />
              {errors.rating && (
                <span style={{ color: '#e74c3c', fontSize: '12px' }} role="alert">
                  {errors.rating}
                </span>
              )}
            </div>

            {/* Fitness goal */}
            <div className="lr-form-field">
              <span className="lr-form-label">Your Fitness Goal</span>
              <div
                className="lr-goal-grid"
                role="group"
                aria-label="Select your fitness goals"
              >
                {GOALS.map(({ emoji, label }) => (
                  <button
                    key={label}
                    type="button"
                    className={`lr-goal-btn${selectedGoals.includes(label) ? ' active' : ''}`}
                    onClick={() => toggleGoal(label)}
                    aria-pressed={selectedGoals.includes(label)}
                  >
                    <span aria-hidden="true">{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="lr-form-grid-2">
              <div className="lr-form-field">
                <label className="lr-form-label" htmlFor="review-product">
                  Product Used
                </label>
                <select
                  id="review-product"
                  className="lr-form-select"
                  value={formData.product}
                  onChange={handleChange('product')}
                >
                  <option value="">Select product…</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="lr-form-field">
                <label className="lr-form-label" htmlFor="review-duration">
                  How Long Using?
                </label>
                <select
                  id="review-duration"
                  className="lr-form-select"
                  value={formData.duration}
                  onChange={handleChange('duration')}
                >
                  <option value="">Select duration…</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Review title */}
            <div className="lr-form-field">
              <label className="lr-form-label" htmlFor="review-title">
                Review Title *
              </label>
              <input
                id="review-title"
                type="text"
                className="lr-form-input"
                placeholder="Summarise your experience in one line…"
                value={formData.title}
                onChange={handleChange('title')}
                maxLength={80}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <span id="title-error" style={{ color: '#e74c3c', fontSize: '12px' }} role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Detailed review */}
            <div className="lr-form-field">
              <label className="lr-form-label" htmlFor="review-text">
                Your Review *
              </label>
              <textarea
                id="review-text"
                className="lr-form-textarea"
                placeholder="Tell the community about your results, experience, and what you noticed…"
                value={formData.text}
                onChange={handleChange('text')}
                maxLength={1000}
                aria-describedby={errors.text ? 'text-error' : undefined}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                {formData.text.length}/1000
              </div>
              {errors.text && (
                <span id="text-error" style={{ color: '#e74c3c', fontSize: '12px' }} role="alert">
                  {errors.text}
                </span>
              )}
            </div>

            {/* Name + Location */}
            <div className="lr-form-grid-2">
              <div className="lr-form-field">
                <label className="lr-form-label" htmlFor="review-name">
                  Your Name *
                </label>
                <input
                  id="review-name"
                  type="text"
                  className="lr-form-input"
                  placeholder="First name or full name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  maxLength={50}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <span id="name-error" style={{ color: '#e74c3c', fontSize: '12px' }} role="alert">
                    {errors.name}
                  </span>
                )}
              </div>
              <div className="lr-form-field">
                <label className="lr-form-label" htmlFor="review-location">
                  Location (optional)
                </label>
                <input
                  id="review-location"
                  type="text"
                  className="lr-form-input"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={handleChange('location')}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Moderation notice */}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5' }}>
              Reviews are moderated before publication to ensure authenticity. By submitting you agree
              to our community guidelines.
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="lr-submit-btn"
              disabled={submitting}
              aria-label="Submit review"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
