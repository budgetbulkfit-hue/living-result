'use client';

import { useState, useEffect } from 'react';

const INITIAL_FORM = {
  name: '',
  slug: '',
  description: '',
  category: 'combos', // Always combos
  comboSelections: [],
  price: 0,
  published: true,
  images: []
};

export default function ComboEditor({ token, slugToEdit, onCancel, onSaved }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!!slugToEdit && slugToEdit !== 'new');
  const [saving, setSaving] = useState(false);
  
  // For the product selector
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    fetchProducts();
    if (slugToEdit && slugToEdit !== 'new') {
      fetchCombo(slugToEdit);
    } else {
      setFormData(INITIAL_FORM);
      setLoading(false);
    }
  }, [slugToEdit]);

  const fetchProducts = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      if (data.success) {
        // Only allow non-combos to be added to combos
        setAllProducts(data.data.filter(p => p.category !== 'combos'));
        if (data.data.length > 0) setSelectedProductId(data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch products for dropdown', err);
    }
  };

  const fetchCombo = async (slug) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/products/${slug}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          ...INITIAL_FORM,
          ...data.data,
          _id: data.data._id
        });
      }
    } catch (err) {
      console.error('Failed to fetch combo', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id ? `${API}/products/${formData._id}` : `${API}/products`;
      
      const payload = { ...formData, isCombo: true };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Combo saved successfully!');
        onSaved();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const addProductToCombo = () => {
    if (!selectedProductId) return;
    const prod = allProducts.find(p => p._id === selectedProductId);
    if (!prod) return;

    setFormData(s => ({
      ...s,
      comboSelections: [...s.comboSelections, {
        productId: prod._id,
        name: prod.name,
        flavor: prod.flavors?.[0]?.name || 'Standard',
        quantity: selectedQty,
        priceSnapshot: prod.price || prod.sizes?.[0]?.price || 0
      }]
    }));
  };

  const removeComboProduct = (idx) => {
    setFormData(s => ({
      ...s,
      comboSelections: s.comboSelections.filter((_, i) => i !== idx)
    }));
  };

  // Calculate Auto MRP
  const autoMRP = formData.comboSelections.reduce((acc, curr) => acc + (curr.priceSnapshot * curr.quantity), 0);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Combo Data...</div>;

  return (
    <div className="page-view active">
      <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formData._id ? 'Edit Combo Bundle' : 'Create Combo Bundle'}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#9b59b6', borderColor: '#9b59b6' }}>
            {saving ? 'Saving...' : '💾 Save Combo'}
          </button>
        </div>
      </div>

      <div className="panel-card" style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Combo Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} />
          </div>
          <div className="form-group">
            <label>URL Slug</label>
            <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>

        <hr style={{ borderTop: '1px solid var(--border)', margin: '30px 0' }} />

        <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>Bundle Contents</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 3, margin: 0 }}>
            <label>Select Product from Database</label>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
              {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price || p.sizes?.[0]?.price})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Quantity</label>
            <input type="number" min="1" value={selectedQty} onChange={e => setSelectedQty(parseInt(e.target.value) || 1)} />
          </div>
          <button className="btn-outline" onClick={addProductToCombo} style={{ height: '42px' }}>+ Add to Bundle</button>
        </div>

        {formData.comboSelections.length > 0 ? (
          <div className="table-responsive" style={{ marginBottom: '30px' }}>
            <table>
              <thead><tr><th>Product Name</th><th>Flavor</th><th>Quantity</th><th>Subtotal MRP</th><th>Action</th></tr></thead>
              <tbody>
                {formData.comboSelections.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                    <td>{item.flavor}</td>
                    <td>x{item.quantity}</td>
                    <td>₹{(item.priceSnapshot * item.quantity).toLocaleString()}</td>
                    <td><button onClick={() => removeComboProduct(idx)} className="action-btn btn-delete">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px', marginBottom: '30px' }}>
            No products in this combo yet.
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>Pricing & Visibility</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Manual Bundle Price (₹)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} placeholder={`Auto MRP is ₹${autoMRP}`} />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                Total MRP of contents: <strong style={{ color: '#fff' }}>₹{autoMRP.toLocaleString()}</strong>
              </div>
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label>Publish Combo</label>
              <label className="toggle-switch"><input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} /><span className="toggle-slider"></span></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
