import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminDoctorApprovals = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    api.get('/admin/doctors/pending')
      .then((res) => setPendingDoctors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (doctorId, status) => {
    try {
      setActionLoading(doctorId);
      await api.put(`/admin/doctors/${doctorId}/status`, null, { params: { status } });
      setPendingDoctors((prev) => prev.filter((d) => d.id !== doctorId));
      setSelectedDoctor(null);
      alert(`Doctor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
    } catch (err) {
      alert('Failed to update doctor status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Identity Verification</h1>
        <p className="admin-page-subtitle">Review licenses and approve incoming veterinarian applications.</p>
      </div>

      {pendingDoctors.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">✓</div>
          <h3 className="admin-empty-title">Inbox Zero</h3>
          <p className="admin-empty-text">All doctor verifications have been processed.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-list-header">
            <span>{pendingDoctors.length} pending verification</span>
          </div>
          <div className="admin-doctor-list">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="admin-doctor-row">
                <div className="admin-doctor-info">
                  <div className="admin-doctor-avatar">🩺</div>
                  <div>
                    <strong>Dr. {doc.name}</strong>
                    <span className="admin-muted">{doc.specialization} • {doc.experienceYears} years</span>
                  </div>
                </div>
                <div className="admin-doctor-actions">
                  <button onClick={() => setSelectedDoctor(doc)} className="admin-btn-outline">View Details</button>
                  <button onClick={() => handleStatus(doc.id, 'APPROVED')} disabled={actionLoading === doc.id} className="admin-btn-approve">
                    {actionLoading === doc.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button onClick={() => handleStatus(doc.id, 'REJECTED')} disabled={actionLoading === doc.id} className="admin-btn-reject">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="admin-modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedDoctor(null)}>×</button>
            <h3>Dr. {selectedDoctor.name}</h3>
            <p className="admin-muted">{selectedDoctor.specialization}</p>
            <p>{selectedDoctor.clinicAddress || 'No address provided'}</p>
            <p className="admin-muted">Fee: ₹{selectedDoctor.consultationFee}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="admin-btn-approve" onClick={() => handleStatus(selectedDoctor.id, 'APPROVED')} disabled={actionLoading === selectedDoctor.id}>
                Approve
              </button>
              <button className="admin-btn-reject" onClick={() => handleStatus(selectedDoctor.id, 'REJECTED')} disabled={actionLoading === selectedDoctor.id}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDoctorApprovals;
