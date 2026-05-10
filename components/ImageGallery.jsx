'use client';

import { useState, useRef, useEffect } from 'react';

// Resolve image src — handles relative paths (from DB) and full URLs
function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  // Strip leading slash or "images/" prefix and map to /public/images/
  const filename = src.replace(/^\/?(images\/)?/, '');
  return `/images/${filename}`;
}

export default function ImageGallery({ flavors = [], selectedFlavorIndex = 0, productName = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const mainRef = useRef(null);

  // Build image list from the selected flavor + all other flavor images
  const allImages = flavors
    .map((f) => resolveImage(f.image))
    .filter(Boolean);

  // When flavor changes, jump to that flavor's image
  useEffect(() => {
    setActiveIndex(selectedFlavorIndex < allImages.length ? selectedFlavorIndex : 0);
  }, [selectedFlavorIndex, allImages.length]);

  const total = allImages.length;
  if (total === 0) return null;

  const goTo = (idx) => setActiveIndex((idx + total) % total);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1); }
    touchStartX.current = null;
  };

  return (
    <div className="modal-image-col" style={{ gap: '16px', position: 'relative' }}>
      {/* Main image */}
      <div
        className="main-image-wrapper"
        ref={mainRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ width: '100%', position: 'relative', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {total > 1 && (
          <button
            className="gallery-arrow left"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
          >‹</button>
        )}

        <img
          key={allImages[activeIndex]}
          src={allImages[activeIndex]}
          alt={`${productName} — image ${activeIndex + 1}`}
          style={{ maxHeight: '360px', maxWidth: '100%', objectFit: 'contain', transition: 'opacity 0.2s ease' }}
          onError={(e) => { e.target.src = '/images/hydra-whey-protein.png'; e.target.onerror = null; }}
        />

        {total > 1 && (
          <button
            className="gallery-arrow right"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
          >›</button>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="thumbnail-gallery">
          {allImages.map((src, idx) => (
            <button
              key={idx}
              className="thumbnail-img"
              onClick={() => goTo(idx)}
              style={{
                width: '60px',
                height: '60px',
                padding: '4px',
                background: '#0e0e0e',
                border: `2px solid ${idx === activeIndex ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <img
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image disclaimer */}
      <p className="image-disclaimer">
        *Images are for representation purposes only. Actual product may slightly vary.
      </p>
    </div>
  );
}
