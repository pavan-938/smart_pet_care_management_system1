import React from 'react';
import './ConsultationModal.css';

const ConsultationModal = ({ isOpen, onClose, doctor, meetingLink }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content consultation-modal">
                <div className="modal-header">
                    <h2>Live Video Consultation</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="doctor-brief">
                    <span>Consulting with:</span>
                    <strong>Dr. {doctor.name} ({doctor.specialization})</strong>
                </div>
                <div className="video-call-placeholder">
                    {meetingLink ? (
                        <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="submit-consultation-btn"
                            style={{ marginTop: '24px', textAlign: 'center' }}
                        >
                            Authorize & Join Clinical Session
                        </a>
                    ) : (
                        <p>The consultation link will appear here once the doctor accepts the request.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationModal;
