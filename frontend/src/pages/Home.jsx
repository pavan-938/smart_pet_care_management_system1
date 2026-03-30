import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-wrapper">
            {/* Hero Section */}
            <section className="home-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-dot"></span>
                        VETERINARY ECOSYSTEM ALPHA
                    </div>

                    <h1 className="hero-title">
                        Advanced care for <br />
                        <span className="hero-gradient-text">the pets you love.</span>
                    </h1>

                    <p className="hero-subtitle">
                        A clinical-grade management platform for the modern pet parent.
                        Streamline vaccinations, connect with experts, and manage health records in one intelligent space.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary btn-hero-primary">
                            Get Started
                        </Link>
                        <Link to="/doctors" className="btn-hero-secondary">
                            Consult a Vet
                        </Link>
                    </div>
                </div>

                <div className="abstract-bg" style={{ top: '15%', left: '5%', width: '300px', height: '300px', background: 'rgba(79, 70, 229, 0.05)', filter: 'blur(100px)' }}></div>
                <div className="abstract-bg" style={{ bottom: '15%', right: '5%', width: '400px', height: '400px', background: 'rgba(14, 165, 233, 0.05)', filter: 'blur(120px)' }}></div>
            </section>

            {/* Feature Grid */}
            <section className="container" style={{ padding: '120px 0' }}>
                <div className="home-section-header">
                    <h2>Clinical Intelligence</h2>
                    <p>Designed to meet the highest professional standards of pet healthcare.</p>
                </div>

                <div className="feature-grid">
                    {[
                        { title: "Smart Health Records", icon: "📊", desc: "Military-grade data structures for managing complex clinical histories and PDF exports." },
                        { title: "Expert Pipeline", icon: "👨‍⚕️", desc: "Instant access to a network of board-certified veterinarians with real-time slot syncing." },
                        { title: "Proactive Compliance", icon: "🛡️", desc: "Automated vaccination scheduling and AI-driven health alerts to keep your pets safe." },
                        { title: "Curated Marketplace", icon: "🛍️", desc: "Direct access to pharmaceutical-grade supplies with secure, real-time tracking." }
                    ].map((feature, i) => (
                        <div key={i} className="card feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p className="description">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="home-highlight-section">
                    <div className="highlight-card ai">
                        <div className="highlight-icon">🧠</div>
                        <div className="highlight-text">
                            <h3>AI Diagnostic Explorer</h3>
                            <p>Query our neural veterinary engine for immediate symptom analysis and clinical insights.</p>
                            <Link to="/symptom-checker" className="highlight-link">Launch Neural Engine →</Link>
                        </div>
                    </div>
                    <div className="highlight-card video">
                        <div className="highlight-icon">📹</div>
                        <div className="highlight-text">
                            <h3>Expert Video Pipeline</h3>
                            <p>Connect with board-certified specialists instantly through our encrypted video consultation suite.</p>
                            <Link to="/doctors" className="highlight-link">Sync with Expert →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="container">
                <div className="metrics-section">
                    <div className="feature-grid">
                        <div className="metric-item">
                            <div className="metric-value" style={{ color: 'var(--primary)' }}>25k+</div>
                            <div className="metric-label">Pets Managed</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value" style={{ color: 'var(--accent)' }}>500+</div>
                            <div className="metric-label">Licensed Experts</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value" style={{ color: 'var(--primary)' }}>99.9%</div>
                            <div className="metric-label">Uptime Sync</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container" style={{ padding: '120px 0 80px' }}>
                <div className="home-cta-box">
                    <h2>The future of pet health is here.</h2>
                    <p>Join the thousands of modern pet parents leveraging the world's most advanced clinical platform.</p>
                    <Link to="/register" className="btn-primary btn-cta-light">
                        Create Your Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
