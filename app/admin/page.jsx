'use client';

import { useState, useEffect } from 'react';
import './admin.css';
import AdminLogin from '@/components/admin/AdminLogin';
import Dashboard from '@/components/admin/Dashboard';
import ProductsView from '@/components/admin/ProductsView';
import ProductEditor from '@/components/admin/ProductEditor';
import CombosView from '@/components/admin/CombosView';
import ComboEditor from '@/components/admin/ComboEditor';
import OrderManager from '@/components/admin/OrderManager';
import SettingsView from '@/components/admin/SettingsView';
import SubscribersView from '@/components/admin/SubscribersView';
import { getNotifications, updateNotificationStatus, deleteNotification, API_BASE } from '@/lib/api';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProductSlug, setEditingProductSlug] = useState(null);
  const [editingComboSlug, setEditingComboSlug] = useState(null);
  
  // Mobile UI States
  const [sidebarActive, setSidebarActive] = useState(false);
  
  // Restock alerts count & list
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchRestockAlerts(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRestockAlerts = async (authToken) => {
    try {
      const res = await getNotifications(authToken);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load restock alerts count', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setIsLoggedIn(true);
    fetchRestockAlerts(newToken);
  };

  const handleLogout = async () => {
    const API = API_BASE;
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      localStorage.removeItem('adminToken');
      setToken(null);
      setIsLoggedIn(false);
      setNotifications([]);
      setActiveTab('dashboard');
    }
  };

  // Restock Alerts handlers
  const handleMarkNotified = async (id) => {
    try {
      const res = await updateNotificationStatus(id, 'notified', token);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'notified' } : n));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!confirm('Are you sure you want to delete this restock request?')) return;
    try {
      const res = await deleteNotification(id, token);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  if (loading && !isLoggedIn) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
        Loading secure portal...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <div className="app-container">
      {/* SIDEBAR OVERLAY */}
      <div 
        className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`} 
        onClick={toggleSidebar}
      />
      
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <img src="/images/logo.webp" alt="Logo" style={{ height: '40px' }} />
        </div>
        <nav className="sidebar-nav">
          <a 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarActive(false); }}
          >
            Dashboard
          </a>
          <a 
            className={`nav-item ${(activeTab === 'products' || activeTab === 'edit-product') ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setSidebarActive(false); }}
          >
            Products
          </a>
          <a 
            className={`nav-item ${(activeTab === 'combos' || activeTab === 'edit-combo') ? 'active' : ''}`}
            onClick={() => { setActiveTab('combos'); setSidebarActive(false); }}
          >
            Combos
          </a>
          <a 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSidebarActive(false); }}
          >
            Orders
          </a>
          <a 
            className={`nav-item ${activeTab === 'subscribers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('subscribers'); setSidebarActive(false); }}
          >
            Email Leads
          </a>
          <a 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notifications'); setSidebarActive(false); }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            Restock Requests
            {pendingCount > 0 && (
              <span style={{ background: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                {pendingCount}
              </span>
            )}
          </a>
          <a 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarActive(false); }}
          >
            Settings
          </a>
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="action-btn"
            style={{ width: '100%', justifyContent: 'center', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', display: 'flex', alignItems: 'center', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--accent)', textTransform: 'uppercase' }}>
            Admin Portal
          </h2>
          <button className="hamburger-admin" onClick={toggleSidebar}>☰</button>
        </div>

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && <Dashboard token={token} />}

        {/* 2. PRODUCTS VIEW */}
        {activeTab === 'products' && (
          <ProductsView 
            token={token} 
            onEdit={(slug) => { setEditingProductSlug(slug); setActiveTab('edit-product'); }}
            onAdd={() => { setEditingProductSlug('new'); setActiveTab('edit-product'); }}
          />
        )}

        {/* 3. EDIT PRODUCT VIEW */}
        {activeTab === 'edit-product' && (
          <ProductEditor 
            token={token} 
            slugToEdit={editingProductSlug}
            onCancel={() => setActiveTab('products')}
            onSaved={() => { setActiveTab('products'); }}
          />
        )}

        {/* 4. COMBOS VIEW */}
        {activeTab === 'combos' && (
          <CombosView 
            token={token} 
            onEdit={(slug) => { setEditingComboSlug(slug); setActiveTab('edit-combo'); }}
            onAdd={() => { setEditingComboSlug('new'); setActiveTab('edit-combo'); }}
          />
        )}

        {/* 5. EDIT COMBO VIEW */}
        {activeTab === 'edit-combo' && (
          <ComboEditor 
            token={token} 
            slugToEdit={editingComboSlug}
            onCancel={() => setActiveTab('combos')}
            onSaved={() => { setActiveTab('combos'); }}
          />
        )}

        {/* 6. ORDERS VIEW */}
        {activeTab === 'orders' && <OrderManager token={token} />}

        {/* 7. SUBSCRIBERS VIEW */}
        {activeTab === 'subscribers' && <SubscribersView />}

        {/* 8. RESTOCK ALERTS VIEW */}
        {activeTab === 'notifications' && (
          <div className="page-view active">
            <div className="header-title">
              <span>Restock Requests</span>
              <button className="btn-outline" onClick={() => fetchRestockAlerts(token)} style={{ fontSize: '13px' }}>⟳ Refresh List</button>
            </div>
            <div className="panel-card">
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Customer email list waiting for products to be restocked.</p>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No pending requests.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n._id}>
                        <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{n.email}</td>
                        <td style={{ color: '#fff' }}>{n.phoneNumber || 'N/A'}</td>
                        <td>{n.productId?.name || n.productName || 'Unknown Product'}</td>
                        <td>
                          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                            {n.variantKey}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: n.status === 'pending' ? '#f39c12' : '#2ecc71', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {n.status}
                          </span>
                        </td>
                        <td>
                          {n.status === 'pending' && (
                            <button className="action-btn btn-edit" onClick={() => handleMarkNotified(n._id)}>
                              Mark Notified
                            </button>
                          )}
                          <button className="action-btn btn-delete" onClick={() => handleDeleteAlert(n._id)}>✕</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. SETTINGS VIEW */}
        {activeTab === 'settings' && <SettingsView token={token} />}
      </main>
    </div>
  );
}
