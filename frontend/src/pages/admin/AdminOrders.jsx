import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">Track and manage marketplace orders.</p>
      </div>

      <div className="admin-card">
        {orders.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: '3rem' }}>
            <p className="admin-empty-text">No orders yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>₹{Number(o.totalAmount || 0).toLocaleString()}</td>
                    <td><span className="admin-badge">{o.status || 'PENDING'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrders;
