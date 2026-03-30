import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Active Users', value: stats?.totalUsers ?? 0, icon: '👥', color: '#6366f1' },
    { label: 'Vetted Doctors', value: stats?.totalDoctors ?? 0, icon: '🩺', color: '#10b981' },
    { label: 'Total Appointments', value: stats?.totalAppointments ?? 0, icon: '📅', color: '#3b82f6' },
    { label: 'Platform Revenue', value: `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#f59e0b' },
  ];

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Overview</h1>
        <p className="admin-page-subtitle">Platform-wide metrics at a glance.</p>
      </div>

      <div className="admin-stats-grid-cards">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <span className="admin-stat-card-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </span>
            <div>
              <span className="admin-stat-card-label">{card.label}</span>
              <span className="admin-stat-card-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h3 className="admin-section-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/doctor" className="admin-quick-link">Review Doctor Applications</a>
          <a href="/admin/marketplace" className="admin-quick-link">Manage Products</a>
          <a href="/admin/orders" className="admin-quick-link">View Orders</a>
          <a href="/admin/analytics" className="admin-quick-link">View Analytics</a>
        </div>
      </div>
    </>
  );
};

export default AdminOverview;
