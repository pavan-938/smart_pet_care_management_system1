import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🐾</span> Smart Pet Care
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-item">Home</Link>
                    <Link to="/doctors" className="nav-item">Doctors</Link>
                    <Link to="/symptom-checker" className="nav-item-highlight ai">🧠 AI Diagnostic</Link>
                    
                    {user ? (
                        <>
                            {user.role === 'USER' && (
                                <div className="nav-group">
                                    <Link to="/book-appointment?mode=video" className="nav-item-highlight video">📹 Clinic/Video</Link>
                                    <div className="dropdown">
                                        <button className="dropdown-toggle">Management ▾</button>
                                        <div className="dropdown-menu">
                                            <Link to="/my-pets">🐾 My Pets</Link>
                                            <Link to="/marketplace">🛒 Marketplace</Link>
                                            <Link to="/orders">📋 My Orders</Link>
                                            <Link to="/cart">🛍️ Cart</Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user.role === 'ADMIN' && <Link to="/admin" className="nav-item highlight-admin">🛡️ Admin Panel</Link>}
                            {user.role === 'DOCTOR' && <Link to="/doctor-dashboard" className="nav-item highlight-doctor">🩺 Doctor Terminal</Link>}

                            <div className="user-profile-nav">
                                <Link to="/profile" className="profile-shortcut">
                                    <div className="avatar-chip">{user.name?.[0]}</div>
                                </Link>
                                <NotificationCenter />
                                <button onClick={handleLogout} className="btn-logout-premium">Sign Out</button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="nav-item">Login</Link>
                            <Link to="/register" className="btn-nav-primary">Join Platform</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};


export default Navbar;
