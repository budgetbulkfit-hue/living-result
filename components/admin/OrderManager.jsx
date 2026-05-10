'use client';

import { useState, useEffect } from 'react';

export default function OrderManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        
        // Push status change to Google Sheets
        const GOOGLE_WEB_APP_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
        if (GOOGLE_WEB_APP_URL) {
          const order = orders.find(o => o.orderId === orderId);
          fetch(GOOGLE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'order_status_update',
              timestamp: new Date().toLocaleString(),
              orderId: orderId,
              status: newStatus,
              customerName: order?.customerDetails?.name || 'Unknown',
              total: order?.totalAmount || 0
            })
          }).catch(console.error);
        }
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Network error while updating order.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(46,204,64,0.15)', color: '#2ecc71', fontWeight: 'bold' }}>CONFIRMED</span>;
      case 'Cancelled': return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(231,76,60,0.15)', color: '#e74c3c', fontWeight: 'bold' }}>CANCELLED</span>;
      default: return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(241,196,15,0.15)', color: '#f1c40f', fontWeight: 'bold' }}>PENDING</span>;
    }
  };

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Order Management</span>
        <button className="btn-outline" onClick={fetchOrders} style={{ fontSize: '13px' }}>⟳ Refresh Orders</button>
      </div>

      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px' }}>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No orders found.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{o.orderId}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{o.customerDetails?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customerDetails?.phone}</div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>₹{o.totalAmount?.toLocaleString()}</td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td>
                      {o.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => updateOrderStatus(o.orderId, 'Confirmed')}
                            style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            Accept
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(o.orderId, 'Cancelled')}
                            style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Processed</span>
                      )}
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
