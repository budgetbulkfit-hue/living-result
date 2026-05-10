'use client';

import { useState, useEffect } from 'react';
import './admin.css';
import AdminLogin from '@/components/admin/AdminLogin';
import Dashboard from '@/components/admin/Dashboard';
import ProductsView from '@/components/admin/ProductsView';
import SettingsView from '@/components/admin/SettingsView';
import OrderManager from '@/components/admin/OrderManager';
import ProductEditor from '@/components/admin/ProductEditor';
import CombosView from '@/components/admin/CombosView';
import ComboEditor from '@/components/admin/ComboEditor';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [editItemId, setEditItemId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) setToken(storedToken);
  }, []);

  if (!mounted) return null;

  if (!token) {
    return <AdminLogin onLoginSuccess={setToken} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const navigate = (view, itemId = null) => {
    setActiveView(view);
    setEditItemId(itemId);
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="Living Result" style={{ height: '45px' }} />
        </div>
        <nav className="sidebar-nav">
          <a className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>Dashboard</a>
          <a className={`nav-item ${activeView === 'products' ? 'active' : ''}`} onClick={() => navigate('products')}>Products</a>
          <a className={`nav-item ${activeView === 'combos' ? 'active' : ''}`} onClick={() => navigate('combos')}>Combos</a>
          <a className={`nav-item ${activeView === 'orders' ? 'active' : ''}`} onClick={() => navigate('orders')}>Orders</a>
          <a className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>Settings</a>
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn-outline" 
            style={{ width: '100%', justifyContent: 'center', borderColor: '#e74c3c', color: '#e74c3c' }}
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
          <button className="hamburger-admin" onClick={() => setSidebarOpen(true)}>☰</button>
        </div>

        {activeView === 'dashboard' && <Dashboard token={token} />}
        {activeView === 'products' && <ProductsView token={token} onEdit={(id) => navigate('edit-product', id)} onAdd={() => navigate('edit-product', 'new')} />}
        {activeView === 'settings' && <SettingsView token={token} />}
        {activeView === 'orders' && <OrderManager token={token} />}
        {activeView === 'combos' && <CombosView token={token} onEdit={(id) => navigate('edit-combo', id)} onAdd={() => navigate('edit-combo', 'new')} />}
        
        {/* Editors */}
        {activeView === 'edit-product' && (
          <ProductEditor 
            token={token} 
            slugToEdit={editItemId} 
            onCancel={() => navigate('products')} 
            onSaved={() => navigate('products')} 
          />
        )}
        
        {activeView === 'edit-combo' && (
          <ComboEditor 
            token={token} 
            slugToEdit={editItemId} 
            onCancel={() => navigate('combos')} 
            onSaved={() => navigate('combos')} 
          />
        )}
      </main>
    </div>
  );
}
