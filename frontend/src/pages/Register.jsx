import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'USER',
        specialization: '',
        experienceYears: '',
        clinicAddress: '',
        consultationFee: ''
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const extraData = formData.role === 'DOCTOR' ? {
                specialization: formData.specialization,
                experienceYears: parseInt(formData.experienceYears) || 0,
                clinicAddress: formData.clinicAddress,
                consultationFee: parseFloat(formData.consultationFee) || 0
            } : {};

            const result = await register(formData.name, formData.email, formData.password, formData.role, extraData);
            if (result.success) {
                alert('Registration Successful! Your medical credentials have been submitted for administrative review.');
                navigate('/login');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("The registration service is currently under maintenance.");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <header className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join our professional veterinary network today.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Legal Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Alexander Pierce"
                        />
                    </div>
                    <div className="form-group">
                        <label>Business Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="name@ecosystem.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Secure Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="At least 8 characters"
                        />
                    </div>
                    <div className="form-group">
                        <label>Account Specification</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="USER">Standard Pet Owner</option>
                            <option value="DOCTOR">Medical Professional</option>
                        </select>
                    </div>

                    {formData.role === 'DOCTOR' && (
                        <div className="doctor-extra-fields" style={{ animation: 'fadeIn 0.3s ease', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Professional Credentials</h4>
                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    required
                                    placeholder="e.g. Cardiology, Surgery"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Experience (Years)</label>
                                    <input
                                        type="number"
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                        required
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.consultationFee}
                                        onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                                        required
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Clinic / Practice Address</label>
                                <textarea
                                    value={formData.clinicAddress}
                                    onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                                    required
                                    placeholder="Full street address of your practice"
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', minHeight: '80px' }}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', marginTop: '1rem' }}>
                        {formData.role === 'DOCTOR' ? 'Submit Credentials' : 'Initialize Account'}
                    </button>
                </form>

                <footer className="auth-footer">
                    Already part of the network? <Link to="/login">Sign In</Link>
                </footer>
            </div>
        </div>
    );
};

export default Register;
