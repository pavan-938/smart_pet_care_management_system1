import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('All Time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading analytics...</div>;

  const totalRev = Number(stats?.totalRevenue || 0);
  const platformCut = Math.round(totalRev * 0.45);
  const netEarnings = totalRev - platformCut;
  const apptByStatus = stats?.appointmentsByStatus || {};
  const totalTx = (apptByStatus.COMPLETED || 0) + (apptByStatus.CONFIRMED || 0) + 1;

  const financialCards = [
    { label: 'Gross Revenue', value: `₹${totalRev.toLocaleString()}`, icon: '💼', color: '#8b5cf6' },
    { label: 'Platform Earnings', value: `₹${platformCut.toLocaleString()}`, icon: '💵', color: '#10b981' },
    { label: 'Vet Earnings', value: `₹${netEarnings.toLocaleString()}`, icon: '💼', color: '#3b82f6' },
    { label: 'Total Transactions', value: totalTx, icon: '📋', color: '#f59e0b' },
  ];

  const growthCards = [
    { label: 'Pet Owners', value: stats?.totalUsers || 0, icon: '🐾', color: '#10b981' },
    { label: 'Approved Vets', value: stats?.totalDoctors || 0, icon: '🩺', color: '#3b82f6' },
    { label: 'Churn Rate', value: '1.2%', icon: '📉', color: '#f59e0b' },
    { label: 'Platform Health', value: '99.9%', icon: '📊', color: '#8b5cf6' },
  ];

  return (
    <>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1 className="admin-page-title">Deep Analytics</h1>
          <p className="admin-page-subtitle">Advanced platform metrics, revenue splits, and activity tracking.</p>
        </div>
        <div className="admin-header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-select"
          >
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="admin-btn-export">Export</button>
        </div>
      </div>

      <div className="admin-section-block">
        <h3 className="admin-section-title">Financial & Revenue</h3>
        <div className="admin-stats-grid-cards">
          {financialCards.map((c) => (
            <div key={c.label} className="admin-stat-card">
              <span className="admin-stat-card-icon" style={{ background: `${c.color}20`, color: c.color }}>
                {c.icon}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="admin-stat-card-value">{c.value}</span>
                <span className="admin-stat-card-label" style={{ marginTop: '0.25rem' }}>{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section-block">
        <h3 className="admin-section-title">User & Growth</h3>
        <div className="admin-stats-grid-cards">
          {growthCards.map((c) => (
            <div key={c.label} className="admin-stat-card">
              <span className="admin-stat-card-icon" style={{ background: `${c.color}20`, color: c.color }}>
                {c.icon}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="admin-stat-card-value">{c.value}</span>
                <span className="admin-stat-card-label" style={{ marginTop: '0.25rem' }}>{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
