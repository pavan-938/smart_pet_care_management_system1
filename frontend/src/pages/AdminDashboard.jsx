import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/doctors/pending')
            ]);
            setStats(statsRes.data);
            setPendingDoctors(pendingRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTabData = async (tab) => {
        setActiveTab(tab);
        if (loading) return;
        try {
            setLoading(true);
            if (tab === 'doctors' && allDoctors.length === 0) {
                const res = await api.get('/admin/doctors');
                setAllDoctors(res.data);
            } else if (tab === 'users' && allUsers.length === 0) {
                const res = await api.get('/admin/users');
                setAllUsers(res.data);
            }
        } catch (err) {
            console.error(`Error loading ${tab}`, err);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorStatus = async (doctorId, status) => {
        try {
            setActionLoading(doctorId);
            await api.put(`/admin/doctors/${doctorId}/status`, null, { params: { status } });
            
            // Re-fetch only necessary data
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/doctors/pending')
            ]);
            setStats(statsRes.data);
            setPendingDoctors(pendingRes.data);
            
            if (allDoctors.length > 0) {
                const docRes = await api.get('/admin/doctors');
                setAllDoctors(docRes.data);
            }
            
            setSelectedDoctor(null);
            alert(`Specialist has been ${status.toLowerCase()} and notified.`);
        } catch (err) {
            alert("Protocol Violation: Error updating status.");
        } finally {
            setActionLoading(null);
        }
    };

    if (!user) return null;

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="container">
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span className="credentials-badge" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>Master Console</span>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Ecosystem <span style={{ color: 'var(--primary)' }}>Pulse</span></h1>
                            <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
                                Platform-wide surveillance and practitioner vetting terminal. Ensure medical standards are maintained across the network.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', minWidth: '250px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user?.name}</div>
                                    <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Administrator</div>
                                </div>
                                <div style={{ width: 48, height: 48, borderRadius: '15px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 0 20px var(--primary-glow)' }}>🛡️</div>
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic' }}>{user?.email}</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 2 }}>
                {/* Global Stats Matrix */}
                <div className="admin-stats-grid">
                    <div className="stat-glow-card">
                        <span className="stat-icon">👥</span>
                        <span className="text-muted">Active Users</span>
                        <span className="stat-value">{stats?.totalUsers || 0}</span>
                        <div style={{ height: '4px', background: 'var(--primary)', width: '60%', borderRadius: 2 }}></div>
                    </div>
                    <div className="stat-glow-card">
                        <span className="stat-icon">🩺</span>
                        <span className="text-muted">Vetted Doctors</span>
                        <span className="stat-value">{stats?.totalDoctors || 0}</span>
                        <div style={{ height: '4px', background: 'var(--secondary)', width: '40%', borderRadius: 2 }}></div>
                    </div>
                    <div className="stat-glow-card">
                        <span className="stat-icon">💰</span>
                        <span className="text-muted">Platform Revenue</span>
                        <span className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
                        <div style={{ height: '4px', background: 'var(--warning)', width: '80%', borderRadius: 2 }}></div>
                    </div>
                    <div className="stat-glow-card">
                        <span className="stat-icon">📅</span>
                        <span className="text-muted">Total Sessions</span>
                        <span className="stat-value">{stats?.totalAppointments || 0}</span>
                        <div style={{ height: '4px', background: '#3b82f6', width: '50%', borderRadius: 2 }}></div>
                    </div>
                </div>

                {/* Main Moderation Board */}
                <div className="vetting-panel" style={{ marginBottom: '5rem' }}>
                    <div className="vetting-header">
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <button 
                                className={`chart-tab ${activeTab === 'overview' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('overview')}
                                style={{ background: 'none', border: 'none', color: activeTab === 'overview' ? 'white' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none' }}
                            >
                                Vetting Queue
                            </button>
                            <button 
                                className={`chart-tab ${activeTab === 'doctors' ? 'active' : ''}`} 
                                onClick={() => fetchTabData('doctors')}
                                style={{ background: 'none', border: 'none', color: activeTab === 'doctors' ? 'white' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'doctors' ? '2px solid var(--primary)' : 'none' }}
                            >
                                Practitioner Database
                            </button>
                            <button 
                                className={`chart-tab ${activeTab === 'users' ? 'active' : ''}`} 
                                onClick={() => fetchTabData('users')}
                                style={{ background: 'none', border: 'none', color: activeTab === 'users' ? 'white' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none' }}
                            >
                                User Management
                            </button>
                        </div>
                        <div className="badge-outline" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary)', color: 'white' }}>
                            {pendingDoctors.length} Requests Pending
                        </div>
                    </div>

                    <div style={{ minHeight: '400px' }}>
                        {activeTab === 'overview' && (
                            <div className="vetting-content">
                                {pendingDoctors.length === 0 ? (
                                    <div style={{ padding: '8rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
                                        <h2 style={{ fontWeight: 800 }}>Protocol Secured</h2>
                                        <p className="text-muted">All practitioner credentials have been verified. No pending tasks.</p>
                                    </div>
                                ) : (
                                    pendingDoctors.map(doc => (
                                        <div key={doc.id} className="doctor-profile-card">
                                            <div className="avatar-ring">🩺</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                                    <h3 style={{ margin: 0, fontWeight: 800 }}>Dr. {doc.name}</h3>
                                                    <span className="credentials-badge">{doc.specialization}</span>
                                                </div>
                                                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>{doc.email} • {doc.experienceYears} Years Experience</p>
                                            </div>
                                            <div className="action-group">
                                                <button className="btn-secondary" onClick={() => setSelectedDoctor(doc)}>Verify Details</button>
                                                <button 
                                                    className="btn-approve" 
                                                    onClick={() => handleDoctorStatus(doc.id, 'APPROVED')}
                                                    disabled={actionLoading === doc.id}
                                                >
                                                    {actionLoading === doc.id ? 'Processing...' : 'Authorize'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'doctors' && (
                            <div className="apt-table-wrapper" style={{ padding: '2rem' }}>
                                <table className="apt-table" style={{ width: '100%', color: 'white' }}>
                                    <thead style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>Practitioner</th>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>Specialization</th>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
                                            <th style={{ textAlign: 'right', padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allDoctors.map(doc => (
                                            <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.5rem 1rem' }}>
                                                    <div style={{ fontWeight: 800 }}>Dr. {doc.name}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{doc.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{doc.specialization}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ 
                                                        padding: '4px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 800,
                                                        background: doc.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                        color: doc.status === 'APPROVED' ? 'var(--secondary)' : 'var(--danger)'
                                                    }}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', padding: '1rem' }}>
                                                    <button onClick={() => setSelectedDoctor(doc)} className="badge-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>Inspect</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="apt-table-wrapper" style={{ padding: '2rem' }}>
                                <table className="apt-table" style={{ width: '100%', color: 'white' }}>
                                    <thead style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>User Identity</th>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>Access Level</th>
                                            <th style={{ textAlign: 'left', padding: '1rem' }}>Member Since</th>
                                            <th style={{ textAlign: 'right', padding: '1rem' }}>Account Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.5rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                                                        <div>
                                                            <div style={{ fontWeight: 800 }}>{u.name}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="credentials-badge" style={{ color: u.role === 'ADMIN' ? 'var(--warning)' : 'var(--primary)' }}>{u.role}</span>
                                                </td>
                                                <td style={{ padding: '1rem', opacity: 0.7 }}>{u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : 'Legacy Account'}</td>
                                                <td style={{ textAlign: 'right', padding: '1rem' }}>
                                                    <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>ACTIVE</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedDoctor && (
                <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedDoctor(null)}>×</button>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div className="avatar-ring" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1.5rem' }}>🩺</div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Dr. {selectedDoctor.name}</h2>
                            <p className="text-muted">{selectedDoctor.specialization} Specialist</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="stat-glow-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Clinical Experience</span>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800 }}>{selectedDoctor.experienceYears} Years</span>
                            </div>
                            <div className="stat-glow-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Consultation Fee</span>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800 }}>₹{selectedDoctor.consultationFee}</span>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', marginBottom: '3rem' }}>
                            <h4 style={{ margin: '0 0 1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.5 }}>Practice Jurisdiction</h4>
                            <p style={{ margin: 0, lineHeight: 1.6 }}>{selectedDoctor.clinicAddress || 'Virtual Consult Platform'}</p>
                            
                            <h4 style={{ margin: '2rem 0 1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.5 }}>Professional Summary</h4>
                            <p style={{ margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                                {selectedDoctor.bio || 'Practitioner has not provided a professional biography yet. Clinical vetting recommended based on academic credentials.'}
                            </p>
                        </div>

                        {selectedDoctor.status === 'PENDING' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    className="btn-reject" 
                                    onClick={() => handleDoctorStatus(selectedDoctor.id, 'REJECTED')}
                                    disabled={actionLoading === selectedDoctor.id}
                                >
                                    Decline Access
                                </button>
                                <button 
                                    className="btn-approve" 
                                    onClick={() => handleDoctorStatus(selectedDoctor.id, 'APPROVED')}
                                    disabled={actionLoading === selectedDoctor.id}
                                >
                                    Authorize Practitioner
                                </button>
                            </div>
                        )}
                        {selectedDoctor.status === 'APPROVED' && (
                            <button 
                                className="btn-reject" 
                                style={{ width: '100%' }}
                                onClick={() => handleDoctorStatus(selectedDoctor.id, 'REJECTED')}
                                disabled={actionLoading === selectedDoctor.id}
                            >
                                Revoke Clinical Access
                            </button>
                        )}
                        {selectedDoctor.status === 'REJECTED' && (
                            <button 
                                className="btn-approve" 
                                style={{ width: '100%' }}
                                onClick={() => handleDoctorStatus(selectedDoctor.id, 'APPROVED')}
                                disabled={actionLoading === selectedDoctor.id}
                            >
                                Restore Access & Clear Ban
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
