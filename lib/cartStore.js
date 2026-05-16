'use client';

/**
 * lib/cartStore.js
 * Zustand cart store with localStorage persistence.
 *
 * Replaces the imperative cart[] array, saveCart(), updateCartUI()
 * from the vanilla script.js with a fully reactive, type-safe store.
 *
 * Cart item shape:
 * {
 *   key: string,            unique cart key (productId-flavorIdx-sizeIdx or combo-id-...)
 *   productId: string,      MongoDB _id
 *   name: string,
 *   flavorName: string,
 *   weight: string,
 *   price: number,
 *   image: string,
 *   qty: number,
 *   isCombo?: boolean,
 *   comboId?: string,
 *   comboSelections?: Array<{ productId, name, quantity, flavor }>
 * }
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Guard: only run localStorage in browser
const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }));

const useCart = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      items: [],
      cartSidebarOpen: false,

      // ── Cart sidebar controls ───────────────────────────────
      openCart: () => set({ cartSidebarOpen: true }),
      closeCart: () => set({ cartSidebarOpen: false }),

      // ── Computed helpers ───────────────────────────────────
      /** Total number of individual items in the cart */
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      /** Total price of all items */
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      // ── Actions ────────────────────────────────────────────

      /**
       * Add a regular product to the cart.
       * If the same key already exists, increment quantity.
       * Also auto-opens the cart sidebar.
       */
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, qty: i.qty + (item.qty || 1) } : i
              ),
              cartSidebarOpen: true,
            };
          }
          return { items: [...state.items, { ...item, qty: item.qty || 1 }], cartSidebarOpen: true };
        });
      },

      /**
       * Remove an item by its unique key.
       */
      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
      },

      /**
       * Change quantity by delta (+1 or -1). Removes item if qty reaches 0.
       */
      changeQty: (key, delta) => {
        set((state) => {
          const item = state.items.find((i) => i.key === key);
          if (!item) return state;
          const newQty = item.qty + delta;
          if (newQty <= 0) {
            return { items: state.items.filter((i) => i.key !== key) };
          }
          return {
            items: state.items.map((i) =>
              i.key === key ? { ...i, qty: newQty } : i
            ),
          };
        });
      },

      /**
       * Set a specific quantity for an item (used by input fields).
       */
      setQty: (key, qty) => {
        const safeQty = Math.max(1, Math.min(10, qty));
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, qty: safeQty } : i
          ),
        }));
      },

      /**
       * Clear the entire cart (called after successful checkout).
       */
      clearCart: () => set({ items: [] }),

      /**
       * Migrate legacy numeric product IDs from the old vanilla JS cart.
       * Called once on app mount.
       */
      migrateLegacyCart: () => {
        set((state) => {
          const hasLegacyIds = state.items.some(
            (item) => typeof item.productId !== 'string'
          );
          if (hasLegacyIds) return { items: [] };
          return state;
        });
      },
    }),
    {
      name: 'livingResultCart', // localStorage key — matches old key so existing carts persist
      storage,
      // Only persist the items array, not the actions
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCart;
