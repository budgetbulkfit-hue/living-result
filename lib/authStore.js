'use client';

/**
 * lib/authStore.js
 * Zustand auth store with localStorage persistence.
 *
 * Mirrors the cartStore.js pattern exactly.
 * - Persists { user, isLoggedIn, wishlist } to localStorage
 * - JWT token stays in httpOnly cookie — never in localStorage
 * - Exposes OTP flow actions (sendOtp, verifyOtp)
 * - Exposes fetchMe() for session hydration on mount
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  customerLogout as apiLogout,
  getMe as apiGetMe,
} from './api';

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }));

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      user: null,           // { _id, name, email, phone, role, rewardPoints, ... }
      isLoggedIn: false,
      isLoading: false,
      wishlist: [],         // Array of productId strings for O(1) membership check

      // ── Auth Actions ────────────────────────────────────────────────────────

      /**
       * Send OTP to email or phone.
       * @param {string} identifier  Email address or phone number
       * @param {'email'|'phone'} type
       * @returns {{ success: boolean, message: string, devOtp?: string }}
       */
      sendOtp: async (identifier, type) => {
        set({ isLoading: true });
        try {
          const data = await apiSendOtp(identifier, type);
          return data;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Verify OTP — creates account or logs in existing user.
       * On success: sets user, isLoggedIn, syncs wishlist to local state.
       * @param {string} identifier
       * @param {'email'|'phone'} type
       * @param {string} otp  6-digit code
       * @param {string} [name]  Required for new users
       */
      verifyOtp: async (identifier, type, otp, name) => {
        set({ isLoading: true });
        try {
          const data = await apiVerifyOtp(identifier, type, otp, name);
          if (data.success && data.data) {
            const user = data.data;
            const wishlist = Array.isArray(user.wishlist)
              ? user.wishlist.map((item) => (typeof item === 'string' ? item : item._id?.toString()))
              : [];
            set({ user, isLoggedIn: true, wishlist });
          }
          return data;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Hydrate auth state from the server using the httpOnly cookie.
       * Called once on AppShell mount.
       */
      fetchMe: async () => {
        try {
          const data = await apiGetMe();
          if (data.success && data.data) {
            const user = data.data;
            const wishlist = Array.isArray(user.wishlist)
              ? user.wishlist.map((item) => (typeof item === 'string' ? item : item._id?.toString() || item))
              : [];
            set({ user, isLoggedIn: true, wishlist });
          } else {
            // Cookie expired or invalid — clear local state
            set({ user: null, isLoggedIn: false, wishlist: [] });
          }
        } catch (_) {
          set({ user: null, isLoggedIn: false, wishlist: [] });
        }
      },

      /**
       * Log out — clears local state and calls backend to clear the cookie.
       */
      logout: async () => {
        try {
          await apiLogout();
        } catch (_) {}
        set({ user: null, isLoggedIn: false, wishlist: [] });
      },

      /**
       * Manually set user (e.g. after profile update).
       */
      setUser: (user) => set({ user }),

      // ── Wishlist Sync ────────────────────────────────────────────────────────

      /**
       * Check if a product is in the local wishlist (O(1) lookup).
       * @param {string} productId
       */
      isWishlisted: (productId) => {
        return get().wishlist.includes(String(productId));
      },

      /**
       * Optimistically add a product to local wishlist state.
       * @param {string} productId
       */
      addToWishlistLocal: (productId) => {
        const id = String(productId);
        set((state) => ({
          wishlist: state.wishlist.includes(id) ? state.wishlist : [...state.wishlist, id],
        }));
      },

      /**
       * Optimistically remove a product from local wishlist state.
       * @param {string} productId
       */
      removeFromWishlistLocal: (productId) => {
        const id = String(productId);
        set((state) => ({
          wishlist: state.wishlist.filter((wId) => wId !== id),
        }));
      },

      /**
       * Replace full wishlist from server response.
       * @param {string[]} ids
       */
      setWishlist: (ids) => {
        set({ wishlist: ids.map(String) });
      },
    }),
    {
      name: 'lr_auth',
      storage,
      // Only persist non-sensitive state — token is in httpOnly cookie
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        wishlist: state.wishlist,
      }),
    }
  )
);

export default useAuthStore;
