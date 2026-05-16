'use client';

import { useState, useEffect } from 'react';

export default function ProductsView({ token, onEdit, onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Product Catalog</span>
        <button className="btn-primary" onClick={onAdd} style={{ background: '#2ecc71', borderColor: '#2ecc71', fontSize: '13px' }}>
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
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="common">Everyday Essentials</option>
            <option value="unique">Unique Collection</option>
            <option value="combos">Combos</option>
          </select>
          <button className="btn-outline" type="button" onClick={() => { setSearchTerm(''); setCategory('all'); }}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
            ) : (
              filteredProducts.map((p) => {
                const img = p.flavors?.[0]?.image?.replace(/\.png$/i, '.webp') || `/images/${p.slug}.webp`;
                const resolvedImg = img.startsWith('http') ? img : `/images/${img.replace(/^\/?(images\/)?/, '')}`;
                return (
                  <tr key={p._id}>
                    <td>
                      <img src={resolvedImg} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'var(--bg-primary)', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price || p.sizes?.[0]?.price || p.flavors?.[0]?.price || 0}</td>
                    <td>
                      <span style={{ color: p.scarcity > 0 && p.scarcity <= 10 ? '#e74c3c' : '#2ecc71' }}>
                        {p.scarcity || 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => onEdit(p.slug)}>Edit</button>
                      <button className="action-btn btn-delete">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
