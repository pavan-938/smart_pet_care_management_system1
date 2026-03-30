import React, { useState } from 'react';
import api from '../utils/api';
import './SymptomChecker.css';

const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const commonSymptoms = ['Vomiting', 'Diarrhea', 'Itching', 'Lethargy', 'Coughing', 'Hair Loss'];

    const handlePredict = async (e) => {
        if (e) e.preventDefault();
        if (!symptoms.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const sympList = symptoms.split(',').map(s => s.trim());
            const response = await api.post('/ai/predict', { symptoms: sympList });
            setResults(response.data);
        } catch (err) {
            setError('The AI Diagnostic Engine is currently optimizing. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    const addSymptom = (s) => {
        if (symptoms.includes(s)) return;
        setSymptoms(prev => prev ? `${prev}, ${s}` : s);
    };

    return (
        <div className="container dashboard-container">
            <header className="ai-header">
                <div className="ai-badge">SMART DIAGNOSTICS PRO</div>
                <h1 className="page-title">AI Symptom Explorer</h1>
                <p>Input clinical observations to receive immediate diagnostic insights using our proprietary veterinary intelligence mapping.</p>
            </header>

            <div className="ai-explorer-grid">
                <div className="ai-input-section">
                    <div className="card ai-card glass">
                        <label className="section-label">CLINICAL OBSERVATIONS</label>
                        <textarea 
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="e.g. Vomiting, Lethargy, Coughing..."
                            className="ai-textarea"
                        />
                        
                        <div className="common-symptoms-chips">
                            {commonSymptoms.map(s => (
                                <button key={s} onClick={() => addSymptom(s)} className="symptom-chip">
                                    + {s}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="btn-primary ai-cta-btn" 
                            onClick={handlePredict}
                            disabled={loading || !symptoms.trim()}
                        >
                            {loading ? 'Analyzing Clinical Patterns...' : 'Run Neural Diagnostic'}
                        </button>
                        
                        <p className="ai-disclaimer-text">
                            ⚠️ This tool is for educational demonstrations. Any clinical emergency requires immediate contact with a physical clinic.
                        </p>
                    </div>
                </div>

                <div className="ai-results-section">
                    {results ? (
                        <div className="results-container">
                            <h3 className="results-title">DIAGNOSTIC PROBABILITY</h3>
                            <div className="prediction-list">
                                {results.predictions.map((p, idx) => (
                                    <div key={idx} className="prediction-card">
                                        <div className="prediction-header">
                                            <span className="disease-name">{p.disease}</span>
                                            <span className="confidence-pill">{p.confidence}% CONFIDENCE</span>
                                        </div>
                                        <p className="disease-desc">{p.description}</p>
                                        <div className="confidence-bar-bg">
                                            <div className="confidence-bar-fill" style={{ width: `${p.confidence}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="ai-recommended-action">
                                <h3>RECOMMENDED PROTOCOL</h3>
                                <p>Based on these findings, we recommend scheduling an urgent video consultation with a surgery or general practitioner.</p>
                                <button className="btn-secondary" onClick={() => window.location.href='/doctors'}>
                                    View Available Specialists
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="ai-idle-state card align-center">
                            <div className="ai-pulse-icon">🧠</div>
                            <h3>Diagnostic Engine Idle</h3>
                            <p>Input observations to begin clinical mapping.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymptomChecker;
