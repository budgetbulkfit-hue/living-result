'use client';

import { useState, useEffect } from 'react';

const INITIAL_FORM = {
  name: '',
  slug: '',
  category: 'common',
  subCategory: '',
  description: '',
  ingredients: '',
  nutritionFacts: [],
  discount: '',
  stock: 0,
  scarcity: 0,
  showScarcity: false,
  bestSeller: false,
  glutenFree: false,
  manualRating: 5,
  manualReviewCount: 0,
  sizes: [],
  flavors: [],
  images: []
};

export default function ProductEditor({ token, slugToEdit, onCancel, onSaved }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!!slugToEdit && slugToEdit !== 'new');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slugToEdit && slugToEdit !== 'new') {
      fetchProduct(slugToEdit);
    } else {
      setFormData(INITIAL_FORM);
      setLoading(false);
    }
  }, [slugToEdit]);

  const fetchProduct = async (slug) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/products/${slug}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          ...INITIAL_FORM,
          ...data.data,
          _id: data.data._id // Keep _id for PUT
        });
      }
    } catch (err) {
      console.error('Failed to fetch product', err);
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
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product saved successfully!');
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

  // Arrays Management
  const addSize = () => setFormData(s => ({ ...s, sizes: [...s.sizes, { weight: '', price: 0, oldPrice: 0, flavorsAllowed: [], inStock: true }] }));
  const updateSize = (idx, field, val) => {
    const newSizes = [...formData.sizes];
    newSizes[idx][field] = val;
    setFormData({ ...formData, sizes: newSizes });
  };
  const removeSize = (idx) => setFormData(s => ({ ...s, sizes: s.sizes.filter((_, i) => i !== idx) }));

  const addFlavor = () => setFormData(s => ({ ...s, flavors: [...s.flavors, { name: '', image: '', inStock: true }] }));
  const updateFlavor = (idx, field, val) => {
    const newFlavors = [...formData.flavors];
    newFlavors[idx][field] = val;
    setFormData({ ...formData, flavors: newFlavors });
  };
  const removeFlavor = (idx) => setFormData(s => ({ ...s, flavors: s.flavors.filter((_, i) => i !== idx) }));

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Product Data...</div>;

  return (
    <div className="page-view active">
      <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formData._id ? 'Edit Product' : 'Add New Product'}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#2ecc71', borderColor: '#2ecc71' }}>
            {saving ? 'Saving...' : '💾 Save Product'}
          </button>
        </div>
      </div>

      <div className="panel-card">
        {/* Tabs */}
        <div className="editor-tabs" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          {['basic', 'variants', 'flavors'].map(t => (
            <div 
              key={t}
              className={`editor-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t.toUpperCase()}
            </div>
          ))}
        </div>

        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} />
              </div>
              <div className="form-group">
                <label>URL Slug</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="common">Everyday Essentials</option>
                  <option value="unique">Unique Collection</option>
                  <option value="combos">Combos</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sub-Category</label>
                <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})}>
                  <option value="">None</option>
                  <option value="Creatine">Creatine</option>
                  <option value="Mass Gainer">Mass Gainer</option>
                  <option value="Whey Protein">Whey Protein</option>
                </select>
              </div>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <hr style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <div className="form-group"><label>Base Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>
              <div className="form-group"><label>Scarcity (If left)</label><input type="number" value={formData.scarcity} onChange={e => setFormData({...formData, scarcity: parseInt(e.target.value)})} /></div>
              <div className="form-group"><label>Discount %</label><input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} /></div>
              <div className="form-group"><label>Rating (1-5)</label><input type="number" step="0.1" max="5" value={formData.manualRating} onChange={e => setFormData({...formData, manualRating: parseFloat(e.target.value)})} /></div>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label>Show Scarcity Badge</label>
                <label className="toggle-switch"><input type="checkbox" checked={formData.showScarcity} onChange={e => setFormData({...formData, showScarcity: e.target.checked})} /><span className="toggle-slider"></span></label>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label>Best Seller</label>
                <label className="toggle-switch"><input type="checkbox" checked={formData.bestSeller} onChange={e => setFormData({...formData, bestSeller: e.target.checked})} /><span className="toggle-slider"></span></label>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label>Gluten Free</label>
                <label className="toggle-switch"><input type="checkbox" checked={formData.glutenFree} onChange={e => setFormData({...formData, glutenFree: e.target.checked})} /><span className="toggle-slider"></span></label>
              </div>
            </div>
          </div>
        )}

        {/* VARIANTS/SIZES TAB */}
        {activeTab === 'variants' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Define different weights/sizes and their specific pricing.</p>
              <button className="btn-outline" onClick={addSize}>+ Add Size</button>
            </div>
            
            {formData.sizes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>No sizes defined. Product will use base price.</div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Weight (e.g. 2 lbs)</th><th>Price (₹)</th><th>Old Price (₹)</th><th>In Stock</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {formData.sizes.map((s, idx) => (
                      <tr key={idx}>
                        <td><input type="text" value={s.weight} onChange={e => updateSize(idx, 'weight', e.target.value)} style={{ width: '100px', padding: '6px' }} /></td>
                        <td><input type="number" value={s.price} onChange={e => updateSize(idx, 'price', parseInt(e.target.value))} style={{ width: '100px', padding: '6px' }} /></td>
                        <td><input type="number" value={s.oldPrice} onChange={e => updateSize(idx, 'oldPrice', parseInt(e.target.value))} style={{ width: '100px', padding: '6px' }} /></td>
                        <td>
                          <label className="toggle-switch"><input type="checkbox" checked={s.inStock} onChange={e => updateSize(idx, 'inStock', e.target.checked)} /><span className="toggle-slider"></span></label>
                        </td>
                        <td><button onClick={() => removeSize(idx)} className="action-btn btn-delete">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FLAVORS TAB */}
        {activeTab === 'flavors' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Define available flavors and their specific tub image URLs.</p>
              <button className="btn-outline" onClick={addFlavor}>+ Add Flavor</button>
            </div>
            
            {formData.flavors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>No flavors defined.</div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Flavor Name</th><th>Image URL (or path)</th><th>In Stock</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {formData.flavors.map((f, idx) => (
                      <tr key={idx}>
                        <td><input type="text" value={f.name} onChange={e => updateFlavor(idx, 'name', e.target.value)} style={{ width: '150px', padding: '6px' }} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input type="text" value={f.image} onChange={e => updateFlavor(idx, 'image', e.target.value)} style={{ width: '300px', padding: '6px' }} placeholder="e.g. /images/hydra-whey.png" />
                            {f.image && <img src={f.image.startsWith('http') ? f.image : `/images/${f.image.replace(/^[/]?(images\/)?/, '')}`} alt="preview" style={{ height: '30px', width: '30px', objectFit: 'contain', background: '#fff', borderRadius: '4px' }} />}
                          </div>
                        </td>
                        <td>
                          <label className="toggle-switch"><input type="checkbox" checked={f.inStock} onChange={e => updateFlavor(idx, 'inStock', e.target.checked)} /><span className="toggle-slider"></span></label>
                        </td>
                        <td><button onClick={() => removeFlavor(idx)} className="action-btn btn-delete">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
