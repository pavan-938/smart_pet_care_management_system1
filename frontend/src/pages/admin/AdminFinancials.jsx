import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminFinancials = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Financials</h1>
        <p className="admin-page-subtitle">Revenue, payouts, and financial overview.</p>
      </div>

      <div className="admin-stats-grid-cards">
        <div className="admin-stat-card">
          <span className="admin-stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>💰</span>
          <div>
            <span className="admin-stat-card-label">Total Revenue</span>
            <span className="admin-stat-card-value">₹{Number(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>📦</span>
          <div>
            <span className="admin-stat-card-label">Total Orders</span>
            <span className="admin-stat-card-value">{stats?.totalOrders ?? 0}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminFinancials;
