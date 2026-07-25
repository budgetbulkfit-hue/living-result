'use client';

import Link from 'next/link';

export function EmptyCart({ onClose }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven&apos;t added any gains to your cart yet.</p>
      <button onClick={onClose} className="btn-primary">Start Shopping</button>
      
      <style jsx>{`
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .empty-icon {
          font-size: 64px;
          filter: drop-shadow(0 0 10px rgba(255, 106, 0, 0.3));
          margin-bottom: 10px;
        }
        h3 {
          font-family: var(--font-heading);
          font-size: 24px;
          text-transform: uppercase;
          margin: 0;
        }
        p {
          color: var(--text-muted);
          max-width: 250px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export function EmptySearch({ query }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <h3>No results found</h3>
      <p>We couldn&apos;t find anything for &quot;{query}&quot;. Try checking the spelling or use broader terms.</p>
      
      <style jsx>{`
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 5px; }
        h3 { font-family: var(--font-heading); text-transform: uppercase; margin: 0; }
        p { color: var(--text-muted); font-size: 14px; line-height: 1.5; }
      `}</style>
    </div>
  );
}
