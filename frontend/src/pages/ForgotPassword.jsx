import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Check your mail for the 6-digit OTP!");
                // Optionally navigate to reset-password
                setTimeout(() => window.location.href = '/reset-password', 3000);
            } else {
                setError(data.message || 'Failed to send OTP code');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="page-container">
            <div className="card auth-card" style={{ margin: '0 auto' }}>
                <h2 className="page-title">Reset Password</h2>
                <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>
                    Enter your email address and we'll send you a recovery link.
                </p>

                {message && <div className="alert success" style={{ padding: '10px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#dcfce7', color: '#166534', textAlign: 'center' }}>{message}</div>}
                {error && <div className="alert error" style={{ padding: '10px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fee2e2', color: '#b91c1c', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>
                    <button type="submit" className="btn-primary btn-block mt-4">Send OTP Code</button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" style={{ fontWeight: 700 }}>Return to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
