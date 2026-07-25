'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/authStore';
import { addToWishlist, removeFromWishlist } from '@/lib/api';

/**
 * WishlistButton — reusable ❤️ toggle button.
 *
 * - Shows filled heart when product is in wishlist
 * - Optimistic update: UI responds instantly, rolls back on error
 * - If not logged in: triggers auth modal via onAuthRequired callback
 *
 * @param {string} productId  MongoDB _id of the product
 * @param {function} onAuthRequired  Called when user is not logged in
 * @param {string} [className]  Additional CSS classes
 */
export default function WishlistButton({ productId, onAuthRequired, className = '' }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isWishlisted = useAuthStore((s) => s.isWishlisted);
  const addToWishlistLocal = useAuthStore((s) => s.addToWishlistLocal);
  const removeFromWishlistLocal = useAuthStore((s) => s.removeFromWishlistLocal);

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wishlisted = mounted ? isWishlisted(productId) : false;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      if (onAuthRequired) onAuthRequired();
      else window.dispatchEvent(new CustomEvent('open-auth'));
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    if (wishlisted) {
      removeFromWishlistLocal(productId);
    } else {
      addToWishlistLocal(productId);
    }

    try {
      if (wishlisted) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (_) {
      // Roll back on error
      if (wishlisted) {
        addToWishlistLocal(productId);
      } else {
        removeFromWishlistLocal(productId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-btn ${wishlisted ? 'active' : ''} ${loading ? 'loading' : ''} ${className}`}
      onClick={handleToggle}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={wishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="wishlist-heart"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
