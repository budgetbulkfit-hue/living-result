'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/lib/authStore';
import useCart from '@/lib/cartStore';
import {
  getUserOrders,
  getWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateUserProfile,
  updateAiProfile,
  getRewards,
  removeFromWishlist,
} from '@/lib/api';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#f39c12', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: '#27ae60', icon: '✅' },
  packed:    { label: 'Packed',    color: '#2980b9', icon: '📦' },
  shipped:   { label: 'Shipped',   color: '#8e44ad', icon: '🚚' },
  delivered: { label: 'Delivered', color: '#27ae60', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: '#e74c3c', icon: '❌' },
};

const TABS = [
  { id: 'overview',   label: 'Overview',    icon: '◉' },
  { id: 'orders',     label: 'Orders',      icon: '📦' },
  { id: 'wishlist',   label: 'Wishlist',    icon: '❤️' },
  { id: 'addresses',  label: 'Addresses',   icon: '📍' },
  { id: 'ai-profile', label: 'AI Profile',  icon: '🤖' },
  { id: 'rewards',    label: 'Rewards',     icon: '🏆' },
  { id: 'settings',   label: 'Settings',    icon: '⚙️' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value" style={accent ? { color: 'var(--accent)' } : {}}>{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-id">#{order.orderId}</div>
          <div className="order-date">{date}</div>
        </div>
        <span className="order-status-badge" style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <div className="order-products">
        {order.products?.map((p, i) => (
          <div key={i} className="order-product-row">
            <span>{p.name} {p.weight ? `(${p.weight})` : ''}</span>
            <span>×{p.quantity}</span>
          </div>
        ))}
      </div>
      <div className="order-card-footer">
        <span className="order-total">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

function AddressCard({ address, onDelete, onSetDefault, onEdit }) {
  const labelIcons = { Home: '🏠', Office: '🏢', Hostel: '🏫', Parents: '👨‍👩‍👧' };
  return (
    <div className={`address-card ${address.isDefault ? 'default' : ''}`}>
      {address.isDefault && <span className="address-default-badge">✓ Default</span>}
      <div className="address-label">{labelIcons[address.label] || '📍'} {address.label}</div>
      <div className="address-name">{address.name} · {address.phone}</div>
      <div className="address-line">{address.house}, {address.street && `${address.street}, `}{address.city}, {address.state} — {address.pin}</div>
      {address.landmark && <div className="address-landmark">Near: {address.landmark}</div>}
      <div className="address-actions">
        {!address.isDefault && (
          <button className="addr-btn addr-btn-default" onClick={() => onSetDefault(address._id)}>Set Default</button>
        )}
        <button className="addr-btn addr-btn-edit" onClick={() => onEdit(address)}>Edit</button>
        <button className="addr-btn addr-btn-delete" onClick={() => onDelete(address._id)}>Delete</button>
      </div>
    </div>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { label: 'Home', name: '', phone: '', house: '', street: '', city: '', state: '', pin: '', landmark: '', isDefault: false });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };
  const inputCls = 'addr-form-input';
  return (
    <form className="addr-form" onSubmit={handleSubmit}>
      <div className="addr-form-grid">
        <div className="addr-form-field">
          <label>Label</label>
          <select className={inputCls} value={form.label} onChange={(e) => set('label', e.target.value)}>
            {['Home','Office','Hostel','Parents','Other'].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="addr-form-field">
          <label>Full Name *</label>
          <input className={inputCls} required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Receiver name" />
        </div>
        <div className="addr-form-field">
          <label>Phone *</label>
          <input className={inputCls} required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="10-digit number" />
        </div>
        <div className="addr-form-field addr-form-field--full">
          <label>House / Flat / Building *</label>
          <input className={inputCls} required value={form.house} onChange={(e) => set('house', e.target.value)} placeholder="Flat no., building name" />
        </div>
        <div className="addr-form-field addr-form-field--full">
          <label>Street / Area</label>
          <input className={inputCls} value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="Street, locality" />
        </div>
        <div className="addr-form-field">
          <label>City *</label>
          <input className={inputCls} required value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="addr-form-field">
          <label>State *</label>
          <input className={inputCls} required value={form.state} onChange={(e) => set('state', e.target.value)} />
        </div>
        <div className="addr-form-field">
          <label>PIN Code *</label>
          <input className={inputCls} required value={form.pin} onChange={(e) => set('pin', e.target.value.replace(/\D/,'').slice(0,6))} placeholder="6-digit PIN" />
        </div>
        <div className="addr-form-field">
          <label>Landmark</label>
          <input className={inputCls} value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="Near..." />
        </div>
        <div className="addr-form-field addr-form-field--full">
          <label className="addr-checkbox-label">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
            Set as default address
          </label>
        </div>
      </div>
      <div className="addr-form-actions">
        <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Save Address</button>
        <button type="button" className="addr-btn addr-btn-edit" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const removeFromWishlistLocal = useAuthStore((s) => s.removeFromWishlistLocal);
  const addItem = useCart((s) => s.addItem);

  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'overview');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [aiMsg, setAiMsg] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', notifications: {} });
  const [aiForm, setAiForm] = useState({});

  // Auth guard — redirect to home if not logged in
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push('/');
    }
  }, [isLoggedIn, user, router]);

  // Sync profile form with user
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', notifications: user.notifications || {} });
      setAiForm(user.aiProfile || {});
    }
  }, [user]);

  // Load data when tab changes
  const loadTab = useCallback(async (tab) => {
    if (tab === 'orders' && orders.length === 0) {
      setLoading((l) => ({ ...l, orders: true }));
      try { const d = await getUserOrders(); if (d.success) setOrders(d.data); } finally { setLoading((l) => ({ ...l, orders: false })); }
    }
    if (tab === 'wishlist' && wishlist.length === 0) {
      setLoading((l) => ({ ...l, wishlist: true }));
      try { const d = await getWishlist(); if (d.success) setWishlist(d.data); } finally { setLoading((l) => ({ ...l, wishlist: false })); }
    }
    if (tab === 'addresses' && addresses.length === 0) {
      setLoading((l) => ({ ...l, addresses: true }));
      try { const d = await getAddresses(); if (d.success) setAddresses(d.data); } finally { setLoading((l) => ({ ...l, addresses: false })); }
    }
    if (tab === 'rewards' && !rewards) {
      try { const d = await getRewards(); if (d.success) setRewards(d); } catch (_) {}
    }
  }, [orders.length, wishlist.length, addresses.length, rewards]);

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  const switchTab = (tab) => { setActiveTab(tab); router.push(`/account?tab=${tab}`, { scroll: false }); };

  if (!isLoggedIn || !user) return null;

  // ── Tab: Overview ───────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      <div className="account-welcome">
        <div className="account-welcome-avatar">{user.name?.[0]?.toUpperCase()}</div>
        <div>
          <h2 className="account-welcome-name">Hi, {user.name} 👋</h2>
          <p className="account-welcome-sub">{user.email || user.phone} · Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon="📦" label="Total Orders" value={user.totalOrders || 0} />
        <StatCard icon="❤️" label="Wishlist" value={user.wishlist?.length || 0} />
        <StatCard icon="🏆" label="Reward Points" value={user.rewardPoints || 0} accent />
        <StatCard icon="💰" label="Total Spent" value={user.totalSpent ? `₹${user.totalSpent.toLocaleString('en-IN')}` : '₹0'} />
      </div>
      <div className="account-quick-actions">
        <h3 className="account-section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[['orders','📦','My Orders','View your order history'],['wishlist','❤️','Wishlist','Products you love'],['addresses','📍','Addresses','Manage saved addresses'],['ai-profile','🤖','AI Profile','Your fitness profile']].map(([tab,icon,label,desc])=>(
            <button key={tab} className="quick-action-card" onClick={()=>switchTab(tab)}>
              <span className="quick-action-icon">{icon}</span>
              <span className="quick-action-label">{label}</span>
              <span className="quick-action-desc">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab: Orders ─────────────────────────────────────────────────────────────
  const renderOrders = () => (
    <div>
      <h2 className="account-section-title">My Orders</h2>
      {loading.orders ? (
        <div className="account-loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="account-empty">
          <span style={{ fontSize: '3rem' }}>📦</span>
          <p>No orders yet.</p>
          <Link href="/#products" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px' }}>Shop Now →</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => <OrderCard key={o._id} order={o} />)}
        </div>
      )}
    </div>
  );

  // ── Tab: Wishlist ───────────────────────────────────────────────────────────
  const renderWishlist = () => (
    <div>
      <h2 className="account-section-title">My Wishlist</h2>
      {loading.wishlist ? (
        <div className="account-loading">Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="account-empty">
          <span style={{ fontSize: '3rem' }}>❤️</span>
          <p>Your wishlist is empty.</p>
          <Link href="/#products" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px' }}>Explore Products →</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => {
            if (!product?._id) return null;
            const price = product.sizes?.[0]?.price || product.price || 0;
            const img = product.flavors?.[0]?.image || `/images/${product.slug}.webp`;
            return (
              <div key={product._id} className="wishlist-product-card">
                <Link href={`/product/${product.slug}`} className="wishlist-product-img-wrap">
                  <img src={img} alt={product.name} onError={(e) => { e.target.src = `/images/${product.slug}.webp`; }} />
                </Link>
                <div className="wishlist-product-info">
                  <Link href={`/product/${product.slug}`} className="wishlist-product-name">{product.name}</Link>
                  <div className="wishlist-product-price">₹{price.toLocaleString('en-IN')}</div>
                </div>
                <div className="wishlist-product-actions">
                  <button
                    className="btn-primary wishlist-add-cart-btn"
                    onClick={() => {
                      addItem({ key: `${product._id}-0-0`, productId: product._id, name: product.name, flavorName: product.flavors?.[0]?.name || 'Default', weight: product.sizes?.[0]?.weight || '', price, image: img, qty: 1 });
                    }}
                  >Add to Cart</button>
                  <button
                    className="wishlist-remove-btn"
                    onClick={async () => {
                      await removeFromWishlist(product._id);
                      removeFromWishlistLocal(product._id);
                      setWishlist((w) => w.filter((p) => p._id !== product._id));
                    }}
                  >✕ Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Tab: Addresses ──────────────────────────────────────────────────────────
  const handleSaveAddress = async (form) => {
    if (editingAddress) {
      const d = await updateAddress(editingAddress._id, form);
      if (d.success) { setAddresses(d.data); setEditingAddress(null); setShowAddressForm(false); }
    } else {
      const d = await addAddress(form);
      if (d.success) { setAddresses(d.data); setShowAddressForm(false); }
    }
  };

  const renderAddresses = () => (
    <div>
      <div className="account-section-header">
        <h2 className="account-section-title">Saved Addresses</h2>
        <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>+ Add Address</button>
      </div>
      {loading.addresses ? (
        <div className="account-loading">Loading addresses...</div>
      ) : (
        <>
          {(showAddressForm || editingAddress) && (
            <div className="addr-form-wrap">
              <h3 className="account-subsection-title">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
              <AddressForm
                initial={editingAddress}
                onSave={handleSaveAddress}
                onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
              />
            </div>
          )}
          {addresses.length === 0 && !showAddressForm ? (
            <div className="account-empty"><span style={{ fontSize: '3rem' }}>📍</span><p>No saved addresses yet.</p></div>
          ) : (
            <div className="addresses-grid">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  onDelete={async (id) => { const d = await deleteAddress(id); if (d.success) setAddresses(d.data); }}
                  onSetDefault={async (id) => { const d = await setDefaultAddress(id); if (d.success) setAddresses(d.data); }}
                  onEdit={(addr) => { setEditingAddress(addr); setShowAddressForm(false); }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Tab: AI Profile ─────────────────────────────────────────────────────────
  const renderAiProfile = () => (
    <div>
      <h2 className="account-section-title">🤖 AI Fitness Profile</h2>
      <p className="account-section-subtitle">Complete your profile for personalized supplement recommendations. Your AI-powered stack is coming soon.</p>
      <div className="ai-coming-soon-bar">✨ AI-powered personalized recommendations coming soon — Your profile is being saved for Day 1.</div>
      <form className="ai-profile-form" onSubmit={async (e) => {
        e.preventDefault();
        setAiMsg('');
        const d = await updateAiProfile(aiForm);
        if (d.success) { setUser(d.data); setAiMsg('✅ AI profile saved successfully!'); }
        else setAiMsg('❌ Failed to save. Please try again.');
        setTimeout(() => setAiMsg(''), 3000);
      }}>
        <div className="ai-form-grid">
          {[['height','Height (cm)','number',100,250],['weight','Weight (kg)','number',30,300],['age','Age','number',13,80],['budget','Monthly Budget (₹)','number',0,100000]].map(([k,l,t,mn,mx])=>(
            <div className="ai-field" key={k}>
              <label>{l}</label>
              <input type={t} min={mn} max={mx} className="addr-form-input" value={aiForm[k]||''} onChange={(e)=>setAiForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          {[['gender','Gender',[['','Select...'],['male','Male'],['female','Female'],['other','Other']]],
            ['goal','Fitness Goal',[['','Select...'],['muscle_gain','Muscle Gain'],['fat_loss','Fat Loss'],['endurance','Endurance'],['general','General Fitness'],['maintenance','Maintenance']]],
            ['experience','Experience Level',[['','Select...'],['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']]],
            ['activityLevel','Activity Level',[['','Select...'],['sedentary','Sedentary'],['light','Lightly Active'],['moderate','Moderately Active'],['very_active','Very Active'],['athlete','Athlete']]],
            ['diet','Diet Type',[['','Select...'],['veg','Vegetarian'],['non_veg','Non-Vegetarian'],['vegan','Vegan'],['keto','Keto'],['other','Other']]],
          ].map(([k,l,opts])=>(
            <div className="ai-field" key={k}>
              <label>{l}</label>
              <select className="addr-form-input" value={aiForm[k]||''} onChange={(e)=>setAiForm(f=>({...f,[k]:e.target.value}))}>
                {opts.map(([v,t])=><option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          ))}
          <div className="ai-field ai-field--full">
            <label>Medical Conditions (comma-separated)</label>
            <input className="addr-form-input" value={(aiForm.medicalConditions||[]).join(', ')} onChange={(e)=>setAiForm(f=>({...f,medicalConditions:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="e.g. diabetes, hypertension" />
          </div>
          <div className="ai-field ai-field--full">
            <label>Allergies (comma-separated)</label>
            <input className="addr-form-input" value={(aiForm.allergies||[]).join(', ')} onChange={(e)=>setAiForm(f=>({...f,allergies:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="e.g. lactose, gluten" />
          </div>
        </div>
        {aiMsg && <p style={{ marginTop: '12px', color: aiMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)', fontSize: '14px' }}>{aiMsg}</p>}
        <button type="submit" className="btn-primary" style={{ marginTop: '20px', padding: '12px 28px' }}>Save AI Profile</button>
      </form>
    </div>
  );

  // ── Tab: Rewards ────────────────────────────────────────────────────────────
  const renderRewards = () => (
    <div>
      <h2 className="account-section-title">🏆 Rewards</h2>
      <div className="rewards-coming-soon">
        <div className="rewards-trophy">🏆</div>
        <h3 className="rewards-title">Living Result Rewards</h3>
        <div className="rewards-coming-label">Coming Soon</div>
        <p className="rewards-desc">We're building an exciting loyalty program.<br />Every genuine purchase will soon earn <strong style={{ color: 'var(--accent)' }}>Living Result Points</strong>.</p>
        <div className="rewards-points-preview">
          <div className="rewards-points-value">{user.rewardPoints || 0}</div>
          <div className="rewards-points-label">Points Balance</div>
        </div>
        <p className="rewards-stay-tuned">Stay Tuned. 🚀</p>
      </div>
    </div>
  );

  // ── Tab: Settings ───────────────────────────────────────────────────────────
  const renderSettings = () => (
    <div>
      <h2 className="account-section-title">Settings</h2>
      <form className="settings-form" onSubmit={async (e) => {
        e.preventDefault();
        setSettingsMsg('');
        const d = await updateUserProfile(profileForm);
        if (d.success) { setUser(d.data); setSettingsMsg('✅ Profile updated!'); }
        else setSettingsMsg('❌ Update failed. Please try again.');
        setTimeout(() => setSettingsMsg(''), 3000);
      }}>
        <div className="settings-section">
          <h3 className="account-subsection-title">Personal Info</h3>
          <div className="settings-field">
            <label>Display Name</label>
            <input className="addr-form-input" value={profileForm.name} onChange={(e)=>setProfileForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input className="addr-form-input" value={user.email||''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <span className="settings-note">Email cannot be changed. Login via OTP uses this address.</span>
          </div>
          <div className="settings-field">
            <label>Phone</label>
            <input className="addr-form-input" value={user.phone||''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <span className="settings-note">Phone cannot be changed here.</span>
          </div>
        </div>
        <div className="settings-section">
          <h3 className="account-subsection-title">Notification Preferences</h3>
          {[['email','Email Notifications'],['sms','SMS Notifications'],['whatsapp','WhatsApp Notifications'],['marketing','Marketing & Promotions']].map(([k,l])=>(
            <div className="settings-toggle-row" key={k}>
              <span>{l}</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={profileForm.notifications?.[k]??true} onChange={(e)=>setProfileForm(f=>({...f,notifications:{...f.notifications,[k]:e.target.checked}}))} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
        {settingsMsg && <p style={{ color: settingsMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)', fontSize: '14px', marginBottom: '12px' }}>{settingsMsg}</p>}
        <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Save Changes</button>
      </form>
      <div className="settings-danger-zone">
        <h3 className="account-subsection-title" style={{ color: 'var(--red)' }}>Session</h3>
        <button className="settings-logout-btn" onClick={() => { logout(); router.push('/'); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout from this device
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':   return renderOverview();
      case 'orders':     return renderOrders();
      case 'wishlist':   return renderWishlist();
      case 'addresses':  return renderAddresses();
      case 'ai-profile': return renderAiProfile();
      case 'rewards':    return renderRewards();
      case 'settings':   return renderSettings();
      default:           return renderOverview();
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-layout">
          {/* ── Sidebar ── */}
          <aside className="account-sidebar">
            <div className="sidebar-user-card">
              <div className="sidebar-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-name">{user.name}</div>
                <div className="sidebar-contact">{user.email || user.phone}</div>
              </div>
            </div>
            <nav className="sidebar-nav">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`account-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  <span className="nav-item-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <button className="account-nav-item account-nav-logout" onClick={() => { logout(); router.push('/'); }}>
                <span className="nav-item-icon">🚪</span>
                Logout
              </button>
            </nav>
          </aside>

          {/* ── Content ── */}
          <main className="account-content">
            {/* Mobile Tab Bar */}
            <div className="account-mobile-tabs">
              {TABS.map((tab) => (
                <button key={tab.id} className={`mobile-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => switchTab(tab.id)}>
                  {tab.icon}
                </button>
              ))}
            </div>

            <div className="account-content-inner">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
