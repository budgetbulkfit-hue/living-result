'use client';

import { useState, useEffect, useRef } from 'react';

const INITIAL_FORM = {
  comboName: '',
  comboSlug: '',
  description: '',
  manualOverridePrice: 0,
  isPublished: true,
  products: [],          // Fixed items: { productId, quantity, customPrice }
  comboGroups: [],       // Custom selection groups
  images: [],
  flavors: [],
  sizes: []
};

const EMPTY_GROUP = () => ({
  groupKey: '',
  groupLabel: '',
  options: []
});

const EMPTY_OPTION = () => ({
  productId: '',
  productName: '',
  fixedWeight: '',
  customPrice: '',
  customImage: ''
});

function resolveAdminImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) {
    if (src.startsWith('http://res.cloudinary.com/')) return src.replace('http://', 'https://');
    return src;
  }
  const filename = src.replace(/^\/?(?:images\/)?/, '');
  return `/images/${filename}`.replace(/\.png$/i, '.webp');
}

export default function ComboEditor({ token, slugToEdit, onCancel, onSaved }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!!slugToEdit && slugToEdit !== 'new');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [allProducts, setAllProducts] = useState([]);

  // Fixed product selector state
  const [selProductId, setSelProductId] = useState('');
  const [selQty, setSelQty] = useState(1);
  const [selCustomPrice, setSelCustomPrice] = useState('');

  // Variant modal
  const [variantModalActive, setVariantModalActive] = useState(false);
  const [editingVariantIdx, setEditingVariantIdx] = useState(-1);
  const [vmWeight, setVmWeight] = useState('');
  const [vmPrice, setVmPrice] = useState('');
  const [vmOldPrice, setVmOldPrice] = useState('');
  const [vmFlavors, setVmFlavors] = useState('');
  const [vmStock, setVmStock] = useState(true);

  // Flavor modal
  const [flavorModalActive, setFlavorModalActive] = useState(false);
  const [editingFlavorIdx, setEditingFlavorIdx] = useState(-1);
  const [fmName, setFmName] = useState('');
  const [fmImageUrl, setFmImageUrl] = useState('');
  const [fmStock, setFmStock] = useState(true);

  const flavorFileRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend-production.up.railway.app/api';

  useEffect(() => {
    fetchAllProducts();
    if (slugToEdit && slugToEdit !== 'new') {
      fetchCombo(slugToEdit);
    } else {
      setFormData(INITIAL_FORM);
      setLoading(false);
    }
  }, [slugToEdit]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      if (data.success) {
        const nonCombo = data.data.filter(p => p.category !== 'combos');
        setAllProducts(nonCombo);
        if (nonCombo.length > 0) setSelProductId(nonCombo[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchCombo = async (slug) => {
    try {
      const res = await fetch(`${API}/combos/${slug}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const c = data.data;
        setFormData({
          ...INITIAL_FORM,
          _id: c._id,
          comboName: c.comboName || '',
          comboSlug: c.comboSlug || '',
          description: c.description || '',
          manualOverridePrice: c.manualOverridePrice || 0,
          isPublished: c.isPublished !== false,
          products: (c.products || []).map(p => ({
            productId: p.productId?._id || p.productId,
            productName: p.productId?.name || 'Unknown',
            quantity: p.quantity || 1,
            customPrice: p.customPrice || p.productId?.price || 0
          })),
          comboGroups: (c.comboGroups || []).map(g => ({
            groupKey: g.groupKey || '',
            groupLabel: g.groupLabel || '',
            options: (g.options || []).map(o => ({
              productId: o.productId?._id || o.productId || '',
              productName: o.productId?.name || o.productName || '',
              fixedWeight: o.fixedWeight || '',
              customPrice: o.customPrice || '',
              customImage: o.customImage || ''
            }))
          })),
          images: c.images || [],
          flavors: c.flavors || [],
          sizes: c.sizes || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch combo', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloudinaryUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success && data.imageUrl) return data.imageUrl;
      alert(data.message || 'Upload failed');
      return null;
    } catch (err) {
      console.error('Upload error', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await handleCloudinaryUpload(file);
    if (url) setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    e.target.value = '';
  };

  // Auto MRP calculation
  const calcAutoMRP = () => {
    const fixedTotal = formData.products.reduce((acc, p) => acc + ((p.customPrice || 0) * (p.quantity || 1)), 0);
    const groupsTotal = formData.comboGroups.reduce((acc, g) => {
      const first = g.options?.[0];
      return acc + (first ? (Number(first.customPrice) || 0) : 0);
    }, 0);
    return fixedTotal + groupsTotal;
  };

  // Fixed products actions
  const addFixedProduct = () => {
    if (!selProductId) return;
    const prod = allProducts.find(p => p._id === selProductId);
    if (!prod) return;
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: prod._id,
        productName: prod.name,
        quantity: selQty,
        customPrice: selCustomPrice !== '' ? Number(selCustomPrice) : (prod.price || prod.sizes?.[0]?.price || 0)
      }]
    }));
    setSelCustomPrice('');
  };

  const removeFixedProduct = (idx) => {
    setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }));
  };

  // Combo Groups actions
  const addComboGroup = () => {
    setFormData(prev => ({ ...prev, comboGroups: [...prev.comboGroups, EMPTY_GROUP()] }));
  };

  const removeComboGroup = (gIdx) => {
    setFormData(prev => ({ ...prev, comboGroups: prev.comboGroups.filter((_, i) => i !== gIdx) }));
  };

  const updateGroup = (gIdx, field, val) => {
    setFormData(prev => {
      const groups = [...prev.comboGroups];
      groups[gIdx] = { ...groups[gIdx], [field]: val };
      return { ...prev, comboGroups: groups };
    });
  };

  const addGroupOption = (gIdx) => {
    setFormData(prev => {
      const groups = [...prev.comboGroups];
      groups[gIdx] = { ...groups[gIdx], options: [...groups[gIdx].options, EMPTY_OPTION()] };
      return { ...prev, comboGroups: groups };
    });
  };

  const removeGroupOption = (gIdx, oIdx) => {
    setFormData(prev => {
      const groups = [...prev.comboGroups];
      groups[gIdx] = { ...groups[gIdx], options: groups[gIdx].options.filter((_, i) => i !== oIdx) };
      return { ...prev, comboGroups: groups };
    });
  };

  const updateGroupOption = (gIdx, oIdx, field, val) => {
    setFormData(prev => {
      const groups = [...prev.comboGroups];
      const options = [...groups[gIdx].options];
      options[oIdx] = { ...options[oIdx], [field]: val };
      // If productId changed, sync productName too
      if (field === 'productId') {
        const prod = allProducts.find(p => p._id === val);
        options[oIdx].productName = prod?.name || '';
        if (!options[oIdx].customPrice) {
          options[oIdx].customPrice = prod?.price || prod?.sizes?.[0]?.price || '';
        }
      }
      groups[gIdx] = { ...groups[gIdx], options };
      return { ...prev, comboGroups: groups };
    });
  };

  const uploadGroupOptionImage = async (gIdx, oIdx, file) => {
    if (!file) return;
    const url = await handleCloudinaryUpload(file);
    if (url) updateGroupOption(gIdx, oIdx, 'customImage', url);
  };

  // Variants modal
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
      setVmWeight(''); setVmPrice(''); setVmOldPrice(''); setVmFlavors(''); setVmStock(true);
    }
    setVariantModalActive(true);
  };

  const saveVariant = () => {
    const v = {
      weight: vmWeight,
      price: Number(vmPrice),
      oldPrice: Number(vmOldPrice) || null,
      allowedFlavors: vmFlavors.split(',').map(s => s.trim()).filter(Boolean),
      inStock: vmStock
    };
    const newSizes = [...formData.sizes];
    if (editingVariantIdx > -1) newSizes[editingVariantIdx] = v;
    else newSizes.push(v);
    newSizes.sort((a, b) => (a.price || 0) - (b.price || 0));
    setFormData(prev => ({ ...prev, sizes: newSizes }));
    setVariantModalActive(false);
  };

  // Flavor modal
  const openFlavorModal = (idx = -1) => {
    setEditingFlavorIdx(idx);
    if (idx > -1) {
      const f = formData.flavors[idx];
      setFmName(f.name || ''); setFmImageUrl(f.image || ''); setFmStock(f.inStock !== false);
    } else {
      setFmName(''); setFmImageUrl(''); setFmStock(true);
    }
    setFlavorModalActive(true);
  };

  const saveFlavor = async () => {
    let imgUrl = fmImageUrl;
    if (!imgUrl && flavorFileRef.current?.files[0]) {
      imgUrl = await handleCloudinaryUpload(flavorFileRef.current.files[0]);
    }
    if (!imgUrl) return alert('Please upload a flavor image or paste a URL');
    const flavorData = { name: fmName, image: imgUrl, inStock: fmStock };
    const newFlavors = [...formData.flavors];
    if (editingFlavorIdx > -1) newFlavors[editingFlavorIdx] = flavorData;
    else newFlavors.push(flavorData);
    setFormData(prev => ({ ...prev, flavors: newFlavors }));
    setFlavorModalActive(false);
  };

  const handleSave = async () => {
    if (!formData.comboName.trim()) return alert('Please enter a combo name');
    setSaving(true);
    try {
      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id ? `${API}/combos/${formData._id}` : `${API}/combos`;

      const payload = {
        comboName: formData.comboName,
        comboSlug: formData.comboSlug || formData.comboName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: formData.description,
        manualOverridePrice: Number(formData.manualOverridePrice) || 0,
        isPublished: formData.isPublished,
        images: formData.images,
        flavors: formData.flavors,
        sizes: formData.sizes,
        products: formData.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          customPrice: p.customPrice
        })),
        comboGroups: formData.comboGroups.map(g => ({
          groupKey: g.groupKey,
          groupLabel: g.groupLabel,
          options: g.options.map(o => ({
            productId: o.productId || null,
            productName: o.productName,
            fixedWeight: o.fixedWeight,
            customPrice: Number(o.customPrice) || 0,
            customImage: o.customImage
          }))
        }))
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
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const autoMRP = calcAutoMRP();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Combo Data...</div>;

  return (
    <div className="page-view active">
      <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formData._id ? 'Edit Combo Bundle' : 'Create Combo Bundle'}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={onCancel}>Cancel & Go Back</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#9b59b6', borderColor: '#9b59b6' }}>
            {saving ? 'Saving...' : '💾 Save Combo'}
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

        {/* ─── BASIC TAB ─── */}
        {activeTab === 'basic' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            {/* Basic Info */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Combo Name</label>
                <input
                  type="text"
                  value={formData.comboName}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({ ...formData, comboName: name, comboSlug: slug });
                  }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>URL Slug</label>
                <input type="text" value={formData.comboSlug} onChange={e => setFormData({ ...formData, comboSlug: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* Pricing & Visibility */}
            <div className="form-row" style={{ marginBottom: '20px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Manual Bundle Price (₹) <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Auto MRP: ₹{autoMRP.toLocaleString()}</span></label>
                <input
                  type="number"
                  value={formData.manualOverridePrice}
                  onChange={e => setFormData({ ...formData, manualOverridePrice: parseInt(e.target.value) || 0 })}
                  placeholder={`Calculated: ₹${autoMRP}`}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Publish Combo</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <hr style={{ borderTop: '1px solid var(--border)', margin: '25px 0' }} />

            {/* Fixed Products Section */}
            <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '16px' }}>📦 Fixed Bundle Items</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 3, margin: 0, minWidth: '200px' }}>
                <label>Select Product</label>
                <select value={selProductId} onChange={e => setSelProductId(e.target.value)}>
                  {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price || p.sizes?.[0]?.price})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '80px' }}>
                <label>Qty</label>
                <input type="number" min="1" value={selQty} onChange={e => setSelQty(parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '100px' }}>
                <label>Custom Price</label>
                <input type="number" value={selCustomPrice} onChange={e => setSelCustomPrice(e.target.value)} placeholder="Optional" />
              </div>
              <button className="btn-outline" onClick={addFixedProduct} style={{ height: '42px', whiteSpace: 'nowrap' }}>+ Add to Bundle</button>
            </div>

            {formData.products.length > 0 ? (
              <div className="table-responsive" style={{ marginBottom: '25px' }}>
                <table>
                  <thead><tr><th>Product</th><th>Qty</th><th>Price/Unit</th><th>Subtotal</th><th>Action</th></tr></thead>
                  <tbody>
                    {formData.products.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{item.productName}</td>
                        <td>x{item.quantity}</td>
                        <td>₹{item.customPrice}</td>
                        <td>₹{(item.customPrice * item.quantity).toLocaleString()}</td>
                        <td><button className="action-btn btn-delete" onClick={() => removeFixedProduct(idx)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px', marginBottom: '25px', fontSize: '13px' }}>
                No fixed items added yet.
              </div>
            )}

            <hr style={{ borderTop: '1px solid var(--border)', margin: '25px 0' }} />

            {/* Combo Groups (Customizable Stacks) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: '#9b59b6', fontSize: '16px' }}>🎛 Customizable Stacks (Combo Groups)</h3>
              <button className="btn-outline" onClick={addComboGroup} style={{ color: '#9b59b6', borderColor: '#9b59b6' }}>+ Add Group</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Each group lets the buyer choose one option (e.g., pick your protein flavor/weight).</p>

            {formData.comboGroups.length === 0 ? (
              <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '13px' }}>
                No combo groups added. Click "+ Add Group" to create a customizable selection.
              </div>
            ) : (
              formData.comboGroups.map((group, gIdx) => (
                <div key={gIdx} style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: '#9b59b6', fontSize: '14px' }}>Group #{gIdx + 1}</span>
                    <button className="action-btn btn-delete" onClick={() => removeComboGroup(gIdx)}>Remove Group</button>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Group Key (internal, no spaces)</label>
                      <input
                        type="text"
                        value={group.groupKey}
                        onChange={e => updateGroup(gIdx, 'groupKey', e.target.value.replace(/\s+/g, '_').toLowerCase())}
                        placeholder="e.g. protein_choice"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Group Label (shown to buyer)</label>
                      <input
                        type="text"
                        value={group.groupLabel}
                        onChange={e => updateGroup(gIdx, 'groupLabel', e.target.value)}
                        placeholder="e.g. Choose Your Protein"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selectable Options</span>
                    <button className="btn-outline" onClick={() => addGroupOption(gIdx)} style={{ fontSize: '11px', padding: '5px 10px' }}>+ Add Option</button>
                  </div>

                  {group.options.length === 0 ? (
                    <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '4px', fontSize: '12px' }}>
                      No options yet. Add at least one option for this group.
                    </div>
                  ) : (
                    group.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div className="form-group" style={{ flex: 2, margin: 0, minWidth: '150px' }}>
                            <label style={{ fontSize: '11px' }}>Product</label>
                            <select value={opt.productId} onChange={e => updateGroupOption(gIdx, oIdx, 'productId', e.target.value)}>
                              <option value="">-- Choose Product --</option>
                              {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '100px' }}>
                            <label style={{ fontSize: '11px' }}>Fixed Weight</label>
                            <input
                              type="text"
                              value={opt.fixedWeight}
                              onChange={e => updateGroupOption(gIdx, oIdx, 'fixedWeight', e.target.value)}
                              placeholder="e.g. 1 kg"
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '100px' }}>
                            <label style={{ fontSize: '11px' }}>Custom Price (₹)</label>
                            <input
                              type="number"
                              value={opt.customPrice}
                              onChange={e => updateGroupOption(gIdx, oIdx, 'customPrice', e.target.value)}
                              placeholder="Override"
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1, margin: 0, minWidth: '100px' }}>
                            <label style={{ fontSize: '11px' }}>Option Image</label>
                            {opt.customImage
                              ? <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                  <img src={resolveAdminImage(opt.customImage)} alt="opt" style={{ height: '30px', background: '#fff', borderRadius: '3px', padding: '2px' }} />
                                  <button className="btn-outline" style={{ fontSize: '10px', padding: '3px 6px', color: '#e74c3c', borderColor: '#e74c3c' }} onClick={() => updateGroupOption(gIdx, oIdx, 'customImage', '')}>✕</button>
                                </div>
                              : <input type="file" accept="image/*" style={{ padding: '4px', fontSize: '11px' }} onChange={e => uploadGroupOptionImage(gIdx, oIdx, e.target.files[0])} />
                            }
                          </div>
                          <button className="action-btn btn-delete" style={{ height: '38px', alignSelf: 'flex-end' }} onClick={() => removeGroupOption(gIdx, oIdx)}>✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── VARIANTS TAB ─── */}
        {activeTab === 'variants' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Define different sizes/weights for this combo.</p>
              <button className="btn-outline" onClick={() => openVariantModal(-1)}>+ Add Variant</button>
            </div>
            <div className="table-responsive">
              <table>
                <thead><tr><th>Weight</th><th>Price</th><th>Old Price</th><th>Flavors Allowed</th><th>In Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {formData.sizes.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No variants added yet.</td></tr>
                  ) : (
                    formData.sizes.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{s.weight}</td>
                        <td>₹{s.price}</td>
                        <td>{s.oldPrice ? `₹${s.oldPrice}` : '-'}</td>
                        <td>{s.allowedFlavors?.length > 0 ? s.allowedFlavors.join(', ') : 'All'}</td>
                        <td>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={s.inStock !== false} onChange={e => {
                              const newSizes = [...formData.sizes];
                              newSizes[idx].inStock = e.target.checked;
                              setFormData({ ...formData, sizes: newSizes });
                            }} />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => openVariantModal(idx)}>Edit</button>
                          <button className="action-btn btn-delete" onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }))}>✕</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── IMAGES TAB ─── */}
        {activeTab === 'images' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '6px', border: '1px dashed var(--border)', marginBottom: '20px' }}>
              <label style={{ color: 'var(--accent)' }}>Upload Banner / Gallery Image</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <input type="file" accept="image/*" onChange={uploadGalleryImage} style={{ flex: 2, padding: '8px' }} />
                <button type="button" className="btn-outline" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Add'}
                </button>
              </div>
            </div>
            <div className="img-grid">
              {formData.images.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No images uploaded yet.</p>}
              {formData.images.map((img, idx) => (
                <div key={idx} className="img-card">
                  <button className="img-del" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}>✕</button>
                  <img src={resolveAdminImage(img)} alt="Gallery" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FLAVORS TAB ─── */}
        {activeTab === 'flavors' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Define flavors for this combo.</p>
              <button className="btn-outline" onClick={() => openFlavorModal(-1)}>+ Add Flavor</button>
            </div>
            <div className="table-responsive">
              <table>
                <thead><tr><th>Flavor Name</th><th>Image</th><th>In Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {formData.flavors.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No flavors added yet.</td></tr>
                  ) : (
                    formData.flavors.map((f, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{f.name}</td>
                        <td><img src={resolveAdminImage(f.image)} alt={f.name} style={{ height: '30px', background: '#fff', borderRadius: '4px', padding: '2px' }} /></td>
                        <td>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={f.inStock !== false} onChange={e => {
                              const newFlavors = [...formData.flavors];
                              newFlavors[idx].inStock = e.target.checked;
                              setFormData({ ...formData, flavors: newFlavors });
                            }} />
                            <span className="toggle-slider"></span>
                          </label>
                        </td>
                        <td>
                          <button className="action-btn btn-edit" onClick={() => openFlavorModal(idx)}>Edit</button>
                          <button className="action-btn btn-delete" onClick={() => setFormData(prev => ({ ...prev, flavors: prev.flavors.filter((_, i) => i !== idx) }))}>✕</button>
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

      {/* ─── VARIANT MODAL ─── */}
      <div className={`modal-overlay ${variantModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', padding: '25px' }}>
          <button className="modal-close" onClick={() => setVariantModalActive(false)}>&times;</button>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent)' }}>{editingVariantIdx > -1 ? 'Edit Variant' : 'Add Variant'}</h3>
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
            <label>Allowed Flavors (comma separated, blank = all)</label>
            <input type="text" value={vmFlavors} onChange={e => setVmFlavors(e.target.value)} placeholder="Chocolate, Vanilla" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="toggle-switch"><input type="checkbox" checked={vmStock} onChange={e => setVmStock(e.target.checked)} /><span className="toggle-slider"></span></label>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>In Stock</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveVariant}>Save Variant</button>
        </div>
      </div>

      {/* ─── FLAVOR MODAL ─── */}
      <div className={`modal-overlay ${flavorModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '400px', padding: '25px' }}>
          <button className="modal-close" onClick={() => setFlavorModalActive(false)}>&times;</button>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent)' }}>{editingFlavorIdx > -1 ? 'Edit Flavor' : 'Add Flavor'}</h3>
          <div className="form-group">
            <label>Flavor Name</label>
            <input type="text" value={fmName} onChange={e => setFmName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Image Upload</label>
            <input type="file" ref={flavorFileRef} accept="image/*" style={{ padding: '8px' }} />
            <div style={{ textAlign: 'center', margin: '10px 0', color: 'var(--text-muted)' }}>OR</div>
            <label>Image URL</label>
            <input type="text" value={fmImageUrl} onChange={e => setFmImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="toggle-switch"><input type="checkbox" checked={fmStock} onChange={e => setFmStock(e.target.checked)} /><span className="toggle-slider"></span></label>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>In Stock</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={saveFlavor} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Flavor'}
          </button>
        </div>
      </div>
    </div>
  );
}
