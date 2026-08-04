'use client';

import { useState, useEffect } from 'react';

export default function SubscribersView() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDownloadCSV = () => {
    window.location.href = '/api/newsletter?export=csv';
  };

  const handleCopyEmails = () => {
    if (subscribers.length === 0) return;
    const emailList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>VIP Email Subscribers & Leads</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn-outline"
            onClick={handleDownloadCSV}
            style={{ fontSize: '13px', color: '#2ecc71', borderColor: '#2ecc71', fontWeight: 600 }}
          >
            📥 Download Excel (.CSV)
          </button>
          <button
            className="btn-outline"
            onClick={handleCopyEmails}
            style={{ fontSize: '13px', color: '#3498db', borderColor: '#3498db' }}
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy All Emails'}
          </button>
          <button
            className="btn-outline"
            onClick={fetchSubscribers}
            style={{ fontSize: '13px' }}
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '20px' }}>
        <div className="dash-card">
          <div className="dash-card-title">Total Subscribers</div>
          <div className="dash-card-value" style={{ color: '#2ecc71' }}>
            {loading ? '...' : subscribers.length}
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">Storage Location</div>
          <div className="dash-card-value" style={{ fontSize: '14px', color: '#aaa', fontWeight: 400, marginTop: '8px' }}>
            Excel CSV: <code style={{ color: '#fff', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>data/newsletter_subscribers.csv</code>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
          Every time a visitor joins the newsletter on the website footer, their email is instantly logged below and appended to the local Excel CSV file.
        </p>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Date & Time</th>
                <th>Subscriber Email</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading subscribers...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No newsletter subscribers yet. Enter an email in the footer to test!
                  </td>
                </tr>
              ) : (
                subscribers.map((item, index) => (
                  <tr key={index}>
                    <td style={{ color: '#666' }}>{subscribers.length - index}</td>
                    <td style={{ color: '#aaa', fontSize: '13px' }}>
                      {item.date} {item.time}
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      <a
                        href={`mailto:${item.email}`}
                        style={{ color: '#ff6b35', textDecoration: 'none' }}
                      >
                        {item.email}
                      </a>
                    </td>
                    <td>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#ccc' }}>
                        {item.source}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#2ecc71', fontWeight: 600, fontSize: '12px', background: 'rgba(46,204,113,0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        {item.status || 'Active'}
                      </span>
                    </td>
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
