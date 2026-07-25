'use client';

import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

function resolveAdminImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) {
    if (src.startsWith('http://res.cloudinary.com/')) {
      return src.replace('http://', 'https://');
    }
    return src;
  }
  const filename = src.replace(/^\/?(?:images\/)?/, '');
  return `/images/${filename}`.replace(/\.png$/i, '.webp');
}

export default function CombosView({ token, onEdit, onAdd }) {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombos();
  }, [token]);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const API = API_BASE;
      const res = await fetch(`${API}/combos`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCombos(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch combos', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCombo = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      const API = API_BASE;
      const res = await fetch(`${API}/combos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCombos(prev => prev.filter(c => c._id !== id));
      } else {
        alert(data.message || 'Failed to delete combo');
      }
    } catch (err) {
      console.error('Failed to delete combo', err);
      alert('Error connecting to backend');
    }
  };

  const getItemsSummary = (combo) => {
    const fixedCount = (combo.products || []).length;
    const groupCount = (combo.comboGroups || []).length;
    let parts = [];
    if (fixedCount > 0) parts.push(`${fixedCount} fixed`);
    if (groupCount > 0) parts.push(`${groupCount} group${groupCount > 1 ? 's' : ''}`);
    if (parts.length === 0) return '0 items';
    return parts.join(' + ');
  };

  const calcAutoMRP = (combo) => {
    const fixedMRP = (combo.products || []).reduce((acc, curr) => {
      const pPrice = curr.productId?.price || curr.customPrice || 0;
      return acc + (pPrice * (curr.quantity || 1));
    }, 0);
    // Add first option price from each combo group
    const groupsMRP = (combo.comboGroups || []).reduce((acc, group) => {
      const firstOption = group.options?.[0];
      if (firstOption) {
        const optPrice = firstOption.customPrice || firstOption.productId?.price || 0;
        return acc + optPrice;
      }
      return acc;
    }, 0);
    return fixedMRP + groupsMRP;
  };

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
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading combos...</td></tr>
            ) : combos.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No combos found. Create your first combo!</td></tr>
            ) : (
              combos.map((c) => {
                const img = resolveAdminImage(c.images?.[0] || `/images/${c.comboSlug}.webp`);
                const autoMRP = calcAutoMRP(c);

                return (
                  <tr key={c._id}>
                    <td>
                      <img src={img} alt={c.comboName} style={{ width: '44px', height: '44px', objectFit: 'contain', background: 'var(--bg-primary)', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      <div>{c.comboName}</div>
                      {c.comboSlug && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/{c.comboSlug}</div>}
                    </td>
                    <td>
                      <span style={{ background: 'rgba(155,89,182,0.15)', color: '#9b59b6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {getItemsSummary(c)}
                      </span>
                    </td>
                    <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{autoMRP.toLocaleString()}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{(c.manualOverridePrice || 0).toLocaleString()}</td>
                    <td>
                      {c.isPublished !== false
                        ? <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(46,204,64,0.15)', color: '#2ecc71', fontWeight: 'bold' }}>ACTIVE</span>
                        : <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: 'bold' }}>DRAFT</span>
                      }
                    </td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => onEdit(c.comboSlug)}>Edit</button>
                      <button className="action-btn btn-delete" onClick={() => handleDeleteCombo(c._id, c.comboName)}>Delete</button>
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
