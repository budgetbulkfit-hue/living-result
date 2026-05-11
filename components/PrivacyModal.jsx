'use client';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 100000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '40px', paddingTop: '60px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--accent)' }}>
          Privacy Policy & Terms
        </h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '10px' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>1. Introduction</h4>
          <p style={{ marginBottom: '20px' }}>Welcome to Living Result. These Terms and Privacy Policy govern your use of our website and services. By using our website, you agree to these terms.</p>

          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>2. Shipping & Delivery Terms (IMPORTANT)</h4>
          <p style={{ marginBottom: '20px' }}>
            Please be aware that all orders are dispatched via <strong>India Post</strong>. 
            <br /><br />
            <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Important Notice: DIT (Damage in Transit) and LIT (Loss in Transit) will NOT be covered by us.</span> 
            By placing an order, you accept these terms regarding shipping and transit liabilities.
          </p>

          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>3. Information Collection</h4>
          <p style={{ marginBottom: '20px' }}>We collect personal information such as your name, contact number, and shipping details when you interact with us or place orders via WhatsApp or Instagram. This information is strictly used for order processing and delivery.</p>

          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>4. Data Security</h4>
          <p style={{ marginBottom: '20px' }}>Your data privacy is important to us. We do not sell or share your personal information with third parties except as necessary to fulfill your orders (e.g., shipping partners).</p>

          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>5. Pricing and Price Match</h4>
          <p style={{ marginBottom: '20px' }}>We strive to provide the lowest prices. Our price match guarantee is valid only for identical products of the exact same quality and brand found on legitimate competitor platforms. Living Result reserves the right to verify the competitor&apos;s price and availability before matching.</p>

          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>6. Disclaimers</h4>
          <p style={{ marginBottom: '20px' }}>Living Result products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease. Results may vary from person to person. Please consult a healthcare professional before use.</p>
        </div>
      </div>
    </div>
  );
}
