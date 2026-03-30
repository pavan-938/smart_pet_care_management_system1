import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PetHealth = () => {
    const { id: petId } = useParams();
    const { user } = useContext(AuthContext);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [chartType, setChartType] = useState('weight');

    const [formData, setFormData] = useState({
        petId: petId,
        recordType: "",
        description: "",
        weight: "",
        vaccineName: "",
        nextDueDate: "",
        precautions: "",
        activityLevel: "",
        calories: ""
    });

    useEffect(() => {
        fetchRecords();
    }, [petId]);

    const fetchRecords = async () => {
        try {
            const res = await api.get(`/health-records/pet/${petId}`);
            setRecords(res.data);
        } catch (err) {
            console.error("Error fetching records:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/health-records/pet/${petId}/report`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `health_report_${petId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading report:", err);
            alert("Failed to download report. Please try again.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/health-records/add", formData);
            setRecords([res.data, ...records]);
            setShowForm(false);
            alert("Health record added successfully!");
        } catch (err) {
            console.error("Error adding record:", err);
            alert("Failed to add record");
        }
    };

    const getDueStatus = (date) => {
        if (!date) return { type: "normal", text: "N/A" };
        const due = new Date(date);
        const today = new Date();
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { type: "overdue", text: "Overdue!" };
        if (diff <= 7) return { type: "soon", text: `Due in ${diff} days` };
        return { type: "normal", text: "Scheduled" };
    };

    // Clinical Analytics
    const weightRecords = records.filter(r => r.weight);
    const avgWeight = weightRecords.length > 0
        ? (weightRecords.reduce((acc, r) => acc + Number(r.weight), 0) / weightRecords.length).toFixed(1)
        : "N/A";

    const lastWeight = weightRecords.length > 0 ? weightRecords[0].weight : null;
    const weightDiff = weightRecords.length > 1
        ? (lastWeight - weightRecords[1].weight).toFixed(1)
        : 0;

    const upcomingVaccines = records.filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date()).length;

    if (loading) {
        return <div style={{ padding: "40px" }}>Loading health records...</div>;
    }

    return (
        <div className="container" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>Clinical Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '5px' }}>Holistic health monitoring & medical history</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {user.role === "USER" && (
                        <button onClick={handleDownloadReport} className="btn-secondary" style={{ padding: "12px 24px", borderRadius: "10px", display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                            📄 Generate Medical Archive
                        </button>
                    )}
                    {user.role === "DOCTOR" && (
                        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: "12px 24px", borderRadius: "10px", fontWeight: 600 }}>
                            {showForm ? "Abort Clinical Entry" : "+ Log New Clinical Session"}
                        </button>
                    )}
                </div>
            </div>

            {/* Smart Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Average Weight', value: `${avgWeight} Kg`, color: '#2563eb' },
                    { label: 'Weight Trend', value: `${weightDiff > 0 ? '+' : ''}${weightDiff} Kg`, color: weightDiff >= 0 ? '#16a34a' : '#dc2626' },
                    { label: 'Vaccines Pending', value: upcomingVaccines, color: '#ea580c' },
                    { label: 'Total Records', value: records.length, color: '#1e293b' }
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '25px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                        <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Multi-Metric Health Charts */}
            <div className="card" style={{ padding: "3rem", marginBottom: "40px", borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "2.5rem" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Health Visualizations</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0' }}>Biometric tracking over time</p>
                    </div>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', gap: '5px' }}>
                        {[
                            { id: 'weight', label: 'Weight (Kg)' },
                            { id: 'activity', label: 'Activity (1-10)' },
                            { id: 'calories', label: 'Nutrition (Kcal)' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setChartType(type.id)}
                                style={{
                                    border: 'none',
                                    background: chartType === type.id ? '#fff' : 'transparent',
                                    color: chartType === type.id ? '#2563eb' : '#64748b',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: chartType === type.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ height: "400px" }}>
                    <Line
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#0f172a',
                                    padding: 15,
                                    cornerRadius: 10,
                                    titleFont: { size: 14, weight: 'bold' },
                                    bodyFont: { size: 14 },
                                    displayColors: false
                                }
                            },
                            scales: {
                                y: {
                                    grid: { color: '#f1f5f9' },
                                    ticks: { color: '#64748b', font: { weight: 500 } }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: '#64748b', font: { weight: 500 } }
                                }
                            }
                        }}
                        data={{
                            labels: records.filter(r => r[chartType] !== null && r[chartType] !== undefined && r[chartType] !== "")
                                .map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).reverse(),
                            datasets: [{
                                label: chartType === 'weight' ? 'Weight (Kg)' : chartType === 'activity' ? 'Activity Level' : 'Calories',
                                data: records.filter(r => r[chartType] !== null && r[chartType] !== undefined && r[chartType] !== "")
                                    .map(r => r[chartType]).reverse(),
                                borderColor: chartType === 'weight' ? '#2563eb' : chartType === 'activity' ? '#16a34a' : '#ea580c',
                                backgroundColor: chartType === 'weight' ? 'rgba(37, 99, 235, 0.08)' : chartType === 'activity' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(234, 88, 12, 0.08)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                                pointBackgroundColor: '#fff',
                                pointBorderColor: chartType === 'weight' ? '#2563eb' : chartType === 'activity' ? '#16a34a' : '#ea580c',
                                pointBorderWidth: 3
                            }]
                        }}
                    />
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: "40px", padding: '2.5rem', borderRadius: '20px', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.6rem', fontWeight: 700 }}>Clinical Entry Form</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Observation Type</label>
                                <input name="recordType" placeholder="Vaccination, Surgery, Routine Checkup..." required onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Current Weight (Kg)</label>
                                <input type="number" step="0.1" name="weight" placeholder="0.0" onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Medicine/Vaccine Applied</label>
                                <input name="vaccineName" placeholder="Product name or N/A" onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Activity Level (1-10)</label>
                                <input type="number" min="1" max="10" name="activityLevel" placeholder="10" onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Daily Calorie Intake</label>
                                <input type="number" name="calories" placeholder="e.g. 500" onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Next Scheduled Checkup</label>
                                <input type="date" name="nextDueDate" onChange={handleChange}
                                    style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Medical Summary</label>
                            <textarea name="description" placeholder="Enter findings, prescriptions, and advice..." rows="3" onChange={handleChange}
                                style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Precautions & Home Care</label>
                            <textarea name="precautions" placeholder="List dietary restrictions, activity limits, or signs to look for..." rows="3" onChange={handleChange}
                                style={{ width: "100%", padding: "14px", borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button type="submit" className="btn-primary" style={{ padding: "14px 40px", borderRadius: "10px", fontSize: '1rem' }}>Synchronize Clinical Data</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: "14px 40px", borderRadius: "10px" }}>Cancel Entry</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569' }}>Clinical Event</th>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569' }}>Medical Observations</th>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569' }}>Vitals</th>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569' }}>Treatment</th>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569' }}>Precautions</th>
                                <th style={{ padding: '1.5rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>No clinical history found for this patient.</td></tr>
                            ) : (
                                records.map((record) => {
                                    const status = getDueStatus(record.nextDueDate);
                                    return (
                                        <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.1rem' }}>{record.recordType}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontSize: '0.95rem', color: '#334155', maxWidth: '350px', lineHeight: '1.6' }}>{record.description}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                {record.weight ? <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{record.weight} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Kg</span></div> : '—'}
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                {record.vaccineName ? <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>🛡️ {record.vaccineName}</span> : 'None'}
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 600, fontStyle: 'italic' }}>{record.precautions || 'Standard Care'}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                {record.nextDueDate ? (
                                                    <div style={{
                                                        background: status.type === "overdue" ? "#fef2f2" : status.type === "soon" ? "#fffbeb" : "#f0f9ff",
                                                        color: status.type === "overdue" ? "#991b1b" : status.type === "soon" ? "#92400e" : "#075985",
                                                        padding: '10px 15px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block', border: `1px solid ${status.type === "overdue" ? "#fee2e2" : "#fde68a"}`
                                                    }}>
                                                        <div>{new Date(record.nextDueDate).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>{status.text}</div>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PetHealth;