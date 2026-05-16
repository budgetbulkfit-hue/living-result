import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProductBySlug, getProducts, getComboBySlug } from '@/lib/api';

// ─── SEO: Generate dynamic metadata per product ───────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Living Result' };

  const price = product.finalPrice || product.sizes?.[0]?.price || product.flavors?.[0]?.price || product.price || 0;
  const image = product.flavors?.[0]?.image
    ? (product.flavors[0].image.startsWith('http')
        ? product.flavors[0].image
        : `/images/${product.flavors[0].image.replace(/^\/?(images\/)?/, '')}`)
    : `/images/${product.slug}.webp`;
  const optimizedImage = image.replace(/\.png$/i, '.webp');

  return {
    title: `${product.name} | Living Result`,
    description: product.description
      ? product.description.slice(0, 155)
      : `Buy ${product.name} at the best price — ₹${price.toLocaleString()}. 100% authentic, fast delivery. Shop now at Living Result.`,
    alternates: {
      canonical: `https://www.getlivingresult.in/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Living Result`,
      description: product.description?.slice(0, 155),
      images: [{ url: optimizedImage, width: 800, height: 800, alt: product.name }],
      type: 'website',
      siteName: 'Living Result',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Living Result`,
      description: product.description?.slice(0, 155),
      images: [optimizedImage],
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'INR',
    },
  };
}

// ─── SSG: Pre-render all product slugs at build time ─────────────────────────
export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// ─── Page Component (Server Component) ───────────────────────────────────────
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // If this product is a combo, also fetch the full combo data
  // (which includes comboGroups with populated product variants)
  if (product.isCombo || product.comboGroups) {
    const comboData = await getComboBySlug(slug);
    if (comboData) {
      // Merge combo-specific fields onto the product object
      product.comboGroups = comboData.comboGroups || [];
      product.products = comboData.products || product.products || [];
      product.autoCalculatedPrice = comboData.autoCalculatedPrice;
      product.autoCalculatedMrp = comboData.autoCalculatedMrp;
      product.manualOverridePrice = comboData.manualOverridePrice;
    }
  }

  const price = product.finalPrice || product.sizes?.[0]?.price || product.flavors?.[0]?.price || product.price || 0;
  const oldPrice = product.autoCalculatedMrp || product.sizes?.[0]?.oldPrice || null;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ paddingTop: '90px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '12px 24px' }}>
          <nav style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', transition: '0.2s' }}>Home</Link>
            <span>›</span>
            <Link href="/#products" style={{ color: 'var(--text-muted)', transition: '0.2s' }}>Shop</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail Card */}
      <div style={{ background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)', padding: '0 0 80px' }}>
        <div className="container">
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              marginTop: '24px',
              overflow: 'hidden',
            }}
          >
            {/*
              ProductDetailClient handles all client-side interactivity:
              flavor selection, size selection, qty, add-to-cart, tabs, reviews
            */}
            <ProductDetailClient product={product} />
          </div>

          {/* JSON-LD Structured Data for Google Shopping / Rich Results */}
          {(() => {
            // Build an absolute image URL (Google requires https://)
            const BASE_URL = 'https://www.getlivingresult.in';
            const rawImage = product.flavors?.[0]?.image || `/images/${product.slug}.webp`;
            const absoluteImage = rawImage.startsWith('http') ? rawImage : `${BASE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage.replace(/\.png$/i, '.webp')}`;

            // Determine real stock status
            const isOutOfStock =
              product.flavors?.length > 0
                ? product.flavors.every((f) => f.stock === 0 || f.inStock === false)
                : product.stock === 0 || product.inStock === false;

            const structuredData = {
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              description:
                product.description ||
                `Buy ${product.name} at Living Result — India's trusted supplement store. 100% authentic, fast delivery.`,
              image: absoluteImage,
              sku: product.sku || product._id || product.slug,
              brand: { '@type': 'Brand', name: 'Living Result' },
              offers: {
                '@type': 'Offer',
                url: `${BASE_URL}/product/${product.slug}`,
                priceCurrency: 'INR',
                price: price,
                priceValidUntil: '2027-12-31',
                itemCondition: 'https://schema.org/NewCondition',
                availability: isOutOfStock
                  ? 'https://schema.org/OutOfStock'
                  : 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Living Result' },
                // shippingDetails omitted — charges vary per order, cannot be represented as a fixed value
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  applicableCountry: 'IN',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
                },
              },
              ...(product.reviews && product.reviews.length > 0 && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: product.rating || 5,
                  bestRating: 5,
                  worstRating: 1,
                  reviewCount: product.reviews.length,
                },
                review: product.reviews.map(r => ({
                  '@type': 'Review',
                  reviewRating: {
                    '@type': 'Rating',
                    ratingValue: r.rating || 5,
                    bestRating: 5,
                  },
                  author: {
                    '@type': 'Person',
                    name: r.name || 'Verified Buyer'
                  },
                  reviewBody: r.comment || '',
                }))
              }),
            };

            const breadcrumbData = {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${BASE_URL}`
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Products',
                  item: `${BASE_URL}/#products`
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: product.name,
                  item: `${BASE_URL}/product/${product.slug}`
                }
              ]
            };

            return (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([structuredData, breadcrumbData]) }}
              />
            );
          })()}
        </div>
      </div>

      {/* Related products prompt */}
      <section style={{ padding: '60px 0', background: 'var(--bg-primary)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <p className="section-label">Keep Building</p>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>EXPLORE MORE PRODUCTS</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '15px' }}>
            Find your complete supplement stack at the best prices.
          </p>
          <Link href="/#products" className="btn-primary">
            ← Back to Shop
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
