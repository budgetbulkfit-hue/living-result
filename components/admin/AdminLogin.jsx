'use client';

import { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/images/logo.webp" alt="Living Result" style={{ height: '60px', marginBottom: '15px' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', textTransform: 'uppercase' }}>
            Admin Portal
          </h2>
        </div>
        
        {error && (
          <div style={{ padding: '10px', background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
