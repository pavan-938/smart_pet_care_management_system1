import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showPetDetails, setShowPetDetails] = useState(false);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [treatmentNotes, setTreatmentNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [consultations, setConsultations] = useState([]);

    useEffect(() => {
        fetchDoctorData();
    }, []);

    const fetchDoctorData = async () => {
        try {
            setLoading(true);
            const [profileRes, appointmentsRes] = await Promise.all([
                api.get('/doctors/me'),
                api.get('/appointments/my-appointments-doctor')
            ]);
            setDoctorProfile(profileRes.data);
            setAppointments(appointmentsRes.data);
            
            // Re-fetch consultations with doctor ID if needed
            const consultRes = await api.get(`/consultations/doctor/${profileRes.data.id}`);
            setConsultations(consultRes.data);
        } catch (err) {
            console.error("Failed to fetch doctor dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsultationAction = async (id, action) => {
        try {
            if (action === 'accept') {
                await api.put(`/consultations/${id}/accept`);
            } else {
                await api.put(`/consultations/${id}/reject`);
            }
            fetchDoctorData();
        } catch (err) {
            console.error("Consultation action failed:", err);
            alert("Failed to update consultation.");
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await api.put(`/appointments/${appointmentId}/status`, null, { params: { status: newStatus } });
            // Update local state
            setAppointments(prev => prev.map(apt => 
                apt.id === appointmentId ? { ...apt, status: newStatus } : apt
            ));
            alert(`Appointment marked as ${newStatus.toLowerCase()}`);
        } catch (err) {
            alert("Failed to update appointment status");
        }
    };

    const handleSaveTreatment = async () => {
        if (!selectedAppointment) return;
        try {
            await api.post('/health-records/add', {
                petId: selectedAppointment.petId,
                date: new Date().toISOString().split('T')[0],
                recordType: 'CONSULTATION',
                diagnosis: treatmentNotes,
                treatment: prescription,
                provider: user.name
            });
            
            // Mark appointment as completed
            await handleStatusChange(selectedAppointment.id, 'COMPLETED');
            
            setShowTreatmentModal(false);
            setTreatmentNotes('');
            setPrescription('');
            setSelectedAppointment(null);
        } catch (err) {
            alert("Failed to save health record");
        }
    };

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'PENDING').length,
        today: appointments.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            const aptDate = Array.isArray(a.dateTime) 
                ? `${a.dateTime[0]}-${String(a.dateTime[1]).padStart(2, '0')}-${String(a.dateTime[2]).padStart(2, '0')}`
                : a.dateTime.split('T')[0];
            return aptDate === today && a.status !== 'CANCELLED';
        }).length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const filteredAppointments = appointments.filter(a => {
        if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesPet = a.petName?.toLowerCase().includes(searchLower);
            const matchesOwner = a.ownerName?.toLowerCase().includes(searchLower);
            if (!matchesPet && !matchesOwner) return false;
        }

        if (filterDate) {
            const aptDate = Array.isArray(a.dateTime) 
                ? `${a.dateTime[0]}-${String(a.dateTime[1]).padStart(2, '0')}-${String(a.dateTime[2]).padStart(2, '0')}`
                : a.dateTime.split('T')[0];
            if (aptDate !== filterDate) return false;
        }

        return true;
    }).sort((a, b) => {
        const dateA = Array.isArray(a.dateTime) ? new Date(...a.dateTime) : new Date(a.dateTime);
        const dateB = Array.isArray(b.dateTime) ? new Date(...b.dateTime) : new Date(b.dateTime);
        return dateB - dateA; // Newest first
    });

    const formatDateTime = (dt) => {
        if (Array.isArray(dt)) {
            const [y, m, d, h, mn] = dt;
            return new Date(y, m - 1, d, h, mn).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }
        return new Date(dt).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (!user) return null;

    return (
        <div className="doctor-dashboard">
            {/* Sidebar with Profile */}
            <aside className="doc-sidebar">
                <div className="doc-profile-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="doc-avatar-large" style={{ 
                        width: '100px', height: '100px', borderRadius: '24px', 
                        background: 'var(--doc-primary)', color: 'white', 
                        fontSize: '3rem', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', margin: '0 auto 1rem',
                        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                    }}>
                        🩺
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dr. {user.name}</h2>
                    <p style={{ color: 'var(--doc-text-muted)', fontSize: '0.9rem' }}>{doctorProfile?.specialization}</p>
                    
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--doc-text-muted)' }}>
                        <div>🎓 {doctorProfile?.qualification || 'VMD'}</div>
                        <div>📅 {doctorProfile?.experienceYears || 5}+ Years Exp.</div>
                        <div style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {doctorProfile?.rating || 4.8} Rating</div>
                    </div>

                    <div style={{ 
                        marginTop: '1rem', padding: '10px', 
                        background: (doctorProfile?.status === 'APPROVED' ? '#d1fae5' : '#fee2e2'),
                        color: (doctorProfile?.status === 'APPROVED' ? '#059669' : '#dc2626'),
                        borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                        textTransform: 'uppercase'
                    }}>
                        {doctorProfile?.status || 'PENDING VETTING'}
                    </div>
                </div>

                <div className="sidebar-nav">
                    <div 
                        className={`sidebar-nav-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DASHBOARD')}
                    >
                        📊 Dashboard
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeTab === 'APPOINTMENTS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('APPOINTMENTS')}
                    >
                        📅 Appointments
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeTab === 'CONSULTATIONS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('CONSULTATIONS')}
                    >
                        📹 Video Consults
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeTab === 'PATIENTS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PATIENTS')}
                    >
                        🐾 Patients
                    </div>
                    <div 
                        className={`sidebar-nav-item ${activeTab === 'SETTINGS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('SETTINGS')}
                    >
                        ⚙️ Settings
                    </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--doc-accent)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--doc-text-muted)', marginBottom: '4px' }}>Availability</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Online Mode</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="doc-main-content">
                <header className="doc-header">
                    <div className="doc-welcome">
                        <h1>Clinical Overview</h1>
                        <p>Welcome back, Dr. {user.name.split(' ')[0]}. Here is your current patient load.</p>
                    </div>
                        <div className="doc-actions" style={{ display: 'flex', gap: '1rem' }}>
                            <a 
                                href="https://meet.google.com/new" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary" 
                                style={{ padding: '12px 24px', background: '#fff', color: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>📹</span> Instant Meet
                            </a>
                            {consultations.some(c => c.status === 'PENDING') && (
                            <button 
                                className="btn-primary" 
                                style={{ padding: '12px 24px', background: '#f59e0b', borderColor: '#f59e0b' }}
                                onClick={() => setActiveTab('CONSULTATIONS')}
                            >
                                🔔 {consultations.filter(c => c.status === 'PENDING').length} Video Req.
                            </button>
                        )}
                        <button className="btn-primary" style={{ padding: '12px 24px' }}>+ New Case</button>
                    </div>
                </header>

                {activeTab === 'DASHBOARD' && (
                    <>
                        {/* Stats Matrix */}
                        <div className="doc-stats-grid">
                            <div className="doc-stat-card" style={{ border: activeTab === 'CONSULTATIONS' ? '2px solid var(--doc-primary)' : 'none', cursor: 'pointer' }} onClick={() => setActiveTab('CONSULTATIONS')}>
                                <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>📹</div>
                                <div className="stat-info">
                                    <h3>Video Requests</h3>
                                    <p>{consultations.filter(c => c.status === 'PENDING').length} New</p>
                                </div>
                            </div>
                            <div className="doc-stat-card">
                                <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>📅</div>
                                <div className="stat-info">
                                    <h3>Total Sessions</h3>
                                    <p>{stats.total}</p>
                                </div>
                            </div>
                            <div className="doc-stat-card">
                                <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}>🔥</div>
                                <div className="stat-info">
                                    <h3>Today's Load</h3>
                                    <p>{stats.today}</p>
                                </div>
                            </div>
                            <div className="doc-stat-card">
                                <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>⌛</div>
                                <div className="stat-info">
                                    <h3>Pending Requests</h3>
                                    <p>{stats.pending}</p>
                                </div>
                            </div>
                            <div className="doc-stat-card">
                                <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>✅</div>
                                <div className="stat-info">
                                    <h3>Completed</h3>
                                    <p>{stats.completed}</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Board */}
                        <section className="doc-section-card">
                            <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                <h2>Appointment Queue</h2>
                                <div className="filter-group" style={{ flexWrap: 'wrap' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search pet or owner..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <input 
                                        type="date" 
                                        value={filterDate}
                                        onChange={e => setFilterDate(e.target.value)}
                                    />
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="ALL">All Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    { (searchTerm || filterDate || filterStatus !== 'ALL') && (
                                        <button 
                                            onClick={() => {setSearchTerm(''); setFilterDate(''); setFilterStatus('ALL');}}
                                            style={{ background: 'none', border: 'none', color: 'var(--doc-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                        >
                                            Clear Search Filter
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                {filteredAppointments.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📄</div>
                                        <h3>No matching appointments</h3>
                                        <p>There are no consultation requests matching your current filter.</p>
                                    </div>
                                ) : (
                                    <table className="doc-table">
                                        <thead>
                                            <tr>
                                                <th>Patient Details</th>
                                                <th>Guardian</th>
                                                <th>Scheduled At</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppointments.map(apt => (
                                                <tr key={apt.id}>
                                                    <td>
                                                        <div className="pet-cell">
                                                            <div className="pet-avatar">{apt.petName?.[0]}</div>
                                                            <div>
                                                                <div style={{ fontWeight: 700 }}>{apt.petName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--doc-text-muted)' }}>
                                                                    {apt.petType} • {apt.petBreed}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{apt.ownerName}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.9rem' }}>{formatDateTime(apt.dateTime)}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button 
                                                                className="btn-action btn-view" 
                                                                title="View Pet History"
                                                                onClick={() => {
                                                                    setSelectedAppointment(apt);
                                                                    setShowPetDetails(true);
                                                                }}
                                                            >
                                                                👁️
                                                            </button>
                                                            
                                                            {apt.status === 'PENDING' && (
                                                                <>
                                                                    <button 
                                                                        className="btn-action btn-approve"
                                                                        onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                                                                    >
                                                                        Authorize Clinical Session
                                                                    </button>
                                                                    <button 
                                                                        className="btn-action btn-reject"
                                                                        onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                                                                    >
                                                                        Decline Appointment
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {apt.status === 'CONFIRMED' && (
                                                                <button 
                                                                    className="btn-action btn-complete"
                                                                    onClick={() => {
                                                                        setSelectedAppointment(apt);
                                                                        setShowTreatmentModal(true);
                                                                    }}
                                                                >
                                                                    Initiate Treatment Notes
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'APPOINTMENTS' && (
                    <section className="doc-section-card">
                        <h2>All Scheduled Appointments</h2>
                        <p className="text-muted">Detailed view of all past and future appointments.</p>
                        {/* Similar table as above but maybe with different columns or filters */}
                    </section>
                )}

                {activeTab === 'PATIENTS' && (
                    <section className="doc-section-card">
                        <h2>Patient Database</h2>
                        <p className="text-muted">Master list of all pets seen at this clinic.</p>
                        {/* List of unique pets */}
                    </section>
                )}

                {activeTab === 'SETTINGS' && (
                    <section className="doc-section-card">
                        <h2>Profile Settings</h2>
                        <p className="text-muted">Manage your clinical details and availability.</p>
                        {/* Form to update doctor profile */}
                    </section>
                )}

                {activeTab === 'CONSULTATIONS' && (
                    <section className="doc-section-card">
                        <div className="section-header">
                            <h2>Video Consultation Requests</h2>
                        </div>
                        
                        {consultations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📹</div>
                                <h3>No consultation requests</h3>
                                <p>You have no pending or past video consultation requests.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                {consultations.map(consult => (
                                    <div key={consult.id} className="doc-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span style={{ 
                                                fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px',
                                                background: consult.status === 'ACCEPTED' ? '#d1fae5' : consult.status === 'REJECTED' ? '#fee2e2' : '#fff7ed',
                                                color: consult.status === 'ACCEPTED' ? '#059669' : consult.status === 'REJECTED' ? '#dc2626' : '#ea580c'
                                            }}>
                                                {consult.status}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>#{consult.id}</span>
                                        </div>
                                        
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{consult.petName} ({consult.petType})</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--doc-text-muted)' }}>Owner: {consult.userName}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--doc-primary)', fontWeight: 600, marginTop: '5px' }}>
                                                📅 {formatDateTime(consult.meetingTime)}
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.85rem', margin: '0', fontStyle: 'italic' }}>
                                            "{consult.problemDescription}"
                                        </p>

                                        <div style={{ width: '100%', marginTop: 'auto', paddingTop: '10px' }}>
                                            {consult.status === 'PENDING' ? (
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button 
                                                        onClick={() => handleConsultationAction(consult.id, 'accept')}
                                                        style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        Approve Video Consult
                                                    </button>
                                                    <button 
                                                        onClick={() => handleConsultationAction(consult.id, 'reject')}
                                                        style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        Decline Request
                                                    </button>
                                                </div>
                                            ) : consult.status === 'ACCEPTED' ? (
                                                <a 
                                                    href={consult.meetingLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'var(--doc-primary)', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}
                                                >
                                                    📹 Enter Video Consultation Room
                                                </a>
                                            ) : (
                                                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--doc-text-muted)' }}>
                                                    Request {consult.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* Pet Details Modal */}
            {showPetDetails && selectedAppointment && (
                <div className="doc-modal-overlay" onClick={() => setShowPetDetails(false)}>
                    <div className="doc-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Medical File: {selectedAppointment.petName}</h2>
                            <button onClick={() => setShowPetDetails(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">Age</span>
                                <span className="detail-value">{selectedAppointment.petAge} Years</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Problem Reported</span>
                                <span className="detail-value" style={{ color: 'var(--doc-danger)' }}>{selectedAppointment.reason || "General Checkup"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Breed Info</span>
                                <span className="detail-value">{selectedAppointment.petBreed} ({selectedAppointment.petType})</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Guardian Identity</span>
                                <span className="detail-value">{selectedAppointment.ownerName}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setShowPetDetails(false);
                                    setShowTreatmentModal(true);
                                }}
                            >
                                Begin Clinical Session
                            </button>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPetDetails(false)}>Return to Dashboard</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Treatment/Prescription Modal */}
            {showTreatmentModal && selectedAppointment && (
                <div className="doc-modal-overlay">
                    <div className="doc-modal">
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Clinical Session Notes</h2>
                            <p style={{ color: 'var(--doc-text-muted)' }}>Treating {selectedAppointment.petName} for {selectedAppointment.reason || 'Routine'}</p>
                        </div>
                        <div className="modal-body">
                            <div className="prescription-form">
                                <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Diagnosis & Treatment Notes</label>
                                <textarea 
                                    placeholder="Observed symptoms, clinical diagnosis, and immediate actions taken..."
                                    value={treatmentNotes}
                                    onChange={e => setTreatmentNotes(e.target.value)}
                                />
                            </div>
                            <div className="prescription-form">
                                <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Medication & Prescription</label>
                                <textarea 
                                    placeholder="Dosage instructions, medicines prescribed, and follow-up plan..."
                                    value={prescription}
                                    onChange={e => setPrescription(e.target.value)}
                                />
                            </div>

                            <div className="prescription-form-attachment" style={{ 
                                marginTop: '1.5rem', padding: '20px', 
                                border: '2px dashed var(--doc-border)', borderRadius: '16px',
                                background: '#f8fafc', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📁</div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Digital Clinical Attachments</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--doc-text-muted)', marginBottom: '15px' }}>
                                    Upload X-rays, medical reports, or digital prescriptions (PDF, JPG)
                                </p>
                                <input 
                                    type="file" 
                                    id="medical-attachment" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            alert(`Attached: ${file.name}`);
                                            // Logic to track attachment
                                        }
                                    }}
                                />
                                <label 
                                    htmlFor="medical-attachment"
                                    className="btn-secondary" 
                                    style={{ cursor: 'pointer', display: 'inline-block', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem' }}
                                >
                                    Select Medical File
                                </label>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn-action btn-complete" 
                                style={{ flex: 1, padding: '14px' }}
                                onClick={handleSaveTreatment}
                            >
                                Finalize & Close Appointment
                            </button>
                            <button 
                                className="btn-secondary" 
                                style={{ flex: 0.5 }} 
                                onClick={() => setShowTreatmentModal(false)}
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
