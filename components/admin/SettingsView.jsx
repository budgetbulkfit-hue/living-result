'use client';

import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export default function SettingsView({ token }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    fomo: { socialProof: true, exitIntent: true, scarcity: true, timerDuration: 600 },
    noticeStrip: { enabled: false, text: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dangerLoading, setDangerLoading] = useState('');

  const API = API_BASE;

  const showMsg = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(''), 4000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/settings`);
        const data = await res.json();
        if (data.success && data.data) {
          setSettings({
            maintenanceMode: !data.data.isLaunched,
            fomo: data.data.fomoSettings || { socialProof: true, exitIntent: true, scarcity: true, timerDuration: 600 },
            noticeStrip: data.data.noticeStrip || { enabled: false, text: '' }
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
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
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
        showMsg('Settings saved successfully!');
      } else {
        showMsg(data.message || 'Failed to save settings.', true);
      }
    } catch (err) {
      showMsg('Network error. Failed to save.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!confirm('This will force-reload the site for ALL visitors. Proceed?')) return;
    setDangerLoading('refresh');
    try {
      const res = await fetch(`${API}/settings/version/increment`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showMsg('✅ Global refresh triggered! All visitors will reload.');
      } else {
        showMsg(data.message || 'Failed to trigger refresh.', true);
      }
    } catch (err) {
      showMsg('Network error while triggering refresh.', true);
    } finally {
      setDangerLoading('');
    }
  };

  const handleResetData = async () => {
    const first = confirm('⚠️ WARNING: This will permanently delete ALL orders and reset analytics. This CANNOT be undone.\n\nContinue?');
    if (!first) return;
    const second = confirm('🔴 FINAL CONFIRMATION: All order history and analytics will be wiped. Are you absolutely sure?');
    if (!second) return;

    setDangerLoading('reset');
    try {
      const res = await fetch(`${API}/admin/reset-data`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showMsg('✅ Data wiped. Orders and analytics have been reset for a new cycle.');
      } else {
        showMsg(data.message || 'Failed to reset data.', true);
      }
    } catch (err) {
      showMsg('Network error while resetting data.', true);
    } finally {
      setDangerLoading('');
    }
  };

  const updateFomo = (key, val) => setSettings(s => ({ ...s, fomo: { ...s.fomo, [key]: val } }));

  if (loading) return <div className="page-view active" style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading Settings...</div>;

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Store Settings</span>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ background: saving ? 'var(--text-muted)' : '#3498db', borderColor: saving ? 'var(--border)' : '#3498db', fontSize: '13px' }}
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          background: message.isError ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,64,0.1)',
          color: message.isError ? '#e74c3c' : '#2ecc71',
          borderRadius: '6px',
          marginBottom: '20px',
          border: `1px solid ${message.isError ? '#e74c3c' : '#2ecc71'}`,
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Site Visibility */}
        <div className="panel-card">
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>🌐 Site Visibility</h3>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0 }}>Maintenance Mode</label>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Locks out normal users with a maintenance screen.</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Notice Strip */}
        <div className="panel-card">
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>📢 Notice Strip</h3>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label style={{ margin: 0 }}>Enable Announcement Bar</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.noticeStrip.enabled} onChange={(e) => setSettings(s => ({ ...s, noticeStrip: { ...s.noticeStrip, enabled: e.target.checked } }))} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="form-group" style={{ opacity: settings.noticeStrip.enabled ? 1 : 0.4, pointerEvents: settings.noticeStrip.enabled ? 'auto' : 'none' }}>
            <label>Announcement Text</label>
            <input
              type="text"
              value={settings.noticeStrip.text}
              onChange={(e) => setSettings(s => ({ ...s, noticeStrip: { ...s.noticeStrip, text: e.target.value } }))}
              placeholder="e.g. FREE SHIPPING ON ALL ORDERS!"
            />
          </div>
        </div>

        {/* FOMO Settings */}
        <div className="panel-card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 20px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>🚀 FOMO & Marketing Triggers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Social Proof Popups</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Shows "Someone just bought..." popups</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.socialProof} onChange={(e) => updateFomo('socialProof', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Exit Intent Overlay</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Shows coupon popup on mouse leave</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.exitIntent} onChange={(e) => updateFomo('exitIntent', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Scarcity Badges</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>"Only X left in stock" labels</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.fomo.scarcity} onChange={(e) => updateFomo('scarcity', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0 }}>Checkout Timer Duration</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Countdown timer in seconds</div>
              </div>
              <input
                type="number"
                value={settings.fomo.timerDuration}
                onChange={(e) => updateFomo('timerDuration', parseInt(e.target.value) || 600)}
                style={{ width: '100px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="panel-card" style={{ gridColumn: '1 / -1', border: '1px solid rgba(231,76,60,0.3)', background: 'rgba(231,76,60,0.03)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#e74c3c' }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '25px' }}>
            These actions are irreversible. Use with extreme caution.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Force Refresh */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>🔄 Force Global Site Refresh</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                Increments the site version counter. All active visitors will be forced to reload the page on their next action.
              </div>
              <button
                onClick={handleForceRefresh}
                disabled={dangerLoading === 'refresh'}
                style={{
                  background: '#e67e22',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: dangerLoading === 'refresh' ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  opacity: dangerLoading === 'refresh' ? 0.6 : 1,
                  width: '100%'
                }}
              >
                {dangerLoading === 'refresh' ? 'Triggering...' : 'Force Refresh Now'}
              </button>
            </div>

            {/* Wipe Data */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#e74c3c' }}>🗑 Wipe All Data (New Cycle)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                Permanently deletes all orders and resets analytics counters (view counts, sales). Use at the start of a new business cycle only.
              </div>
              <button
                onClick={handleResetData}
                disabled={dangerLoading === 'reset'}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: dangerLoading === 'reset' ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  opacity: dangerLoading === 'reset' ? 0.6 : 1,
                  width: '100%'
                }}
              >
                {dangerLoading === 'reset' ? 'Wiping Data...' : '🗑 Delete All Orders & Analytics'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
