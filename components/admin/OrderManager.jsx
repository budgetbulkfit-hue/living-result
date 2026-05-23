'use client';

import { useState, useEffect } from 'react';

export default function OrderManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Order details modal
  const [detailsModalActive, setDetailsModalActive] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Sort newest first
        const sorted = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId, mongoId) => {
    try {
      const res = await fetch(`${API}/orders/${mongoId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === mongoId ? { ...o, status: 'confirmed' } : o));
        if (selectedOrder?._id === mongoId) setSelectedOrder(prev => ({ ...prev, status: 'confirmed' }));
        // Sync to Google Sheets if configured
        const GOOGLE_WEB_APP_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
        if (GOOGLE_WEB_APP_URL) {
          const order = orders.find(o => o._id === mongoId);
          fetch(GOOGLE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'order_status_update',
              timestamp: new Date().toLocaleString(),
              orderId,
              status: 'confirmed',
              customerName: order?.customerDetails?.name || 'Unknown',
              total: order?.totalAmount || 0
            })
          }).catch(console.error);
        }
      } else {
        alert(data.message || 'Failed to confirm order');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('Network error while confirming order.');
    }
  };

  const cancelOrder = async (mongoId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`${API}/orders/${mongoId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === mongoId ? { ...o, status: 'cancelled' } : o));
        if (selectedOrder?._id === mongoId) setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Network error while cancelling order.');
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalActive(true);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(46,204,64,0.15)', color: '#2ecc71' }}>CONFIRMED</span>;
      case 'cancelled':
        return <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }}>CANCELLED</span>;
      default:
        return <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(241,196,15,0.15)', color: '#f1c40f' }}>PENDING</span>;
    }
  };

  // Filter logic (backend uses lowercase status)
  const filteredOrders = orders.filter(o => {
    const s = (o.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'All' || s === statusFilter.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || [
      o.orderId,
      o.customerDetails?.name,
      o.customerDetails?.phone,
      o._id
    ].some(field => (field || '').toString().toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    All: orders.length,
    Pending: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    Confirmed: orders.filter(o => (o.status || '').toLowerCase() === 'confirmed').length,
    Cancelled: orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length
  };

  return (
    <div className="page-view active">
      <div className="header-title">
        <span>Order Management</span>
        <button className="btn-outline" onClick={fetchOrders} style={{ fontSize: '13px' }}>⟳ Refresh Orders</button>
      </div>

      {/* Filters */}
      <div className="panel-card" style={{ padding: '16px 20px', marginBottom: '10px' }}>
        <div className="toolbar-row" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 2, minWidth: '200px' }}
          />
          {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'btn-primary' : 'btn-outline'}
              style={{
                fontSize: '12px',
                padding: '8px 14px',
                background: statusFilter === s
                  ? (s === 'Confirmed' ? '#2ecc71' : s === 'Cancelled' ? '#e74c3c' : s === 'Pending' ? '#f1c40f' : 'var(--accent)')
                  : 'transparent',
                borderColor: statusFilter === s
                  ? (s === 'Confirmed' ? '#2ecc71' : s === 'Cancelled' ? '#e74c3c' : s === 'Pending' ? '#f1c40f' : 'var(--accent)')
                  : 'var(--border)',
                color: statusFilter === s ? (s === 'Pending' ? '#000' : '#fff') : 'var(--text-secondary)'
              }}
            >
              {s} <span style={{ opacity: 0.7 }}>({statusCounts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px' }}>Order ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No orders found.</td></tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px' }}>{o.orderId || o._id?.slice(-8)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      <div>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                      <div>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{o.customerDetails?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customerDetails?.phone}</div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>₹{(o.totalAmount || 0).toLocaleString()}</td>
                    <td>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {(o.products || []).length} item{(o.products || []).length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openDetails(o)}
                          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Details
                        </button>
                        {(o.status || '').toLowerCase() === 'pending' && (
                          <>
                            <button
                              onClick={() => confirmOrder(o.orderId, o._id)}
                              style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => cancelOrder(o._id)}
                              style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ORDER DETAILS MODAL ─── */}
      <div className={`modal-overlay ${detailsModalActive ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxWidth: '680px', padding: '30px' }}>
          <button className="modal-close" onClick={() => setDetailsModalActive(false)}>&times;</button>
          {selectedOrder && (
            <>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', textTransform: 'uppercase', marginBottom: '5px', color: 'var(--accent)' }}>
                Order Details
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                ID: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{selectedOrder.orderId || selectedOrder._id}</strong> &nbsp;·&nbsp; {getStatusBadge(selectedOrder.status)}
              </p>

              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedOrder.customerDetails?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Phone</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedOrder.customerDetails?.phone}</div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery Address</div>
                  <div>{selectedOrder.customerDetails?.address || selectedOrder.address || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Order Date</div>
                  <div>{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '18px' }}>₹{(selectedOrder.totalAmount || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', marginBottom: '10px', color: 'var(--text-primary)' }}>ORDER ITEMS</h3>
              <div style={{ maxHeight: '260px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Item Name</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Flavor</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Weight</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Price</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.products || []).length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No item details available.</td></tr>
                    ) : (
                      (selectedOrder.products || []).map((item, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{item.name || item.productName || 'Unknown'}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.flavor || item.selectedFlavor || '-'}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.weight || item.selectedWeight || '-'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>×{item.quantity || item.qty || 1}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{(item.price || item.unitPrice || 0).toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>
                            ₹{((item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              {(selectedOrder.status || '').toLowerCase() === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { confirmOrder(selectedOrder.orderId, selectedOrder._id); setDetailsModalActive(false); }}
                    style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    ✓ Accept Order
                  </button>
                  <button
                    onClick={() => { cancelOrder(selectedOrder._id); setDetailsModalActive(false); }}
                    style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    ✕ Cancel Order
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
