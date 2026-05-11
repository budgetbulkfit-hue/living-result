'use client';

import { useState, useEffect } from 'react';
import { 
  adminLogin, 
  getNotifications, 
  updateNotificationStatus, 
  deleteNotification, 
  getProducts, 
  getProductPerformance 
} from '@/lib/api';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [metrics, setMetrics] = useState({ views: 0, sales: 0, revenue: 0 });
  const [notifications, setNotifications] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (authToken) => {
    setLoading(true);
    try {
      const [notifsData, productsData, perfData] = await Promise.all([
        getNotifications(authToken),
        getProducts(),
        getProductPerformance(authToken)
      ]);

      if (notifsData.success) setNotifications(notifsData.data);
      if (perfData.success) setPerformance(perfData.data);
      
      // Calculate simple metrics from products
      if (productsData) {
        let v = 0, s = 0, r = 0;
        productsData.forEach(p => {
          v += Number(p.viewCount || 0);
          s += Number(p.confirmedSales || 0);
          r += Number(p.confirmedRevenue || 0);
        });
        setMetrics({ views: v, sales: s, revenue: r });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminLogin(email, password);
      if (res.success && res.role === 'admin') {
        localStorage.setItem('adminToken', res.token);
        setToken(res.token);
        setIsLoggedIn(true);
        fetchData(res.token);
      } else {
        setError(res.message || 'Access denied. Admins only.');
      }
    } catch (err) {
      setError('Login failed. Check connection.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setToken(null);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateNotificationStatus(id, status, token);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status } : n));
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    try {
      const res = await deleteNotification(id, token);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading && !isLoggedIn) {
    return <div className="admin-loading">Loading secure portal...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <style jsx>{`
          .admin-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            padding: 20px;
          }
          .login-card {
            background: #111;
            padding: 40px;
            border-radius: 12px;
            width: 100%;
            max-width: 400px;
            border: 1px solid #222;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          h1 { color: #f39c12; text-align: center; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
          .form-group { margin-bottom: 20px; }
          label { display: block; color: #888; margin-bottom: 8px; font-size: 13px; }
          input { width: 100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; }
          button { width: 100%; padding: 12px; background: #f39c12; color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 10px; }
          button:hover { background: #e67e22; transform: translateY(-2px); }
          .error { color: #e74c3c; font-size: 13px; text-align: center; margin-top: 15px; }
        `}</style>
        <div className="login-card">
          <h1>Admin Portal</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Secure Login</button>
          </form>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    );
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <div className="admin-dashboard">
      <style jsx>{`
        .admin-dashboard { min-height: 100vh; background: #0a0a0a; color: #fff; display: flex; }
        .sidebar { width: 260px; background: #111; border-right: 1px solid #222; padding: 30px 0; display: flex; flexDirection: column; }
        .nav-item { padding: 15px 30px; cursor: pointer; color: #888; transition: 0.2s; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid transparent; }
        .nav-item:hover { background: rgba(255,255,255,0.02); color: #fff; }
        .nav-item.active { color: #f39c12; background: rgba(243,156,18,0.05); border-left-color: #f39c12; }
        .badge { background: #e74c3c; color: #fff; border-radius: 10px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
        
        .main { flex: 1; padding: 40px; overflow-y: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .title { font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #111; padding: 25px; border-radius: 12px; border: 1px solid #222; }
        .stat-label { color: #888; font-size: 13px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: 700; }
        
        table { width: 100%; border-collapse: collapse; background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #222; }
        th { background: #1a1a1a; padding: 15px 20px; text-align: left; font-size: 13px; color: #888; text-transform: uppercase; }
        td { padding: 15px 20px; border-top: 1px solid #222; font-size: 14px; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: rgba(231,76,60,0.1); color: #e74c3c; }
        .status-notified { background: rgba(46,204,113,0.1); color: #2ecc71; }
        
        .btn-action { padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: 0.2s; border: 1px solid #333; background: transparent; color: #fff; margin-right: 8px; }
        .btn-action:hover { border-color: #888; background: rgba(255,255,255,0.05); }
        .btn-delete { color: #e74c3c; border-color: rgba(231,76,60,0.3); }
        .btn-delete:hover { background: rgba(231,76,60,0.1); border-color: #e74c3c; }

        @media (max-width: 900px) {
          .admin-dashboard { flex-direction: column; }
          .sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 10px 0; }
          .nav-item { padding: 10px 20px; white-space: nowrap; border-left: none; border-bottom: 2px solid transparent; }
          .nav-item.active { border-bottom-color: #f39c12; }
        }
      `}</style>

      <aside className="sidebar">
        <div style={{ padding: '0 30px 30px', borderBottom: '1px solid #222', marginBottom: '20px' }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: '40px' }} />
        </div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </div>
        <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          Restock Requests
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <h2 className="title">{activeTab === 'dashboard' ? 'Business Insights' : 'Restock Alerts'}</h2>
          <button onClick={() => fetchData(token)} className="btn-action">Refresh Data</button>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Views</div>
                <div className="stat-value">{metrics.views.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Sales</div>
                <div className="stat-value">{metrics.sales.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{metrics.revenue.toLocaleString()}</div>
              </div>
              <div className="stat-card" style={{ cursor: 'pointer', borderColor: pendingCount > 0 ? '#e74c3c' : '#222' }} onClick={() => setActiveTab('notifications')}>
                <div className="stat-label" style={{ color: pendingCount > 0 ? '#e74c3c' : '#888' }}>Pending Alerts</div>
                <div className="stat-value" style={{ color: pendingCount > 0 ? '#e74c3c' : '#fff' }}>{pendingCount}</div>
              </div>
            </div>

            <div className="panel" style={{ background: '#111', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', textTransform: 'uppercase' }}>Top Performing Products</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Views</th>
                      <th>Sales</th>
                      <th>Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.viewCount}</td>
                        <td>{p.confirmedSales}</td>
                        <td style={{ color: '#f39c12' }}>{p.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notifications' && (
          <div className="panel">
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Email</th>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No restock requests found.</td></tr>
                  ) : (
                    notifications.map((n, i) => (
                      <tr key={i}>
                        <td style={{ color: '#888' }}>{new Date(n.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>{n.email}</td>
                        <td>{n.productId?.name || 'Deleted Product'}</td>
                        <td style={{ color: '#888', fontSize: '12px' }}>{n.variantKey}</td>
                        <td>
                          <span className={`status-pill ${n.status === 'pending' ? 'status-pending' : 'status-notified'}`}>
                            {n.status}
                          </span>
                        </td>
                        <td>
                          {n.status === 'pending' && (
                            <button className="btn-action" onClick={() => handleUpdateStatus(n._id, 'notified')}>Mark Notified</button>
                          )}
                          <button className="btn-action btn-delete" onClick={() => handleDelete(n._id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
