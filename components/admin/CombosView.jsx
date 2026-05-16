'use client';

import { useState, useEffect } from 'react';

export default function CombosView({ token, onEdit, onAdd }) {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        if (data.success) {
          setCombos(data.data.filter(p => p.category === 'combos' || p.isCombo));
        }
      } catch (err) {
        console.error('Failed to fetch combos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, [token]);

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Combo Bundles</span>
        <button className="btn-primary" onClick={onAdd} style={{ background: '#9b59b6', borderColor: '#9b59b6', fontSize: '13px' }}>
          + Create Combo
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Banner</th>
              <th>Combo Name</th>
              <th>Items</th>
              <th>Auto MRP</th>
              <th>Final Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading combos...</td></tr>
            ) : combos.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No combos found.</td></tr>
            ) : (
              combos.map((c) => {
                const img = c.images?.[0]?.replace(/\.png$/i, '.webp') || `/images/${c.slug}.webp`;
                const resolvedImg = img.startsWith('http') ? img : `/images/${img.replace(/^\/?(images\/)?/, '')}`;
                const autoMRP = (c.comboSelections || []).reduce((acc, curr) => acc + (curr.priceSnapshot * curr.quantity), 0);
                
                return (
                  <tr key={c._id}>
                    <td>
                      <img src={resolvedImg} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'var(--bg-primary)', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                    <td><span style={{ background: 'rgba(155,89,182,0.15)', color: '#9b59b6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{(c.comboSelections || []).length} items</span></td>
                    <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{autoMRP}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{c.price}</td>
                    <td>
                      {c.published !== false ? <span style={{ color: '#2ecc71' }}>Active</span> : <span style={{ color: 'var(--text-muted)' }}>Draft</span>}
                    </td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => onEdit(c.slug)}>Edit</button>
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
