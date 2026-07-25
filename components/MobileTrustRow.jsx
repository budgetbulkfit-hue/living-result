'use client';

export default function MobileTrustRow() {
  return (
    <div className="mobile-trust-row">
      <style jsx>{`
        .mobile-trust-row {
          display: none;
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 0;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-trust-row::-webkit-scrollbar { display: none; }
        
        .trust-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 20px;
          padding: 0 20px;
          min-width: max-content;
        }
        
        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }
        
        .trust-icon {
          color: var(--accent);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .mobile-trust-row { display: block; }
        }
      `}</style>
      
      <div className="trust-container">
        <div className="trust-item">
          <span className="trust-icon">✓</span>
          100% Authentic
        </div>
        <div className="trust-item">
          <span className="trust-icon">₹</span>
          Price Match Guarantee
        </div>
        <div className="trust-item">
          <span className="trust-icon">🛡️</span>
          Handpicked Products
        </div>
        <div className="trust-item">
          <span className="trust-icon">⚡</span>
          Super Fast Delivery
        </div>
      </div>
    </div>
  );
}
