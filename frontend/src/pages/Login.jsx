import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showDevOptions, setShowDevOptions] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    const handleGoogleLoginSuccess = async (tokenResponse) => {
        try {
            // If using the standard Google Login button (credential response)
            // But here we use useGoogleLogin (code/token flow)
            // If we want the email/name, we need to fetch from userinfo endpoint or use a different flow.
            // A simpler way is to use the <GoogleLogin> component which returns a JWT.
            // Let's use useGoogleLogin with the 'implicit' flow to get an access token, 
            // then fetch user info. Or just use GoogleLogin component.
            
            // To be robust and match the backend expectation:
            // Let's fetch user profile using the access token
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await userInfoRes.json();

            const response = await fetch('/api/auth/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    name: userInfo.name,
                    role: "user"
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                const userData = data;
                if (userData.role && userData.role.startsWith('ROLE_')) {
                    userData.role = userData.role.replace('ROLE_', '');
                }
                localStorage.setItem('user', JSON.stringify(userData));
                if (setUser) setUser(userData);
                navigate('/dashboard');
                window.location.reload();
            } else {
                setError("Google Authentication Failed");
            }
        } catch (err) {
            console.error(err);
            setError("Google Service Unavailable");
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: () => setError("Google Login Failed"),
    });

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <header className="auth-header">
                    <h2>Secure Login</h2>
                    <p>Access your professional pet care dashboard.</p>
                </header>

                {error && <div className="auth-alert error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="e.g. clinic@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Secure Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            Recovery Options?
                        </Link>
                    </div>

                    <button type="submit" className="btn-primary auth-btn-blue" style={{ width: '100%', padding: '16px' }}>
                        Sign Into Platform
                    </button>
                </form>

                <div className="social-divider">
                    <div className="line"></div>
                    <span>Or continue with</span>
                    <div className="line"></div>
                </div>

                <button className="btn-social" onClick={() => googleLogin()}>
                    <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" style={{ width: '22px' }} />
                    Continue with Google
                </button>


                <div className="dev-mode-container">
                    <button 
                        type="button" 
                        className="btn-dev-toggle"
                        onClick={() => setShowDevOptions(!showDevOptions)}
                    >
                        {showDevOptions ? '🔒 Hide Developer Hub' : '🛠️ Reveal Developer Hub'}
                    </button>

                    {showDevOptions && (
                        <div className="dev-options-grid">
                            <button 
                                className="dev-chip admin"
                                onClick={() => { setEmail('admin@petcare.com'); setPassword('admin123'); }}
                            >
                                🛡️ Admin
                            </button>
                            <button 
                                className="dev-chip doctor"
                                onClick={() => { setEmail('supreeth.doc@petcare.com'); setPassword('password123'); }}
                            >
                                🩺 Doctor
                            </button>
                            <button 
                                className="dev-chip user"
                                onClick={() => { setEmail('supreeth1@gmail.com'); setPassword('password123'); }}
                            >
                                👤 User
                            </button>
                        </div>
                    )}
                </div>

                <footer className="auth-footer">
                    New to the network? <Link to="/register">Request Access</Link>
                </footer>
            </div>
        </div>
    );
};

export default Login;
