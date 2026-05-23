'use client';

import { useState, useEffect } from 'react';

function resolveAdminImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) {
    if (src.startsWith('http://res.cloudinary.com/')) {
      return src.replace('http://', 'https://');
    }
    return src;
  }
  const filename = src.replace(/^\/?(images\/)?/, '');
  return `/images/${filename}`.replace(/\.png$/i, '.webp');
}

export default function ProductsView({ token, onEdit, onAdd }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('serialAsc');

  // Reviews Modal States
  const [reviewsModalActive, setReviewsModalActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';
      const res = await fetch(`${API}/products`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map(p => {
          if (p.sizes) p.sizes.sort((a, b) => (a.price || 0) - (b.price || 0));
          // Metadata comments fallback
          if (p.description && p.description.includes('<!--[GF]-->')) {
            p.glutenFree = true;
          }
          if (p.description && p.description.includes('<!--[IMAGES:')) {
            const match = p.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
            if (match && match[1]) {
              try { p.images = JSON.parse(match[1]); } catch (e) {}
            }
          }
          if (p.description && p.description.includes('<!--[SUBCAT:')) {
            const match = p.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
            if (match && match[1]) {
              p.subCategory = match[1];
            }
          }
          return p;
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => `${p.name} ${p.slug}`.toLowerCase().includes(term));
    }

    // Sort filter
    result.sort((a, b) => {
      if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'serialAsc') return (Number(a.id) || 0) - (Number(b.id) || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, sortBy]);

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Error connecting to backend');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSortBy('serialAsc');
  };

  // Reviews Moderation
  const openReviewsModal = (product) => {
    setSelectedProduct(product);
    setReviewsModalActive(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';
      const res = await fetch(`${API}/products/${selectedProduct._id}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Update local state for both the selectedProduct reviews list and the products catalog list
        const updatedReviews = selectedProduct.reviewList.filter(r => r._id !== reviewId);
        const updatedProduct = { ...selectedProduct, reviewList: updatedReviews };
        setSelectedProduct(updatedProduct);
        setProducts(prev => prev.map(p => p._id === selectedProduct._id ? updatedProduct : p));
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Product Catalog</span>
        <button 
          className="btn-primary" 
          onClick={onAdd}
          style={{ background: '#2ecc71', borderColor: '#2ecc71', fontSize: '13px' }}
        >
          + Add Product
        </button>
      </div>

      <div className="panel-card">
        <div className="toolbar-row">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="common">Everyday Essentials</option>
            <option value="unique">Unique Collection</option>
            <option value="combos">Combos</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="serialAsc">Serial No. (Low-High)</option>
            <option value="nameAsc">Name (A-Z)</option>
            <option value="priceDesc">Price (High-Low)</option>
            <option value="priceAsc">Price (Low-High)</option>
          </select>
          <button className="btn-outline" type="button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{p.id || '-'}</td>
                  <td>
                    <img 
                      src={resolveAdminImage(p.flavors?.[0]?.image || p.images?.[0] || '')} 
                      alt={p.name} 
                      style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '4px' }} 
                    />
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                  <td>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{Number(p.price || 0).toLocaleString()}</td>
                  <td>{Number(p.stockLeft || 0)}</td>
                  <td>
                    {p.bestSeller && (
                      <span style={{ background: 'rgba(255, 106, 0, 0.2)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'inline-block' }}>
                        Best Seller
                      </span>
                    )}
                    {p.glutenFree && (
                      <span style={{ background: 'rgba(46, 204, 64, 0.2)', color: '#2ecc71', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block' }}>
                        Gluten Free
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="action-btn btn-edit" onClick={() => onEdit(p.slug)}>Edit</button>
                    <button 
                      className="action-btn btn-outline" 
                      style={{ color: '#f39c12', borderColor: '#f39c12', marginLeft: '5px', padding: '8px 10px' }} 
                      onClick={() => openReviewsModal(p)}
                    >
                      ★
                    </button>
                    <button className="action-btn btn-delete" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REVIEWS MODAL OVERLAY */}
      <div className={`modal-overlay ${reviewsModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '600px', padding: '30px' }}>
          <button className="modal-close" onClick={() => setReviewsModalActive(false)}>&times;</button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--accent)' }}>
            Manage Reviews - {selectedProduct?.name}
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {!selectedProduct?.reviewList || selectedProduct.reviewList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
            ) : (
              selectedProduct.reviewList.map(r => (
                <div key={r._id} style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{r.name}</strong>
                    <span style={{ color: '#f5a623' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', margin: '5px 0 10px 0' }}>{r.comment}</p>
                  <button 
                    className="btn-outline" 
                    style={{ borderColor: '#e74c3c', color: '#e74c3c', fontSize: '11px', padding: '4px 8px' }} 
                    onClick={() => handleDeleteReview(r._id)}
                  >
                    Delete Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
