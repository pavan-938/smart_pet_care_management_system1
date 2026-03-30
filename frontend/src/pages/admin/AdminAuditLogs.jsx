import React from 'react';

const AdminAuditLogs = () => (
  <>
    <div className="admin-page-header">
      <h1 className="admin-page-title">Audit Logs</h1>
      <p className="admin-page-subtitle">System activity and audit trail.</p>
    </div>
    <div className="admin-empty-state">
      <div className="admin-empty-icon">📋</div>
      <h3 className="admin-empty-title">Coming Soon</h3>
      <p className="admin-empty-text">Audit logs will be available here.</p>
    </div>
  </>
);

export default AdminAuditLogs;
