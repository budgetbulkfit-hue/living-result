'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // Fetch products once on first open
  useEffect(() => {
    if (!isOpen || allProducts.length > 0) return;
    getProducts().then((data) => setAllProducts(data));
  }, [isOpen, allProducts.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  // Live filter
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      allProducts.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.flavors?.some((f) => f.name?.toLowerCase().includes(q))
      ).slice(0, 8)
    );
  }, [query, allProducts]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const getProductImage = (p) => {
    const flavorImage = p.flavors?.[0]?.image;
    return flavorImage || `/images/${p.slug}-1.png`;
  };

  const getProductPrice = (p) => {
    if (p.sizes?.length > 0) return p.sizes[0].price;
    return p.flavors?.[0]?.price || p.price || 0;
  };

  return (
    <div
      className={`search-overlay${isOpen ? ' active' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="search-overlay-content">
        <button className="search-close" onClick={onClose}>&times;</button>
        <h3>Search Products</h3>
        <div className="search-input-wrap">
          <input
            ref={inputRef}
            type="text"
            id="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for supplements..."
            autoComplete="off"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="search-results" id="searchResults">
          {query.trim() === '' && (
            <div className="search-no-results">Start typing to search products...</div>
          )}
          {query.trim() !== '' && results.length === 0 && (
            <div className="search-no-results">No products found for &quot;{query}&quot;</div>
          )}
          {results.map((p) => (
            <Link
              key={p._id}
              href={`/product/${p.slug}`}
              className="search-result-item"
              onClick={onClose}
            >
              <img
                src={getProductImage(p)}
                alt={p.name}
                onError={(e) => { e.target.src = `/images/${p.slug}.png`; }}
              />
              <div>
                <div className="search-result-name">{p.name}</div>
                <div className="search-result-price">₹{getProductPrice(p).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
