import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User, Settings, Palette } from 'lucide-react';
import api from '../utils/api';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('account');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setName(res.data.name);
                setEmail(res.data.email);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                if (err.response?.status === 401) {
                    setMessage({ type: 'error', text: 'Identity session expired. Please re-authenticate.' });
                }
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.put('/users/profile', { name });
            const updatedUser = { ...user, name: res.data.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Registry profile synchronized successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Synchronization failure. Please verify network connectivity.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container dashboard-container">
            <div className="card auth-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '0', overflow: 'hidden', border: 'none', borderRadius: '32px' }}>
                <div style={{ padding: '3rem 4rem' }}>
                    <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <h1 className="page-title" style={{ fontSize: '2.8rem', marginBottom: '0.75rem', fontWeight: 900 }}>Profile Interface</h1>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Orchestrate your identity and environment preferences.</p>
                    </header>

                    {message.text && (
                        <div className={`auth-alert ${message.type === 'success' ? 'success' : 'error'}`} style={{
                            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            padding: '20px',
                            borderRadius: '16px',
                            marginBottom: '35px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{message.type === 'success' ? '✓' : '⚠'}</span>
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
                        {/* Sidebar */}
                        <aside>
                            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '48px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '4rem',
                                    color: 'white',
                                    fontWeight: 900,
                                    margin: '0 auto 1.5rem auto',
                                    boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
                                    transform: 'rotate(-4deg)',
                                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{name}</h3>
                                <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {user?.role?.replace('ROLE_', '')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div
                                    onClick={() => setActiveTab('account')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: activeTab === 'account' ? 'var(--bg-main)' : 'transparent',
                                        color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'account' ? 800 : 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <User size={18} /> Account Info
                                </div>
                                <div
                                    onClick={() => setActiveTab('theme')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: activeTab === 'theme' ? 'var(--bg-main)' : 'transparent',
                                        color: activeTab === 'theme' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'theme' ? 800 : 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Palette size={18} /> Theme Settings
                                </div>
                                <div
                                    onClick={() => setActiveTab('preferences')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: activeTab === 'preferences' ? 'var(--bg-main)' : 'transparent',
                                        color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: activeTab === 'preferences' ? 800 : 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Settings size={18} /> Preferences
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div>
                            <form className="auth-form" onSubmit={handleUpdate}>
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <User size={20} className="text-primary" /> Identity Credentials
                                    </h4>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Display Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            style={{ borderRadius: '14px', padding: '14px 18px', fontSize: '1rem', fontWeight: 600 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Network Identifier (Email)</label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', opacity: 0.7, borderRadius: '14px', padding: '14px 18px', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    marginBottom: '2.5rem',
                                    padding: '24px',
                                    backgroundColor: activeTab === 'theme' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-main)',
                                    borderRadius: '24px',
                                    border: activeTab === 'theme' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    transition: 'all 0.4s ease',
                                    transform: activeTab === 'theme' ? 'scale(1.02)' : 'scale(1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Palette size={20} className="text-secondary" /> Theme Experience
                                            </h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                                Active Environment: <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{theme} Mode</strong>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={toggleTheme}
                                            style={{
                                                width: '100px',
                                                height: '48px',
                                                borderRadius: '24px',
                                                backgroundColor: theme === 'dark' ? 'var(--primary)' : '#e2e8f0',
                                                border: 'none',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.3s ease',
                                                transform: theme === 'dark' ? 'translateX(52px)' : 'translateX(0)',
                                                color: theme === 'dark' ? 'var(--primary)' : '#f59e0b'
                                            }}>
                                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing Identity Sync...' : 'Synchronize Profile Details'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
