import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading appointments...</div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Appointments</h1>
        <p className="admin-page-subtitle">View and manage all platform appointments.</p>
      </div>

      <div className="admin-card">
        {appointments.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: '3rem' }}>
            <p className="admin-empty-text">No appointments yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet / Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.petName} → Dr. {a.doctorName}</td>
                    <td>{a.dateTime ? new Date(a.dateTime).toLocaleString() : '-'}</td>
                    <td><span className={`admin-badge status-${(a.status || '').toLowerCase()}`}>{a.status}</span></td>
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

export default AdminAppointments;
