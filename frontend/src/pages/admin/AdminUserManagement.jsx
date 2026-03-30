import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading users...</div>;

  const deleteInactiveUser = async (user) => {
    if (!user.inactive) {
      alert('Only inactive user accounts can be deleted.');
      return;
    }
    if (!window.confirm(`Delete inactive account ${user.name}?`)) return;
    try {
      setDeletingId(user.id);
      await api.delete(`/admin/users/${user.id}/inactive`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert('Inactive account deleted.');
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete user.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">Manage platform users and access levels.</p>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Activity</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-table-user">
                      <span className="admin-table-avatar">{u.name?.[0]?.toUpperCase()}</span>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className="admin-badge">{u.role}</span></td>
                  <td>
                    <span className={`admin-badge ${u.inactive ? 'status-cancelled' : 'active'}`}>
                      {u.inactive ? 'INACTIVE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td>
                    <span className="admin-muted">
                      Pets: {u.petsCount ?? 0} | Appointments: {u.appointmentsCount ?? 0} | Orders: {u.ordersCount ?? 0}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="admin-btn-reject"
                      onClick={() => deleteInactiveUser(u)}
                      disabled={!u.inactive || deletingId === u.id}
                      title={u.inactive ? 'Delete inactive account' : 'Only inactive users can be deleted'}
                    >
                      {deletingId === u.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminUserManagement;
