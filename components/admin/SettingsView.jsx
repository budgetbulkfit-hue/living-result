'use client';

import { useState, useEffect } from 'react';

export default function SettingsView({ token }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    fomo: { socialProof: true, exitIntent: true, scarcity: true, timerDuration: 600 },
    noticeStrip: { enabled: false, text: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API}/settings`);
        const data = await res.json();
        if (data.success && data.data) {
          setSettings({
            maintenanceMode: !data.data.isLaunched,
            fomo: data.data.fomoSettings || settings.fomo,
            noticeStrip: data.data.noticeStrip || settings.noticeStrip
          });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isLaunched: !settings.maintenanceMode,
          fomoSettings: settings.fomo,
          noticeStrip: settings.noticeStrip
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      setMessage('Network error. Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateFomo = (key, val) => setSettings(s => ({ ...s, fomo: { ...s.fomo, [key]: val } }));

  if (loading) return <div className="page-view active" style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Store Settings</span>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: saving ? 'var(--text-muted)' : '#3498db', borderColor: saving ? 'var(--border)' : '#3498db', fontSize: '13px' }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px', background: message.includes('success') ? 'rgba(46,204,64,0.1)' : 'rgba(231,76,60,0.1)', color: message.includes('success') ? '#2ecc71' : '#e74c3c', borderRadius: '6px', marginBottom: '20px', border: `1px solid ${message.includes('success') ? '#2ecc71' : '#e74c3c'}` }}>
          {message}
        </div>
      )}

      <div className="settings-grid">
        <div className="panel-card">
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Site Visibility</h3>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0 }}>Maintenance Mode</label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Locks out normal users with a maintenance screen.</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="panel-card">
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Notice Strip</h3>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <label style={{ margin: 0 }}>Enable Notice Strip</label>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.noticeStrip.enabled} onChange={(e) => setSettings(s => ({ ...s, noticeStrip: { ...s.noticeStrip, enabled: e.target.checked } }))} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="form-group" style={{ opacity: settings.noticeStrip.enabled ? 1 : 0.5, pointerEvents: settings.noticeStrip.enabled ? 'auto' : 'none' }}>
            <label>Announcement Text</label>
            <input type="text" value={settings.noticeStrip.text} onChange={(e) => setSettings(s => ({ ...s, noticeStrip: { ...s.noticeStrip, text: e.target.value } }))} placeholder="e.g. FREE SHIPPING ON ALL ORDERS!" />
          </div>
        </div>

        <div className="panel-card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>FOMO & Marketing Triggers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Social Proof Popups</label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shows "Someone just bought..."</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.socialProof} onChange={(e) => updateFomo('socialProof', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Exit Intent Overlay</label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shows coupon on mouse leave.</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.exitIntent} onChange={(e) => updateFomo('exitIntent', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Scarcity Badges</label>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>"Only X left in stock"</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.scarcity} onChange={(e) => updateFomo('scarcity', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Checkout Timer Duration (secs)</label>
              </div>
              <input type="number" value={settings.fomo.timerDuration} onChange={(e) => updateFomo('timerDuration', parseInt(e.target.value) || 600)} style={{ width: '100px', padding: '8px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
