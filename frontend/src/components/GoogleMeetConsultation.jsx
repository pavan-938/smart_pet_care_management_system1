import React from 'react';

const GoogleMeetConsultation = ({ meetLink, doctor, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content consultation-modal">
                <div className="modal-header">
                    <h2>Google Meet Consultation</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="doctor-brief">
                    <span>Consulting with:</span>
                    <strong>Dr. {doctor.name} ({doctor.specialization})</strong>
                </div>
                <div className="video-call-placeholder">
                    <a href={meetLink} target="_blank" rel="noopener noreferrer" className="submit-consultation-btn" style={{marginTop: '24px', textAlign: 'center'}}>
                        Join Google Meet Consultation
                    </a>
                </div>
            </div>
        </div>
    );
};

export default GoogleMeetConsultation;
