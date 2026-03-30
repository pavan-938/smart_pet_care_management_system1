import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const ConsultationRow = ({ consultation, role, onAction }) => {
    const getStatusBadge = (status) => {
        const s = (status || "").toUpperCase();
        switch (s) {
            case "ACCEPTED": return { background: "#ecfdf5", color: "#10b981", text: "Accepted" };
            case "REJECTED": return { background: "#fef2f2", color: "#ef4444", text: "Rejected" };
            case "COMPLETED": return { background: "#eff6ff", color: "#3b82f6", text: "Completed" };
            default: return { background: "#fffbeb", color: "#f59e0b", text: "Pending" };
        }
    };

    const badge = getStatusBadge(consultation.status);

    return (
        <div className="consultation-card shadow-sm">
            <div className="consult-header">
                <div className="pet-pill">{safeText(consultation.petType)}: {safeText(consultation.petName)}</div>
                <span className="consult-status" style={{ backgroundColor: badge.background, color: badge.color }}>
                    {badge.text}
                </span>
            </div>
            <div className="consult-body">
                <div className="consult-info">
                    <strong>{role === 'USER' ? `Dr. ${safeText(consultation.doctorName, 'Unknown')}` : safeText(consultation.userName, 'Unknown user')}</strong>
                    <p>{formatDateTime(consultation.meetingTime)}</p>
                </div>
                <div className="consult-actions" style={{ width: '100%', marginTop: 'auto' }}>
                    {consultation.status.toUpperCase() === 'ACCEPTED' ? (
                        consultation.meetingLink ? (
                            <a href={safeText(consultation.meetingLink)} target="_blank" rel="noopener noreferrer" className="join-meet-btn animate-pulse">
                                📹 Enter Video Consultation Room
                            </a>
                        ) : (
                            <div className="status-badge" style={{ background: '#eef2ff', color: '#6366f1', width: '100%', justifyContent: 'center', padding: '12px' }}>
                                <span className="status-dot"></span>
                                Securing Clinical Link...
                            </div>
                        )
                    ) : consultation.status.toUpperCase() === 'PENDING' ? (
                        <div className="status-badge" style={{ background: '#fffbeb', color: '#f59e0b', width: '100%', justifyContent: 'center', padding: '12px' }}>
                            <span className="status-dot"></span>
                            Waiting for Medical Confirmation
                        </div>
                    ) : null}
                    
                    {role === 'DOCTOR' && consultation.status.toUpperCase() === 'PENDING' && (
                        <div className="doctor-decision-btns" style={{ marginTop: '12px' }}>
                            <button onClick={() => onAction(consultation.id, 'accept')} className="accept-btn">Approve Consult Request</button>
                            <button onClick={() => onAction(consultation.id, 'reject')} className="reject-btn">Decline Request</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const parseBackendDateTime = (dt) => {
    if (!dt) return null;
    if (Array.isArray(dt)) {
        const [y, m, d, h = 0, mn = 0, s = 0] = dt;
        return new Date(y, m - 1, d, h, mn, s);
    }
    const parsed = new Date(dt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateTime = (dt, locale = undefined) => {
    const parsed = parseBackendDateTime(dt);
    return parsed ? parsed.toLocaleString(locale) : "Time unavailable";
};

const formatDateOnly = (dt, locale = 'en-US') => {
    const parsed = parseBackendDateTime(dt);
    return parsed
        ? parsed.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
        : "Date unavailable";
};

const formatTimeOnly = (dt, locale = undefined) => {
    const parsed = parseBackendDateTime(dt);
    return parsed
        ? parsed.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
        : "Time unavailable";
};

const normalizeList = (value) => (Array.isArray(value) ? value : []);
const cleanAppointments = (list) => normalizeList(list).map((a) => ({
    ...a,
    doctorName: safeText(a.doctorName, ''),
    petName: safeText(a.petName, ''),
    petType: safeText(a.petType, ''),
    status: safeText(a.status, ''),
    reason: safeText(a.reason, ''),
    meetingLink: safeText(a.meetingLink, '')
}));
const cleanConsultations = (list) => normalizeList(list).map((c) => ({
    ...c,
    doctorName: safeText(c.doctorName, 'Unknown'),
    userName: safeText(c.userName, 'Unknown user'),
    petName: safeText(c.petName, 'Pet'),
    petType: safeText(c.petType, ''),
    status: safeText(c.status, ''),
    meetingLink: safeText(c.meetingLink, '')
}));
const safeText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch (_) {
            return fallback;
        }
    }
    return String(value);
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const [appointments, setAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        users: 0,
        doctors: 0,
        pets: 0
    });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [showReschedule, setShowReschedule] = useState(null);
    const [newDateTime, setNewDateTime] = useState("");
    const [myPets, setMyPets] = useState([]);
    const [healthRecords, setHealthRecords] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            let response;
            if (!user) {
                return;
            }

            if (user.role === "DOCTOR") {
                response = await api.get("/appointments/my-appointments-doctor");
            } else if (user.role === "USER") {
                response = await api.get("/appointments/my-appointments");
            } else {
                response = await api.get("/appointments");
            }
            setAppointments(cleanAppointments(response.data));

            if (user.role !== "ADMIN") {
                const upcomingRes = await api.get("/appointments/upcoming");
                setUpcomingAppointments(cleanAppointments(upcomingRes.data));
            }

            if (user.role === "ADMIN") {
                const adminStatsRes = await api.get("/admin/stats");
                setStats({
                    total: Number(adminStatsRes.data.totalAppointments) || 0,
                    pending: Number(adminStatsRes.data.appointmentsByStatus?.PENDING) || 0,
                    confirmed: Number(adminStatsRes.data.appointmentsByStatus?.CONFIRMED) || 0,
                    completed: Number(adminStatsRes.data.appointmentsByStatus?.COMPLETED) || 0,
                    cancelled: Number(adminStatsRes.data.appointmentsByStatus?.CANCELLED) || 0,
                    users: Number(adminStatsRes.data.users) || 0,
                    doctors: Number(adminStatsRes.data.doctors) || 0,
                    pets: Number(adminStatsRes.data.pets) || 0
                });
            } else {
                calculateStats(normalizeList(response.data));
                if (user.role === "USER") {
                    try {
                        const petsRes = await api.get("/pets/my-pets");
                        const pets = normalizeList(petsRes.data);
                        setMyPets(pets);
                        if (pets.length > 0) {
                            try {
                                const healthRes = await api.get(`/health-records/pet/${pets[0].id}`);
                                setHealthRecords(normalizeList(healthRes.data));
                            } catch (healthErr) {
                                console.error("Failed to load health records:", healthErr);
                                setHealthRecords([]);
                            }
                        } else {
                            setHealthRecords([]);
                        }
                    } catch (petsErr) {
                        console.error("Failed to load pets:", petsErr);
                        setMyPets([]);
                        setHealthRecords([]);
                    }
                }
                if (user.role === "DOCTOR") {
                    try {
                        const docRes = await api.get("/doctors/me");
                        setDoctorProfile(docRes.data);
                        try {
                            const consultRes = await api.get(`/consultations/doctor/${docRes.data.id}`);
                            setConsultations(cleanConsultations(consultRes.data));
                        } catch (consultErr) {
                            console.error("Failed to load doctor consultations:", consultErr);
                            setConsultations([]);
                        }
                    } catch (docErr) {
                        console.error("Failed to load doctor profile:", docErr);
                        setDoctorProfile(null);
                        setConsultations([]);
                    }
                }
                if (user.role === "USER") {
                    try {
                        const consultRes = await api.get(`/consultations/my`);
                        setConsultations(cleanConsultations(consultRes.data));
                    } catch (consultErr) {
                        console.error("Failed to load user consultations:", consultErr);
                        setConsultations([]);
                    }
                    try {
                        const docsListRes = await api.get("/doctors");
                        setDoctorsList(normalizeList(docsListRes.data));
                    } catch (docsErr) {
                        console.error("Failed to load doctors list:", docsErr);
                        setDoctorsList([]);
                    }
                }
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            // Keep existing data instead of wiping everything on error
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const safeData = normalizeList(data);
        setStats({
            total: safeData.length,
            confirmed: safeData.filter((a) => a.status === "CONFIRMED").length,
            completed: safeData.filter((a) => a.status === "COMPLETED").length,
            pending: safeData.filter((a) => a.status === "PENDING").length,
            cancelled: safeData.filter((a) => a.status === "CANCELLED").length
        });
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            setUpdatingId(id);
            await api.put(`/appointments/${id}/status`, null, { params: { status } });
            loadDashboard();
        } catch (error) {
            console.error("Status Update Failed:", error);
            alert("Failed to update appointment.");
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            setUpdatingId(id);
            await api.put(`/appointments/${id}/cancel`);
            loadDashboard();
        } catch (error) {
            console.error("Cancel Failed:", error);
            alert("Failed to cancel appointment.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReschedule = async (id) => {
        if (!newDateTime) {
            alert("Please select a date and time");
            return;
        }
        try {
            setUpdatingId(id);
            await api.put(`/appointments/${id}/reschedule`, null, {
                params: { dateTime: newDateTime }
            });
            setShowReschedule(null);
            setNewDateTime("");
            loadDashboard();
            alert("Rescheduled successfully!");
        } catch (error) {
            console.error("Reschedule Failed:", error);
            alert("Failed to reschedule.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleConsultationAction = async (id, action) => {
        try {
            if (action === 'accept') {
                await api.put(`/consultations/${id}/accept`);
            } else {
                await api.put(`/consultations/${id}/reject`);
            }
            loadDashboard();
        } catch (err) {
            console.error("Consultation action failed:", err);
            alert("Failed to update consultation.");
        }
    };

    const unifiedAppointments = [
        ...appointments.map(a => ({
            ...a,
            isConsultation: false
        })),
        ...consultations.map(c => ({ 
            ...c, 
            isConsultation: true, 
            dateTime: c.meetingTime, 
            doctorName: safeText(c.doctorName, ''),
            petName: safeText(c.petName, ''),
            status: safeText(c.status, '')
        }))
    ].sort((a, b) => {
        const dateB = parseBackendDateTime(b.dateTime);
        const dateA = parseBackendDateTime(a.dateTime);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "COMPLETED": return { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" };
            case "CONFIRMED": return { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.2)" };
            case "PENDING": return { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" };
            case "CANCELLED": return { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" };
            default: return { background: "var(--bg-main)", color: "var(--text-muted)", border: "1px solid var(--border)" };
        }
    };


    if (!user) return null;

    return (
        <div className="container dashboard-container">
            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1>
                        Welcome back, <span className="user-name">{safeText(user.name)}</span>
                    </h1>
                    <p className="dashboard-subtitle">
                        {user.role === "DOCTOR" ? "Review your clinical schedule and patient history." :
                            user.role === "USER" ? "Monitor your pet's healthcare timeline." : "System administrative control center."}
                    </p>
                </div>

                {user.role === "DOCTOR" && doctorProfile && (
                    <div style={{ 
                        background: 'rgba(99, 102, 241, 0.05)', 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        minWidth: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem'
                    }}>
                        <div style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '16px', 
                            background: 'var(--primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                        }}>🩺</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>Dr. {user.name}</div>
                            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>{safeText(doctorProfile.specialization)}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '4px' }}>
                                📍 {safeText(doctorProfile.clinicAddress, 'Virtual Practice')}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {user.role === "DOCTOR" && doctorProfile?.status === "PENDING" && (
                <div className="card auth-alert warning" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem', background: '#fffbeb', borderLeft: '5px solid #f59e0b' }}>
                    <div style={{ fontSize: '2.5rem' }}>⏳</div>
                    <div>
                        <h3 style={{ margin: 0, color: '#92400e' }}>Credential Verification in Progress</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#b45309', fontSize: '0.95rem' }}>
                            Your medical profile is currently being reviewed by our administrative board. 
                            You will receive full clinical access once your credentials are authenticated.
                        </p>
                    </div>
                </div>
            )}


            {/* Analytics Section for ADMIN */}
            {user.role === "ADMIN" && (
                <div className="analytics-section">
                    <div className="card">
                        <h3 className="mb-4">Appointment Status Allocation</h3>
                        <div className="chart-container">
                            <Doughnut
                                data={{
                                    labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
                                    datasets: [{
                                        data: [stats.pending, stats.confirmed, stats.completed, stats.cancelled],
                                        backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"],
                                        hoverOffset: 15,
                                        borderWidth: 0
                                    }]
                                }}
                                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                            />
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="mb-4">Registry Growth</h3>
                        <div className="chart-container">
                            <Bar
                                data={{
                                    labels: ["Users", "Doctors", "Pets"],
                                    datasets: [{
                                        label: "Global Count",
                                        data: [stats.users, stats.doctors, stats.pets],
                                        backgroundColor: "#4f46e5",
                                        borderRadius: 14
                                    }]
                                }}
                                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Alerts */}
            {upcomingAppointments.length > 0 && (
                <div className="card upcoming-alert-box">
                    <h3 className="mb-4">⚡ Priority Consultations (Next 24h)</h3>
                    <div className="alert-scroll-container">
                        {upcomingAppointments.map(apt => (
                            <div key={apt.id} className="alert-card">
                                <div className="patient-info">
                                    <div className="patient-avatar" style={{ background: '#fffbeb' }}>🚨</div>
                                    <div className="name-stack">
                                        <span className="primary-name">{user.role === "DOCTOR" ? safeText(apt.petName) : `Dr. ${safeText(apt.doctorName)}`}</span>
                                        <span className="secondary-id">Scheduled for {formatTimeOnly(apt.dateTime)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Combined Clinical Schedule */}
            <div className="apt-section-header">
                <h2 style={{ margin: 0, fontWeight: 800 }}>
                    {user.role === "DOCTOR" ? "Unified Clinical Timeline" : "Medical & Video History"}
                </h2>
                {user.role === "USER" && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/book-appointment?mode=video" className="btn-primary" style={{ padding: '12px 24px', background: '#10b981' }}>
                            Book Video Consultation
                        </Link>
                        <Link to="/book-appointment" className="btn-primary" style={{ padding: '12px 24px' }}>
                            Book Clinic Visit
                        </Link>
                    </div>
                )}
            </div>

            {consultations.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="apt-section-header" style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontWeight: 800 }}>
                            {user.role === "DOCTOR" ? "Video Consultation Requests" : "My Video Consultations"}
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {consultations.map((consultation) => (
                            <ConsultationRow
                                key={consultation.id}
                                consultation={consultation}
                                role={user.role}
                                onAction={handleConsultationAction}
                            />
                        ))}
                    </div>
                </div>
            )}

            {unifiedAppointments.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "6rem", borderStyle: "dashed" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📂</div>
                    <h3 className="text-muted">No Consultation Records Found</h3>
                    <p className="text-muted">Once an appointment is booked, your clinical data will be indexed here.</p>
                </div>
            ) : (
                <div className="apt-table-wrapper">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="apt-table">
                            <thead>
                                <tr>
                                    <th>{user.role === "DOCTOR" ? "Patient / Petitioner" : "Health Provider"}</th>
                                    <th>Service Type</th>
                                    <th>Schedule</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unifiedAppointments.map((apt) => (
                                    <React.Fragment key={apt.isConsultation ? `c-${apt.id}` : `a-${apt.id}`}>
                                        <tr className="apt-row">
                                            <td>
                                                <div className="patient-info">
                                                    <div className="patient-avatar" style={{ background: apt.isConsultation ? '#eef2ff' : (user.role === 'DOCTOR' ? '#f5f3ff' : '#ecfdf5') }}>
                                                        {apt.isConsultation ? '📹' : (user.role === 'DOCTOR' ? '🐾' : '🩺')}
                                                    </div>
                                                    <div className="name-stack">
                                                        <span className="primary-name">{user.role === "DOCTOR" ? safeText(apt.petName) : `Dr. ${safeText(apt.doctorName)}`}</span>
                                                        <span className="secondary-id">{apt.isConsultation ? 'Video Consult' : 'Clinic Visit'} • #{apt.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="name-stack">
                                                    <span className="primary-name" style={{ fontSize: '0.85rem' }}>{apt.isConsultation ? 'Online Sync' : 'In-Person'}</span>
                                                    <span className="secondary-id">{apt.isConsultation ? 'Meet' : 'Facility'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="schedule-stack">
                                                    <span className="date-text">{formatDateOnly(apt.dateTime)}</span>
                                                    <span className="time-text">{formatTimeOnly(apt.dateTime)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="status-badge" style={getStatusStyle(apt.status)}>
                                                    <span className="status-dot"></span>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            {user.role === "DOCTOR" && (
                                                <td>
                                                    <div className="name-stack">
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Veterinary Care</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>Core Clinical</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: 'center' }}>
                                                    {apt.meetingLink && apt.status.toUpperCase() === 'ACCEPTED' && (
                                                        <a href={safeText(apt.meetingLink)} target="_blank" rel="noopener noreferrer" className="join-meet-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                                                            Enter Video Room
                                                        </a>
                                                    )}
                                                    {apt.isConsultation && user.role === 'DOCTOR' && apt.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleConsultationAction(apt.id, 'accept')} className="accept-btn" style={{ padding: '10px 20px' }}>Accept Consult</button>
                                                            <button onClick={() => handleConsultationAction(apt.id, 'reject')} className="reject-btn" style={{ padding: '10px 20px' }}>Reject</button>
                                                        </>
                                                    )}
                                                    {user.role === "DOCTOR" && !apt.isConsultation && apt.status === "PENDING" && (
                                                        <button
                                                            disabled={updatingId === apt.id}
                                                            onClick={() => updateAppointmentStatus(apt.id, "CONFIRMED")}
                                                            className="btn-primary"
                                                            style={{ padding: "8px 16px", fontSize: '0.8rem' }}
                                                        >
                                                            Authorize Appointment
                                                        </button>
                                                    )}
                                                    {user.role === "DOCTOR" && (apt.status === "CONFIRMED" || (apt.isConsultation && apt.status === 'ACCEPTED')) && (
                                                        <button
                                                            disabled={updatingId === apt.id}
                                                            onClick={() => navigate('/doctor-dashboard')}
                                                            className="btn-primary"
                                                            style={{ padding: "8px 16px", fontSize: '0.8rem', background: '#10b981' }}
                                                        >
                                                            Open Doctor Workspace
                                                        </button>
                                                    )}
                                                    {user.role === "USER" && !apt.isConsultation && (apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                                                        <>
                                                            <button
                                                                onClick={() => setShowReschedule(apt.id)}
                                                                className="glass"
                                                                style={{ padding: "8px 16px", fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                onClick={() => cancelAppointment(apt.id)}
                                                                style={{ padding: "8px 16px", background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", borderRadius: "10px", fontSize: '0.8rem', fontWeight: 700 }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {showReschedule === apt.id && (
                                            <tr>
                                                <td colSpan={user.role === "DOCTOR" ? 5 : 4} style={{ padding: '0' }}>
                                                    <div style={{ padding: "2.5rem", background: 'var(--bg-main)', animation: 'fadeIn 0.4s ease' }}>
                                                        <div className="card" style={{ maxWidth: '450px', margin: '0 0 0 auto', padding: '2rem' }}>
                                                            <h4 className="mb-4">Modify Consultation Time</h4>
                                                            <input
                                                                type="datetime-local"
                                                                className="form-group"
                                                                value={newDateTime}
                                                                onChange={(e) => setNewDateTime(e.target.value)}
                                                                style={{ width: '100%', padding: '12px', marginBottom: '20px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px' }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleReschedule(apt.id)}>Apply New Schedule</button>
                                                                <button className="glass" style={{ flex: 1 }} onClick={() => setShowReschedule(null)}>Cancel Reschedule</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
