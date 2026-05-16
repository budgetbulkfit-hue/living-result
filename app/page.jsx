import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ProductsSection from '@/components/ProductsSection';
import { getProducts, getCombos } from '@/lib/api';

export const metadata = {
  title: 'Living Result | #WEARETHELIVINGRESULT',
  description:
    "Living Result — Premium fitness supplements. Stop guessing, start growing. Shop Whey Protein, Mass Gainer, Creatine and more at India's lowest prices.",
  alternates: {
    canonical: 'https://www.getlivingresult.in',
  },
};

export default async function HomePage() {
  // SSR: fetch products and combos at request time
  const [allProducts, combos] = await Promise.all([getProducts(), getCombos()]);

  const uniqueProducts = allProducts.filter((p) => p.category === 'unique');
  const commonProducts = allProducts.filter((p) => p.category === 'common');

  return (
    <>
      {/* PRE-LAUNCH OVERLAY placeholder — wired via AppShell/useSettings in layout */}

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <Image
            src="/images/hero-athlete.png"
            alt="Muscular athlete in dramatic lighting"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            priority
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-tagline">
              FORGE YOUR LEGACY.<br />BECOME THE{' '}
              <span className="highlight">RESULT.</span>
            </h1>
            <p className="hero-subtext">
              Stop wasting time guessing what works. We curate only the highest-grade,
              lab-tested supplements on the market so you don&apos;t have to look anywhere else.
            </p>
            <ul className="hero-benefits">
              <li>✓ Premium Selection</li>
              <li>✓ 100% Authentic</li>
              <li>✓ Lowest Price Guarantee</li>
            </ul>
            <div className="hero-cta-group">
              <Link href="#products" className="btn-primary">
                Start Your Transformation
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="#products" className="btn-secondary">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION — SSR data passed to client component */}
      <ProductsSection
        uniqueProducts={uniqueProducts}
        commonProducts={commonProducts}
        combos={combos}
      />

      {/* WHY US DETAILED */}
      <section className="why-us-detailed">
        <div className="container">
          <div className="why-us-grid">
            <div className="why-us-image">
              <Image src="/images/why-us-image.png" alt="Athlete holding a supplement tub" width={600} height={600} style={{ borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', width: '100%', height: 'auto' }} />
            </div>
            <div className="why-us-content">
              <p className="section-label">The Living Result Difference</p>
              <h2 className="section-title">CURATED FOR THE 1%<br />WHO REFUSE TO SETTLE.</h2>
              <div className="why-us-points">
                <div className="why-us-point">
                  <h4>THE BEST OF THE BEST.</h4>
                  <p>Overwhelmed by endless choices on other platforms? We cut through the noise. Here, you will only find the elite, proven winners for each category so you don&apos;t have to look around.</p>
                </div>
                <div className="why-us-point">
                  <h4>100% LAB-TESTED QUALITY.</h4>
                  <p>We provide the highest grade products on the market. Every supplement is rigorously tested, trusted, and used by us. If it doesn&apos;t produce real results, we don&apos;t sell it.</p>
                </div>
                <div className="why-us-point">
                  <h4>OUR UNBEATABLE PROMISE.</h4>
                  <p>You won&apos;t find such high-grade products at these prices anywhere else. If you do find the exact same product cheaper on the market, show us, and we will give it to you at a lower price.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Authentic Products</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <span className="stat-number" style={{ fontSize: '24px' }}>Verified</span>
              <span className="stat-label">Independent Reseller</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="stat-number">12/5</span>
              <span className="stat-label">Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="why-choose" id="why-choose">
        <div className="why-bg">
          <Image src="/images/why-choose-athlete.png" alt="Athlete with orange paint effect" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="container">
          <div className="why-content">
            <p className="section-label">Your Ultimate Shortcut</p>
            <h2 className="section-title">STOP GUESSING. START GROWING.</h2>
            <p>Your dedication deserves more than trial and error. You don&apos;t have time to test hundreds of mediocre supplements across different websites. We do the heavy lifting for you.</p>
            <p>We test it, we verify it, and we bring you only the absolute best. Because at the end of the day—</p>
            <span className="hashtag">#WEARETHELIVINGRESULT</span>
            <Link href="#products" className="btn-secondary">
              Browse The Arsenal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <div id="emotionalMessaging" style={{ marginTop: '30px', fontSize: '15px', fontWeight: '600', color: 'var(--accent)', fontStyle: 'italic', letterSpacing: '1px', minHeight: '24px' }}>
              Serious results start with serious decisions.
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <p className="section-label">Testimonials</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-grid">
            {[
              { name: 'Rohit Sharma', role: 'Bodybuilder', initial: 'R', text: '"Best quality supplements at the best price. Results speak for themselves!"' },
              { name: 'Kunal Rawat', role: 'Fitness Athlete', initial: 'K', text: '"ISO Plasma is next level. Fast recovery, pure gains. Living Result is my go-to brand."' },
              { name: 'Arjun Mehta', role: 'Gym Enthusiast', initial: 'A', text: '"Affordable and authentic. The Mass Gainer helped me put on 8kg in 3 months. Highly recommend!"' },
            ].map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initial}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER BENEFITS */}
      <div className="footer-benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="benefit-text">
                <h4>Free Shipping</h4>
                <p>ON BULK ORDERS</p>
              </div>
            </div>
            <div className="benefit-middle-text highlight-glow">
              &quot;You won&apos;t find this level of affordability, trust, safety, and results at this price anywhere else.&quot;
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="benefit-text">
                <h4>Secure Payments</h4>
                <p>100% secure payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <p className="section-label">Get in Touch</p>
          <h2 className="section-title" style={{ marginBottom: '20px' }}>We&apos;re Here to Help</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontSize: '16px' }}>
            Have questions about our products, your order, or need fitness advice? Reach out to us directly!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://wa.me/917003714398" className="btn-primary" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 32px', fontSize: '16px', background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '10px' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.49l4.625-1.472A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.742.874.87-2.675-.277-.44A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" />
              </svg>
              Chat on WhatsApp
            </a>
            <a href="https://ig.me/m/livingresult_official" className="btn-secondary" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 32px', fontSize: '16px', borderColor: '#E1306C', color: '#E1306C' }}>
              DM us on Instagram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
