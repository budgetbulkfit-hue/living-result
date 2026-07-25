'use client';

import { useState, useEffect } from 'react';
import { getProducts, getNotifications, syncGoogleSheets } from '@/lib/api';

export default function Dashboard({ token }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pendingNotifsCount, setPendingNotifsCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (msg, type = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [prodsList, notifsData] = await Promise.all([
        getProducts(),
        getNotifications(token)
      ]);

      setProducts(prodsList || []);
      if (notifsData.success) {
        const pending = (notifsData.data || []).filter(n => n.status === 'pending').length;
        setPendingNotifsCount(pending);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      showToast('Error loading metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Calculations
  let totalViews = 0;
  let totalSales = 0;
  let totalRevenue = 0;

  products.forEach(p => {
    totalViews += Number(p.viewCount || 0);
    totalSales += Number(p.confirmedSales || 0);
    totalRevenue += Number(p.confirmedRevenue || 0);
  });

  const avgConversion = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : '0.00';

  // Product Performance lists (sorted by views desc)
  const performanceList = [...products].sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0));

  const exportToCSV = () => {
    if (!products || products.length === 0) {
      return showToast('No data to export', 'error');
    }

    let csvContent = "Product Name,Views,Confirmed Sales,Revenue (INR),Conversion Rate (%)\n";
    performanceList.forEach(p => {
      const views = Number(p.viewCount || 0);
      const sales = Number(p.confirmedSales || 0);
      const rev = Number(p.confirmedRevenue || 0);
      const rate = views > 0 ? ((sales / views) * 100).toFixed(2) : '0.00';
      const name = `"${p.name.replace(/"/g, '""')}"`;
      csvContent += `${name},${views},${sales},${rev},${rate}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `living_result_insights_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported Successfully!', 'success');
  };

  const syncToGoogleSheets = async () => {
    const GOOGLE_WEB_APP_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || 'https://script.google.com/macros/s/AKfycbwWTolkQqA0LXgLwTYj8vnWMoEHQeonlhCc7-8RDEXgnGzZG6C22wK_RInl6Gkh0t3o8A/exec';
    if (!GOOGLE_WEB_APP_URL) {
      return showToast('Google Web App URL not configured', 'error');
    }

    showToast('Syncing to Google Sheets...', 'info');
    try {
      const payload = {
        action: "dashboard_export",
        timestamp: new Date().toLocaleString(),
        metrics: performanceList.map(p => ({
          name: p.name,
          views: Number(p.viewCount || 0),
          sales: Number(p.confirmedSales || 0),
          revenue: Number(p.confirmedRevenue || 0)
        }))
      };

      const res = await syncGoogleSheets(GOOGLE_WEB_APP_URL, payload, token);
      if (res.success) {
        showToast('Synced to Google Sheets!', 'success');
      } else {
        throw new Error(res.message || 'Backend sync failed');
      }
    } catch (err) {
      console.error("Sheet sync failed:", err);
      showToast('Failed to sync to Sheets', 'error');
    }
  };

  const openLiveSiteBypass = () => {
    const activeToken = localStorage.getItem('adminToken') || '';
    window.open(`/?admin_bypass=${activeToken}`, '_blank');
  };

  return (
    <div className="page-view active">
      {/* Toast Notification */}
      {toast.message && (
        <div style={{
          position: 'fixed', right: '20px', bottom: '20px', zIndex: 30000,
          padding: '12px 14px', borderRadius: '8px', border: '1px solid',
          background: '#1d1d1d', color: '#fff', fontSize: '13px',
          borderColor: toast.type === 'success' ? '#2ecc71' : (toast.type === 'error' ? '#e74c3c' : 'var(--accent)')
        }}>
          {toast.message}
        </div>
      )}

      <div className="header-title">
        <span>Business Insights</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={exportToCSV} style={{ fontSize: '13px', color: '#2ecc71', borderColor: '#2ecc71' }}>
            ⬇ Export CSV
          </button>
          <button className="btn-outline" onClick={syncToGoogleSheets} style={{ fontSize: '13px', color: '#3498db', borderColor: '#3498db' }}>
            ☁ Sync to Sheets
          </button>
          <button className="btn-outline" onClick={fetchMetrics} style={{ fontSize: '13px' }}>
            ⟳ Refresh List
          </button>
          <button className="btn-outline" onClick={openLiveSiteBypass} style={{ fontSize: '13px' }}>
            View Live Site
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        <div className="dash-card">
          <div className="dash-card-title">Total Views</div>
          <div className="dash-card-value">{loading ? '...' : totalViews.toLocaleString()}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Total Sales</div>
          <div className="dash-card-value">{loading ? '...' : totalSales.toLocaleString()}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Total Revenue</div>
          <div className="dash-card-value">{loading ? '...' : `₹${totalRevenue.toLocaleString()}`}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Avg Conversion</div>
          <div className="dash-card-value">{loading ? '...' : `${avgConversion}%`}</div>
        </div>
        <div className="dash-card" style={{ borderLeft: '3px solid #e74c3c' }}>
          <div className="dash-card-title" style={{ color: '#e74c3c' }}>Restock Requests</div>
          <div className="dash-card-value" style={{ color: '#e74c3c' }}>{loading ? '...' : pendingNotifsCount}</div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="panel-card">
        <h3 style={{ margin: '0 0 15px 0', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Product Performance
        </h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Confirmed Sales</th>
                <th>Revenue (₹)</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading performance data...</td>
                </tr>
              ) : performanceList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No performance data available.</td>
                </tr>
              ) : (
                performanceList.map((p) => {
                  const views = Number(p.viewCount || 0);
                  const sales = Number(p.confirmedSales || 0);
                  const rev = Number(p.confirmedRevenue || 0);
                  const rate = views > 0 ? (sales / views) * 100 : 0;
                  const color = rate > 3 ? '#2ecc71' : (rate < 1 ? '#e74c3c' : '#f39c12');
                  return (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{views.toLocaleString()}</td>
                      <td>{sales.toLocaleString()}</td>
                      <td>₹{rev.toLocaleString()}</td>
                      <td>
                        <span style={{ color, fontWeight: 'bold' }}>
                          {rate.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
