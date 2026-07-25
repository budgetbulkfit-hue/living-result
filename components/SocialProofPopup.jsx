'use client';

import { useEffect, useState, useRef } from 'react';
import { getRecentOrders } from '@/lib/api';

const NAMES = ['Rohan', 'Priya', 'Arjun', 'Kavya', 'Rahul', 'Neha', 'Vikram', 'Sneha', 'Amit', 'Pooja', 'Siddharth', 'Aditi', 'Karan', 'Riya'];
const KOLKATA_LOCATIONS = ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Howrah', 'Jadavpur', 'Behala', 'Gariahat', 'Dum Dum', 'Rajarhat'];
const FALLBACK_PRODUCTS = ['Hydra Whey Protein', 'Hydra Mass Gainer', 'ISO Plasma Zero', 'Hulk Mass Gainer', 'Creatine Monohydrate', 'Whey Protein Blend'];

export default function SocialProofPopup({ enabled = true, interval = 35 }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    getRecentOrders().then((data) => { if (data?.length > 0) setOrders(data); });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const showNext = () => {
      // Build message from real order or fallback
      let msg;
      if (orders.length > 0) {
        const order = orders[indexRef.current % orders.length];
        const productName = order.products?.[0]?.name || FALLBACK_PRODUCTS[Math.floor(Math.random() * FALLBACK_PRODUCTS.length)];

        // Extract city/location from order, fallback to a random Kolkata location
        let location = order.customerDetails?.address?.split(',').pop()?.trim() || '';
        if (!location || location.toLowerCase() === 'india' || location.toLowerCase() === 'in') {
          location = KOLKATA_LOCATIONS[Math.floor(Math.random() * KOLKATA_LOCATIONS.length)];
        }

        // Use a random name instead of 'Someone'
        const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

        msg = `${randomName} just ordered ${productName} from ${location}!`;
        indexRef.current++;
      } else {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const location = KOLKATA_LOCATIONS[Math.floor(Math.random() * KOLKATA_LOCATIONS.length)];
        const product = FALLBACK_PRODUCTS[Math.floor(Math.random() * FALLBACK_PRODUCTS.length)];
        msg = `${name} just ordered ${product} from ${location}!`;
      }
      setMessage(`✅ ${msg}`);
      setVisible(true);
      // Auto-hide after 4s
      setTimeout(() => setVisible(false), 4000);
    };

    const scheduleNext = () => {
      const baseIntervalMs = interval * 1000;
      // Add +/- 40% jitter to make it feel organic
      const jitter = baseIntervalMs * 0.4 * (Math.random() * 2 - 1);
      const nextDelay = Math.max(10000, baseIntervalMs + jitter);

      timerRef.current = setTimeout(() => {
        showNext();
        scheduleNext();
      }, nextDelay);
    };

    // Initial start with a random delay between 10-20 seconds
    const firstDelay = 10000 + Math.random() * 10000;
    timerRef.current = setTimeout(() => {
      showNext();
      scheduleNext();
    }, firstDelay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [enabled, orders, interval]);

  return (
    <div
      className={`social-proof-popup${visible ? ' active' : ''}`}
      id="socialProofPopup"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(255,106,0,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{message}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Living Result</div>
        </div>
      </div>
    </div>
  );
}
