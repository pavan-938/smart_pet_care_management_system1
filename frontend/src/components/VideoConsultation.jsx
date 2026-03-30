import React from 'react';

const VideoConsultation = ({ room, user, doctor, onClose }) => {
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
                <iframe
                    src={`https://meet.jit.si/${room}`}
                    allow="camera; microphone; fullscreen; display-capture"
                    style={{ width: '100%', height: '400px', border: 'none', borderRadius: '16px', marginTop: '24px' }}
                    title="Video Consultation"
                />
            </div>
        </div>
    );
};

export default VideoConsultation;
