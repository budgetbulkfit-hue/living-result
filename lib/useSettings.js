'use client';

/**
 * lib/useSettings.js
 * Client-side hook that fetches /api/settings on mount and exposes:
 *  - fomoSettings   → { socialProof, exitIntent, scarcity, timerDuration, popupInterval }
 *  - noticeStrip    → { enabled, text }
 *  - isLaunched     → boolean (false = maintenance mode)
 *  - isLoading      → true while first fetch is in-flight
 *
 * Also exposes window.lrFomoSettings (global) for backward compat with
 * any legacy inline scripts that check it.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';

// Module-level cache so multiple component instances share one fetch
let cachedSettings = null;
let fetchPromise = null;

async function fetchSettings() {
  if (cachedSettings) return cachedSettings;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(`${API_BASE}/settings`, { cache: 'no-store' })
    .then((r) => r.json())
    .then((data) => {
      if (data.success && data.data) {
        cachedSettings = data.data;
        return data.data;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentVersionRef = useRef(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchSettings();
    setSettings(data);
    setIsLoading(false);

    // Expose fomoSettings globally so FOMO components can read it
    if (data?.fomo && typeof window !== 'undefined') {
      window.lrFomoSettings = data.fomo;
    }

    // Initialize site version for global refresh tracking
    if (data?.siteVersion !== undefined && currentVersionRef.current === null) {
      currentVersionRef.current = data.siteVersion;
      console.log('Initial Site Version:', currentVersionRef.current);
    }
  }, []);

  useEffect(() => {
    load();

    // Site Version Polling (Global Force Refresh support)
    const checkVersion = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings/version`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          const serverVersion = Number(data.version);
          if (currentVersionRef.current === null) {
            currentVersionRef.current = serverVersion;
          } else if (serverVersion > currentVersionRef.current) {
            console.log(`Global Refresh Triggered! (Old: ${currentVersionRef.current}, New: ${serverVersion})`);
            window.location.reload();
          }
        }
      } catch (err) {
        // Silently fail version checks
      }
    };

    // Poll every 15 seconds for faster response
    const intervalId = setInterval(checkVersion, 15000);
    return () => clearInterval(intervalId);
  }, [load]);

  return {
    isLoading,

    /** Full settings object (null while loading) */
    settings,

    /** FOMO feature toggles from admin dashboard */
    fomoSettings: settings?.fomo ?? {},

    /** { enabled: boolean, text: string } */
    noticeStrip: settings?.noticeStrip ?? { enabled: false, text: '' },

    /** false = site is in maintenance mode */
    isLaunched: settings?.isLaunched !== false, // default true so live site never breaks

    /** Force-refresh settings (e.g. after admin changes) */
    refresh: () => {
      cachedSettings = null;
      load();
    },
  };
}
