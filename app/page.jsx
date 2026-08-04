import Footer from '@/components/Footer';
import ProductsSection from '@/components/ProductsSection';
import { getProducts, getCombos } from '@/lib/api';

// Living Result 2.0 Scene Architecture
import HeroSection from '@/components/HeroSection';
import AIAdvisorSection from '@/components/AIAdvisorSection';
import PhilosophySection from '@/components/PhilosophySection';
import LedgerSection from '@/components/LedgerSection';
import LivingFeed from '@/components/LivingFeed';
import MovementSection from '@/components/MovementSection';
import CTASection from '@/components/CTASection';

export const metadata = {
  title: 'Living Result | 100% Genuine Sealed Supplements Direct Sourced',
  description:
    "Living Result — Premium authenticated fitness supplements. 100% genuine sealed manufacturer products sourced directly from authorized brand importers at unbeatable prices.",
  alternates: {
    canonical: 'https://www.getlivingresult.in',
  },
};

export default async function HomePage() {
  // SSR: fetch products and combos at request time — 100% UNCHANGED
  const [allProducts, combos] = await Promise.all([getProducts(), getCombos()]);

  const uniqueProducts = allProducts.filter((p) => p.category === 'unique');
  const commonProducts = allProducts.filter((p) => p.category === 'common');

  // JSON-LD structured data — UNCHANGED
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.getlivingresult.in/#organization',
        name: 'Living Result',
        url: 'https://www.getlivingresult.in',
        logo: 'https://www.getlivingresult.in/images/logo.webp',
        sameAs: [
          'https://www.instagram.com/livingresult_official',
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.getlivingresult.in/#website',
        url: 'https://www.getlivingresult.in',
        name: 'Living Result',
        publisher: {
          '@id': 'https://www.getlivingresult.in/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.getlivingresult.in/search?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <>
      {/* Structured data — unchanged */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* SCENE 1: THE TENSION (Hero Emergence) */}
      <HeroSection />

      {/* SCENE 2: THE ADVISOR (Early Intelligence Concierge) */}
      <AIAdvisorSection />

      {/* SCENE 3: THE ARSENAL (Sensory Outcome Reveal Cards, SSR Products) */}
      <ProductsSection
        uniqueProducts={uniqueProducts}
        commonProducts={commonProducts}
        combos={combos}
      />

      {/* SCENE 4: THE PHILOSOPHY (The Standard: 55/45 Objection-Killer Split) */}
      <PhilosophySection />

      {/* SCENE 5: THE LEDGER (Direct Sourcing & Community Verification Numbers) */}
      <LedgerSection />

      {/* SCENE 6A: LIVING FEED (Real-Time Community Activity Stream) */}
      <LivingFeed />

      {/* SCENE 6B: THE MOVEMENT (Real Product Showcase + Verified Community Reviews) */}
      <MovementSection />

      {/* SCENE 7: THE CLOSING SHOT (Direct VIP WhatsApp Concierge & Instagram) */}
      <CTASection />

      {/* SCENE 8: THE FOUNDATION (Prestige Monolith Footer) */}
      <Footer />
    </>
  );
}
