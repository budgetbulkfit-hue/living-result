'use client';

import { useState, useEffect } from 'react';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState({ views: 0, sales: 0, revenue: 0, conversion: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ported from legacy refreshDashboard()
    const fetchData = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API}/orders/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setStats({
            views: data.data.totalViews || 0,
            sales: data.data.totalSales || 0,
            revenue: data.data.totalRevenue || 0,
            conversion: data.data.conversionRate || 0
          });
          setProducts(data.data.productPerformance || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const syncToGoogleSheets = async () => {
    const GOOGLE_WEB_APP_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    if (!GOOGLE_WEB_APP_URL) {
      alert('Google Web App URL not configured.');
      return;
    }

    try {
      const payload = {
        action: "dashboard_export",
        timestamp: new Date().toLocaleString(),
        metrics: products.map(p => ({
          name: p.name, 
          views: Number(p.views || 0), 
          sales: Number(p.sales || 0), 
          revenue: Number(p.revenue || 0)
        }))
      };
      
      await fetch(GOOGLE_WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      alert('Synced to Google Sheets successfully!');
    } catch (err) {
      console.error("Sheet sync failed:", err);
      alert('Failed to sync to Sheets');
    }
  };

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Business Insights</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" style={{ fontSize: '13px', color: '#2ecc71', borderColor: '#2ecc71' }}>⬇ Export CSV</button>
          <button className="btn-outline" onClick={syncToGoogleSheets} style={{ fontSize: '13px', color: '#3498db', borderColor: '#3498db' }}>☁ Sync to Sheets</button>
          <button className="btn-outline" style={{ fontSize: '13px' }}>⟳ Refresh</button>
          <a href="/" target="_blank" className="btn-outline" style={{ fontSize: '13px', textDecoration: 'none' }}>View Live Site</a>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dash-card">
          <div className="dash-card-title">Total Views</div>
          <div className="dash-card-value">{loading ? '...' : stats.views}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Total Sales</div>
          <div className="dash-card-value">{loading ? '...' : stats.sales}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Total Revenue</div>
          <div className="dash-card-value">₹{loading ? '...' : stats.revenue.toLocaleString()}</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Avg Conversion</div>
          <div className="dash-card-value">{loading ? '...' : `${stats.conversion}%`}</div>
        </div>
      </div>

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
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No performance data available yet.</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.views}</td>
                    <td>{p.sales}</td>
                    <td>₹{p.revenue.toLocaleString()}</td>
                    <td>{p.conversion}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
