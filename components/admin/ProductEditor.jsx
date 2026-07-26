'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '@/lib/api';

const INITIAL_FORM = {
  id: '',
  name: '',
  slug: '',
  category: 'common',
  subCategory: '',
  description: '',
  ingredients: '',
  nutritionalFacts: [],
  discount: '',
  stockLeft: 0,
  scarcity: 0,
  showScarcity: true,
  bestSeller: false,
  glutenFree: false,
  isBulking: false,
  isMuscle: false,
  isFatLoss: false,
  isStack: false,
  rating: 5,
  numReviews: 0,
  sizes: [],
  flavors: [],
  images: []
};

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

export default function ProductEditor({ token, slugToEdit, onCancel, onSaved }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!!slugToEdit && slugToEdit !== 'new');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal states for adding/editing variant and flavor items
  const [variantModalActive, setVariantModalActive] = useState(false);
  const [editingVariantIdx, setEditingVariantIdx] = useState(-1);
  const [vmWeight, setVmWeight] = useState('');
  const [vmPrice, setVmPrice] = useState('');
  const [vmOldPrice, setVmOldPrice] = useState('');
  const [vmFlavors, setVmFlavors] = useState('');
  const [vmStock, setVmStock] = useState(true);

  const [flavorModalActive, setFlavorModalActive] = useState(false);
  const [editingFlavorIdx, setEditingFlavorIdx] = useState(-1);
  const [fmName, setFmName] = useState('');
  const [fmImageUrl, setFmImageUrl] = useState('');
  const [fmStock, setFmStock] = useState(true);
  const flavorFileRef = useRef(null);

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
      const API = API_BASE;
      const res = await fetch(`${API}/products/${slug}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const prod = data.data;

        // Parse legacy description metadata
        if (prod.description && prod.description.includes('<!--[GF]-->')) {
          prod.glutenFree = true;
          prod.description = prod.description.replace(/ ?<!--\[GF\]-->/g, '');
        }
        if (prod.description && prod.description.includes('<!--[IMAGES:')) {
          const match = prod.description.match(/ ?<!--\[IMAGES:(.*?)\]-->/);
          if (match && match[1]) {
            try { prod.images = JSON.parse(match[1]); } catch (e) {}
            prod.description = prod.description.replace(match[0], '');
          }
        }
        if (prod.description && prod.description.includes('<!--[SUBCAT:')) {
          const match = prod.description.match(/ ?<!--\[SUBCAT:(.*?)\]-->/);
          if (match && match[1]) {
            prod.subCategory = match[1];
            prod.description = prod.description.replace(match[0], '');
          }
        }

        setFormData({
          ...INITIAL_FORM,
          ...prod,
          _id: prod._id
        });
      }
    } catch (err) {
      console.error('Failed to fetch product details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const API = API_BASE;
      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id ? `${API}/products/${formData._id}` : `${API}/products`;

      // Derive base prices
      let basePrice = 0;
      let baseOldPrice = null;
      const sortedSizes = [...formData.sizes].sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sortedSizes.length > 0) {
        basePrice = sortedSizes[0].price || 0;
        baseOldPrice = sortedSizes[0].oldPrice || null;
      }

      // Compile legacy description metadata
      let desc = formData.description;
      if (formData.glutenFree) desc += ' <!--[GF]-->';
      if (formData.images && formData.images.length > 0) desc += ` <!--[IMAGES:${JSON.stringify(formData.images)}]-->`;
      if (formData.category === 'common' && formData.subCategory) desc += ` <!--[SUBCAT:${formData.subCategory}]-->`;

      const payload = {
        id: Number(formData.id),
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        price: basePrice,
        oldPrice: baseOldPrice,
        discount: Number(formData.discount) || 0,
        category: formData.category,
        subCategory: formData.category === 'common' ? formData.subCategory : '',
        rating: Number(formData.rating),
        numReviews: Number(formData.numReviews),
        stockLeft: Number(formData.stockLeft),
        showScarcity: formData.showScarcity,
        bestSeller: formData.bestSeller,
        glutenFree: formData.glutenFree,
        isBulking: formData.isBulking,
        isMuscle: formData.isMuscle,
        isFatLoss: formData.isFatLoss,
        isStack: formData.isStack,
        description: desc,
        ingredients: formData.ingredients,
        nutritionalFacts: formData.nutritionalFacts,
        sizes: sortedSizes,
        flavors: formData.flavors
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        alert(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleCloudinaryUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    const API = API_BASE;
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      } else {
        alert(data.message || 'Upload failed');
        return null;
      }
    } catch (err) {
      console.error('Upload network error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Gallery image upload
  const uploadGalleryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await handleCloudinaryUpload(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
    e.target.value = ''; // Reset input
  };

  const removeGalleryImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Star Rating helper
  const setRating = (val) => {
    setFormData(prev => ({ ...prev, rating: val }));
  };

  // Variants modal actions
  const openVariantModal = (idx = -1) => {
    setEditingVariantIdx(idx);
    if (idx > -1) {
      const v = formData.sizes[idx];
      setVmWeight(v.weight || '');
      setVmPrice(v.price || '');
      setVmOldPrice(v.oldPrice || '');
      setVmFlavors(v.allowedFlavors ? v.allowedFlavors.join(', ') : '');
      setVmStock(v.inStock !== false);
    } else {
      setVmWeight('');
      setVmPrice('');
      setVmOldPrice('');
      setVmFlavors('');
      setVmStock(true);
    }
    setVariantModalActive(true);
  };

  const saveVariant = () => {
    const f = vmFlavors.split(',').map(s => s.trim()).filter(Boolean);
    const variantData = {
      weight: vmWeight,
      price: Number(vmPrice),
      oldPrice: Number(vmOldPrice) || null,
      allowedFlavors: f,
      inStock: vmStock
    };

    const newSizes = [...formData.sizes];
    if (editingVariantIdx > -1) {
      newSizes[editingVariantIdx] = variantData;
    } else {
      newSizes.push(variantData);
    }
    newSizes.sort((a, b) => (a.price || 0) - (b.price || 0));

    setFormData(prev => ({ ...prev, sizes: newSizes }));
    setVariantModalActive(false);
  };

  const removeVariant = (idx) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== idx)
    }));
  };

  // Flavors modal actions
  const openFlavorModal = (idx = -1) => {
    setEditingFlavorIdx(idx);
    if (idx > -1) {
      const f = formData.flavors[idx];
      setFmName(f.name || '');
      setFmImageUrl(f.image || '');
      setFmStock(f.inStock !== false);
    } else {
      setFmName('');
      setFmImageUrl('');
      setFmStock(true);
    }
    setFlavorModalActive(true);
  };

  const saveFlavor = async () => {
    let imgUrl = fmImageUrl;
    if (!imgUrl && flavorFileRef.current?.files[0]) {
      imgUrl = await handleCloudinaryUpload(flavorFileRef.current.files[0]);
    }
    if (!imgUrl) {
      return alert('Please upload a flavor image or paste a URL');
    }

    const flavorData = {
      name: fmName,
      image: imgUrl,
      inStock: fmStock
    };

    const newFlavors = [...formData.flavors];
    if (editingFlavorIdx > -1) {
      newFlavors[editingFlavorIdx] = flavorData;
    } else {
      newFlavors.push(flavorData);
    }

    setFormData(prev => ({ ...prev, flavors: newFlavors }));
    setFlavorModalActive(false);
  };

  const removeFlavor = (idx) => {
    setFormData(prev => ({
      ...prev,
      flavors: prev.flavors.filter((_, i) => i !== idx)
    }));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Product Data...</div>;

  return (
    <div className="page-view active">
      <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formData._id ? 'Edit Product' : 'Add New Product'}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={onCancel}>Cancel & Go Back</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#2ecc71', borderColor: '#2ecc71' }}>
            {saving ? 'Saving...' : 'Save Product Changes'}
          </button>
        </div>
      </div>

      <div className="panel-card">
        {/* Tabs */}
        <div className="editor-tabs" style={{ marginBottom: '25px', borderBottom: '1px solid var(--border)' }}>
          {['basic', 'variants', 'images', 'flavors'].map(t => (
            <div 
              key={t}
              className={`editor-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'variants' ? 'Variants & Sizes' : t.toUpperCase()}
            </div>
          ))}
        </div>

        {/* 1. BASIC INFO TAB */}
        {activeTab === 'basic' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Cart ID (Num)</label>
                <input type="number" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({ ...formData, name, slug });
                  }} 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>URL Slug</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Discount (%)</label>
                <input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} placeholder="e.g. 15" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="common">Everyday Essentials</option>
                  <option value="unique">Unique Collection</option>
                  <option value="combos">Combos</option>
                </select>
              </div>
              {formData.category === 'common' && (
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Sub-Category</label>
                  <select value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })}>
                    <option value="">None / Other</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Mass Gainer">Mass Gainer</option>
                    <option value="Whey Protein">Whey Protein</option>
                    <option value="Fat Burner">🔥 Inferno Shredders (Fat Burner)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Manual Rating</label>
                <div style={{ fontSize: '24px', cursor: 'pointer', color: '#f5a623', display: 'flex', gap: '5px', userSelect: 'none' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} onClick={() => setRating(star)}>
                      {star <= Math.round(formData.rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Manual Review Count</label>
                <input type="number" value={formData.numReviews} onChange={e => setFormData({ ...formData, numReviews: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '20px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Stock</label>
                <input type="number" value={formData.stockLeft} onChange={e => setFormData({ ...formData, stockLeft: parseInt(e.target.value) || 0 })} style={{ width: '100px' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Show Scarcity</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.showScarcity} onChange={e => setFormData({ ...formData, showScarcity: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Best Seller</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.bestSeller} onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Gluten Free</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.glutenFree} onChange={e => setFormData({ ...formData, glutenFree: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Quick Tags Panel */}
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ marginBottom: '10px', display: 'block' }}>Quick Tags (Manual)</label>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.isBulking} onChange={e => setFormData({ ...formData, isBulking: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '12px' }}>💪 Bulking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.isMuscle} onChange={e => setFormData({ ...formData, isMuscle: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '12px' }}>⚡ Lean Muscle</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.isFatLoss} onChange={e => setFormData({ ...formData, isFatLoss: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '12px' }}>🔥 Fat Loss</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={formData.isStack} onChange={e => setFormData({ ...formData, isStack: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '12px' }}>✨ Premium Stack</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ingredients</label>
              <textarea rows="2" value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Nutritional Facts (One per line)</label>
              <textarea 
                rows="3" 
                value={formData.nutritionalFacts.join('\n')} 
                onChange={e => setFormData({ ...formData, nutritionalFacts: e.target.value.split('\n').filter(Boolean) })} 
                placeholder="e.g. 24g Protein&#10;5g BCAA" 
              />
            </div>
          </div>
        )}

        {/* 2. VARIANTS/SIZES TAB */}
        {activeTab === 'variants' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Define different sizes/weights for this product.</p>
              <button className="btn-outline" onClick={() => openVariantModal(-1)}>+ Add Variant</button>
            </div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Weight</th>
                    <th>Price</th>
                    <th>Old Price</th>
                    <th>Flavors Allowed</th>
                    <th>In Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.sizes.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No variants added yet.
                      </td>
                    </tr>
                  ) : (
                    formData.sizes.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{s.weight}</td>
                        <td>₹{s.price}</td>
                        <td>{s.oldPrice ? `₹${s.oldPrice}` : '-'}</td>
                        <td>{s.allowedFlavors && s.allowedFlavors.length > 0 ? s.allowedFlavors.join(', ') : 'All'}</td>
                        <td>
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={s.inStock !== false} 
                              onChange={e => {
                                const newSizes = [...formData.sizes];
                                newSizes[idx].inStock = e.target.checked;
                                setFormData({ ...formData, sizes: newSizes });
                              }}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => openVariantModal(idx)}>Edit</button>
                          <button className="action-btn btn-delete" onClick={() => removeVariant(idx)}>✕</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. IMAGES TAB */}
        {activeTab === 'images' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '6px', border: '1px dashed var(--border)' }}>
              <label style={{ color: 'var(--accent)' }}>Upload Additional Gallery Image</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <input type="file" accept="image/*" onChange={uploadGalleryImage} style={{ flex: 2, padding: '8px' }} />
                <button type="button" className="btn-outline" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Add'}
                </button>
              </div>
            </div>
            <div className="img-grid">
              {formData.images.map((img, idx) => (
                <div key={idx} className="img-card">
                  <button className="img-del" onClick={() => removeGalleryImage(idx)}>✕</button>
                  <img src={resolveAdminImage(img)} alt="Gallery" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FLAVORS TAB */}
        {activeTab === 'flavors' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Define flavors and their specific tub images.</p>
              <button className="btn-outline" onClick={() => openFlavorModal(-1)}>+ Add Flavor</button>
            </div>
            
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Flavor Name</th>
                    <th>Image</th>
                    <th>In Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.flavors.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No flavors added yet.
                      </td>
                    </tr>
                  ) : (
                    formData.flavors.map((f, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{f.name}</td>
                        <td>
                          <img src={resolveAdminImage(f.image)} alt={f.name} style={{ height: '30px', background: '#fff', borderRadius: '4px', padding: '2px' }} />
                        </td>
                        <td>
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={f.inStock !== false} 
                              onChange={e => {
                                const newFlavors = [...formData.flavors];
                                newFlavors[idx].inStock = e.target.checked;
                                setFormData({ ...formData, flavors: newFlavors });
                              }}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => openFlavorModal(idx)}>Edit</button>
                          <button className="action-btn btn-delete" onClick={() => removeFlavor(idx)}>✕</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── ADD/EDIT VARIANT MODAL ─── */}
      <div className={`modal-overlay ${variantModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', padding: '25px' }}>
          <button className="modal-close" onClick={() => setVariantModalActive(false)}>&times;</button>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent)' }}>
            {editingVariantIdx > -1 ? 'Edit Variant' : 'Add Variant'}
          </h3>
          <div className="form-group">
            <label>Weight/Size (e.g. 1 kg)</label>
            <input type="text" value={vmWeight} onChange={e => setVmWeight(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price (₹)</label>
              <input type="number" value={vmPrice} onChange={e => setVmPrice(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Old Price</label>
              <input type="number" value={vmOldPrice} onChange={e => setVmOldPrice(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Allowed Flavors (Comma separated, or blank for all)</label>
            <input type="text" value={vmFlavors} onChange={e => setVmFlavors(e.target.value)} placeholder="e.g. Chocolate, Vanilla" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="toggle-switch">
              <input type="checkbox" checked={vmStock} onChange={e => setVmStock(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>In Stock</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveVariant}>
            Save Variant
          </button>
        </div>
      </div>

      {/* ─── ADD/EDIT FLAVOR MODAL ─── */}
      <div className={`modal-overlay ${flavorModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', padding: '25px' }}>
          <button className="modal-close" onClick={() => setFlavorModalActive(false)}>&times;</button>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent)' }}>
            {editingFlavorIdx > -1 ? 'Edit Flavor' : 'Add Flavor'}
          </h3>
          <div className="form-group">
            <label>Flavor Name</label>
            <input type="text" value={fmName} onChange={e => setFmName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Image Upload</label>
            <input type="file" ref={flavorFileRef} accept="image/*" style={{ padding: '8px' }} />
            <div style={{ textHtml: 'center', margin: '10px 0', color: 'var(--text-muted)', textAlign: 'center' }}>OR</div>
            <label>Image URL</label>
            <input type="text" value={fmImageUrl} onChange={e => setFmImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="toggle-switch">
              <input type="checkbox" checked={fmStock} onChange={e => setFmStock(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>In Stock</span>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }} 
            onClick={saveFlavor}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Save Flavor'}
          </button>
        </div>
      </div>
    </div>
  );
}
