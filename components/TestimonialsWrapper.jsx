'use client';

import { useState } from 'react';
import TestimonialsSection from './TestimonialsSection';
import ReviewModal from './ReviewModal';

/**
 * TestimonialsWrapper
 *
 * Thin client component that bridges the server-rendered page.jsx
 * with the interactive TestimonialsSection and ReviewModal.
 * All review modal state lives here — zero extra re-renders on the server.
 */
export default function TestimonialsWrapper() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <>
      <TestimonialsSection onWriteReview={() => setIsReviewModalOpen(true)} />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </>
  );
}
