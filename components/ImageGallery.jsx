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

export default function ImageGallery({ images = [], flavors = [], selectedFlavorIndex = 0, productName = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const mainRef = useRef(null);

  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({});

  // Build image list: base images + currently selected flavor image
  const baseImages = images.map(resolveImage).filter(Boolean);
  const selectedFlavorImg = resolveImage(flavors[selectedFlavorIndex]?.image);
  
  // Combine base images with the selected flavor image
  const allImages = [...baseImages];
  if (selectedFlavorImg && !allImages.includes(selectedFlavorImg)) {
    allImages.unshift(selectedFlavorImg); // Put flavor image first!
  }

  // When flavor changes, reset to the first image
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedFlavorIndex]);

  const total = allImages.length;
  const displayImages = total > 0 ? allImages : ['/images/logo.png'];
  const displayTotal = displayImages.length;

  const goTo = (idx) => setActiveIndex((idx + displayTotal) % displayTotal);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1); }
    touchStartX.current = null;
  };

  // Magnifying Glass Handlers
  const handleMouseMove = (e) => {
    if (!mainRef.current || window.innerWidth <= 900) return; // Disable on mobile
    const { left, top, width, height } = mainRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setMagnifierStyle({
      display: 'block',
      backgroundImage: `url(${displayImages[activeIndex]})`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      backgroundSize: '250%',
      left: `${x - 75}px`,
      top: `${y - 75}px`,
    });
  };

  const handleMouseEnter = () => window.innerWidth > 900 && setShowMagnifier(true);
  const handleMouseLeave = () => setShowMagnifier(false);

  return (
    <div className="modal-image-col" style={{ gap: '16px', position: 'relative' }}>
      {/* Main image */}
      <div
        className="main-image-wrapper"
        ref={mainRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', position: 'relative', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', overflow: 'hidden', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}
      >
        {/* Magnifying Glass */}
        {showMagnifier && (
          <div
            style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              border: '2px solid var(--accent)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              ...magnifierStyle
            }}
          />
        )}
        {displayTotal > 1 && (
          <button
            className="gallery-arrow left"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
            style={{ position: 'absolute', left: '10px', zIndex: 5 }}
          >‹</button>
        )}

        <img
          key={displayImages[activeIndex]}
          src={displayImages[activeIndex]}
          alt={`${productName} — image ${activeIndex + 1}`}
          style={{ maxHeight: '360px', maxWidth: '100%', objectFit: 'contain', transition: 'opacity 0.2s ease' }}
          onError={(e) => { e.target.src = '/images/hydra-whey-protein.png'; e.target.onerror = null; }}
        />

        {displayTotal > 1 && (
          <button
            className="gallery-arrow right"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
            style={{ position: 'absolute', right: '10px', zIndex: 5 }}
          >›</button>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayTotal > 1 && (
        <div className="thumbnail-gallery" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0', marginTop: '10px' }}>
          {displayImages.map((src, idx) => (
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
