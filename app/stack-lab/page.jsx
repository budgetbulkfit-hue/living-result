import { getProducts } from '@/lib/api';
import Footer from '@/components/Footer';
import StackLabPage from './StackLabPage';

export const metadata = {
  title: 'Stack Lab™ | Build Your Custom Supplement Stack | Living Result',
  description:
    'Exclusively at Living Result — build your own custom supplement stack. Pick your fuel, pick your boost, mix flavors and get an exclusive bundle discount. Nobody else offers this.',
  keywords: ['supplement stack builder', 'custom stack', 'whey protein creatine combo', 'living result stack lab'],
  openGraph: {
    title: 'Stack Lab™ — Build Your Custom Stack | Living Result',
    description: 'India\'s only custom supplement stack builder. Exclusively at Living Result.',
    url: 'https://www.getlivingresult.in/stack-lab',
    siteName: 'Living Result',
    images: [{ url: '/images/logo.webp', width: 1200, height: 630, alt: 'Stack Lab - Living Result' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stack Lab™ — Build Your Custom Stack | Living Result',
    description: 'India\'s only custom supplement stack builder. Exclusively at Living Result.',
  },
  alternates: {
    canonical: 'https://www.getlivingresult.in/stack-lab',
  },
};

export default async function StackLabRoute() {
  const allProducts = await getProducts();
  return (
    <>
      <StackLabPage products={allProducts} />
      <Footer />
    </>
  );
}
