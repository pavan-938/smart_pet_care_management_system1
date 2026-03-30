import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'General', 'Surgery', 'Dermatology', 'Dentistry', 'Behavior'];

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const res = await api.get('/doctors');
                setDoctors(res.data);
                setFilteredDoctors(res.data);
            } catch (err) {
                console.error("Error fetching doctors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        let result = doctors;

        // Apply Search
        if (searchQuery) {
            result = result.filter(doc => 
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply Category Filter
        if (activeCategory !== 'All') {
            result = result.filter(doc => doc.specialization.includes(activeCategory));
        }

        setFilteredDoctors(result);
    }, [searchQuery, activeCategory, doctors]);

    if (loading) return <div className="loading-container"><div className="modern-spinner"></div></div>;

    return (
        <div className="container dashboard-container">
            <header className="doctors-header">
                <h1 className="page-title">Medical Specialists</h1>
                <p>Consult with our network of board-certified veterinarians specializing in advanced clinical medicine for domestic pets.</p>
            </header>

            <div className="doctors-toolbar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name or specialty..." 
                        className="doctor-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-categories">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

                        {filteredDoctors.length > 0 ? (
                            <div className="doctors-grid">
                                {filteredDoctors.map(doc => (
                                    <div key={doc.id} className="doctor-card">
                                        <div className="doctor-icon-wrapper">
                                            <span>{doc.specialization.charAt(0)}</span>
                                        </div>
                                        <div className="doctor-card-content">
                                            <div className="doctor-rating-badge">
                                                <span>⭐</span> {doc.rating.toFixed(1)}
                                            </div>
                                            <h3>Dr. {doc.name}</h3>
                                            <p className="doctor-specialization">{doc.specialization}</p>
                                            <div className="doctor-stats-bar">
                                                <div className="stat-unit">
                                                    <label>Experience</label>
                                                    <span>{doc.experienceYears}+ Yrs</span>
                                                </div>
                                                <div className="stat-unit">
                                                    <label>Clinic Fee</label>
                                                    <span>₹{doc.consultationFee}</span>
                                                </div>
                                            </div>
                                            <div className="doctor-actions">
                                                <Link to="/book-appointment" state={{ docId: doc.id }} className="doctor-action-btn">
                                                    Book Clinic
                                                </Link>
                                                <Link to="/book-appointment" state={{ docId: doc.id, mode: 'video' }} className="doctor-action-btn primary">
                                                    Video Consult
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                <div className="no-results-state">
                    <div className="no-results-emoji">🕵️‍♂️</div>
                    <h3>No specialists found</h3>
                    <p className="text-muted">Try adjusting your filters or search terms to find matching veterinarians.</p>
                </div>
            )}
        </div>
    );
};

export default Doctors;
