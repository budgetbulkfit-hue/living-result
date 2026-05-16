export default async function sitemap() {
  // Replace with your actual live domain, or use the environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getlivingresult.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';

  let products = [];
  let combos = [];

  try {
    // Fetch all products
    const productsRes = await fetch(`${apiUrl}/products`, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const productsData = await productsRes.json();
    if (productsData.success) products = productsData.data;

    // Fetch all combos
    const combosRes = await fetch(`${apiUrl}/combos`, { next: { revalidate: 3600 } });
    const combosData = await combosRes.json();
    if (combosData.success) combos = combosData.data;
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  // Map products to sitemap URLs
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Map combos to sitemap URLs
  const comboUrls = combos.map((combo) => ({
    url: `${baseUrl}/product/${combo.comboSlug}`,
    lastModified: combo.updatedAt ? new Date(combo.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Combine the root URL with the dynamic product and combo URLs
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stack-lab`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...productUrls,
    ...comboUrls,
  ];
}