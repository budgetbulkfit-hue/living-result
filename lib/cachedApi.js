import { cache } from 'react';
import { getProductBySlug as fetchProductBySlug } from './api';

/** Deduplicates product fetches between generateMetadata and page (server only). */
export const getProductBySlug = cache(fetchProductBySlug);
