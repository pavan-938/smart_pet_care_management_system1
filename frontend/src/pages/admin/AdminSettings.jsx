import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initial state matching the current setup
    const [settings, setSettings] = useState({
        platformName: 'Smart Pet Care',
        supportEmail: 'support@petcare.com',
        googleClientId: '868220003628-i7u5f17us1euq0an8ji1m0n2237joshi.apps.googleusercontent.com',
        razorpayKey: 'rzp_test_placeholder',
        maintenanceMode: false,
        enableRegistration: true,
        sessionTimeout: 60
    });

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1200);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="settings-container">
            <div className="admin-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-page-title">Executive Settings</h1>
                        <p className="admin-page-subtitle">Platform-wide governance and cryptographic configuration.</p>
                    </div>
                    <button 
                        className={`btn-save-settings ${isSaving ? 'loading' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Synchronizing...' : (showSuccess ? '✓ Protocol Updated' : 'Push Configuration')}
                    </button>
                </div>
            </div>

            <div className="settings-grid">
                <aside className="settings-nav">
                    <button 
                        className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <span className="icon">🏢</span> General
                    </button>
                    <button 
                        className={`settings-nav-item ${activeTab === 'integration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('integration')}
                    >
                        <span className="icon">🔌</span> Integration
                    </button>
                    <button 
                        className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <span className="icon">🛡️</span> Security
                    </button>
                    <button 
                        className={`settings-nav-item ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <span className="icon">🧪</span> Advanced
                    </button>
                </aside>

                <main className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-card animate-fadeIn">
                            <h3 className="card-title">Branding & Identity</h3>
                            <div className="form-group">
                                <label>Platform Name</label>
                                <input 
                                    name="platformName"
                                    value={settings.platformName}
                                    onChange={handleChange}
                                    className="settings-input"
                                />
                                <small className="input-hint">Public title displayed across the veterinary ecosystem.</small>
                            </div>
                            <div className="form-group">
                                <label>Support & Governance Email</label>
                                <input 
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="settings-input"
                                />
                                <small className="input-hint">Destination for system alerts and medical vetting queries.</small>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integration' && (
                        <div className="settings-card animate-fadeIn">
                            <h3 className="card-title">Authentication & Payments</h3>
                            <div className="form-group">
                                <label>Google OAuth Client Identity</label>
                                <input 
                                    name="googleClientId"
                                    value={settings.googleClientId}
                                    onChange={handleChange}
                                    className="settings-input mono"
                                />
                                <small className="input-hint">Critical for 'Sign in with Google' functionality.</small>
                            </div>
                            <div className="form-group">
                                <label>Razorpay Merchant Key (ID)</label>
                                <input 
                                    name="razorpayKey"
                                    value={settings.razorpayKey}
                                    onChange={handleChange}
                                    className="settings-input mono"
                                    placeholder="rzp_live_..."
                                />
                                <small className="input-hint">Live credential for transaction processing.</small>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-card animate-fadeIn">
                            <h3 className="card-title">Access Governance</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="toggle-label">
                                        <span>Maintenance Protocol</span>
                                        <input 
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <small className="input-hint">Restrict access to administrators during system upgrades.</small>
                                </div>
                                <div className="form-group">
                                    <label className="toggle-label">
                                        <span>User Onboarding</span>
                                        <input 
                                            type="checkbox"
                                            name="enableRegistration"
                                            checked={settings.enableRegistration}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <small className="input-hint">Enable or disable new user account creation.</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="settings-card animate-fadeIn">
                            <h3 className="card-title">System Diagnostics</h3>
                            <div className="advanced-actions">
                                <div className="action-item">
                                    <div>
                                        <strong>Cache Purge</strong>
                                        <p>Clear all system-wide cached metadata.</p>
                                    </div>
                                    <button className="btn-outline-small">Execute</button>
                                </div>
                                <div className="action-item">
                                    <div>
                                        <strong>Audit Logs Export</strong>
                                        <p>Generate CSV of last 30 days of platform activity.</p>
                                    </div>
                                    <button className="btn-outline-small">Download</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
