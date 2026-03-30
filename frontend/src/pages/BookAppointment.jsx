import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './BookAppointment.css';

const BookAppointment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { theme } = useTheme();
    const { docId, petId } = location.state || {};
    const shouldStartInConsultationMode = searchParams.get('mode') === 'video';

    const [doctors, setDoctors] = useState([]);
    const [pets, setPets] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(docId || '');
    const [selectedPet, setSelectedPet] = useState(petId || '');

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [reason, setReason] = useState('');
    const [razorpayKey, setRazorpayKey] = useState('');
    const [isProcessingRoute, setIsProcessingRoute] = useState(false);
    const [isConsultationMode, setIsConsultationMode] = useState(shouldStartInConsultationMode);

    const parseAvailability = (availStr) => {
        if (!availStr) return { allowedDays: [0, 1, 2, 3, 4, 5, 6], startHour: 9, endHour: 22, raw: availStr };
        try {
            const [daysPart, timePart] = availStr.split(',').map(s => s.trim());
            const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };

            let allowedDays = [0, 1, 2, 3, 4, 5, 6];
            if (daysPart.includes('-')) {
                const [startDay, endDay] = daysPart.split('-').map(s => s.trim());
                let startIdx = dayMap[startDay];
                let endIdx = dayMap[endDay];
                if (startIdx !== undefined && endIdx !== undefined) {
                    allowedDays = [];
                    let i = startIdx;
                    while (true) {
                        allowedDays.push(i);
                        if (i === endIdx) break;
                        i = (i + 1) % 7;
                    }
                }
            }

            let startHour = 9;
            let endHour = 22;
            if (timePart && timePart.includes('-')) {
                const [startTime, endTime] = timePart.split('-').map(s => s.trim());
                const parseTime = (t) => {
                    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (match) {
                        let h = parseInt(match[1]);
                        const isPM = match[3].toUpperCase() === 'PM';
                        if (isPM && h !== 12) h += 12;
                        if (!isPM && h === 12) h = 0;
                        return h + parseInt(match[2]) / 60;
                    }
                    return null;
                };
                let ps = parseTime(startTime);
                let pe = parseTime(endTime);
                if (ps !== null) startHour = ps;
                if (pe !== null) endHour = pe;
            }
            return { allowedDays, startHour, endHour, raw: availStr };
        } catch (e) {
            return { allowedDays: [0, 1, 2, 3, 4, 5, 6], startHour: 9, endHour: 22, raw: availStr };
        }
    };

    const selectedDocObj = doctors.find(d => d.id.toString() === selectedDoctor.toString());
    const docAvailability = parseAvailability(selectedDocObj?.availability);

    const isWorkingDay = (dateStr) => {
        if (!dateStr || !selectedDocObj) return true;
        const [y, m, d] = dateStr.split('-');
        const dateObj = new Date(y, m - 1, d);
        return docAvailability.allowedDays.includes(dateObj.getDay());
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docRes, petRes, keyRes] = await Promise.all([
                    api.get('/doctors'),
                    api.get('/pets/my-pets'),
                    api.get('/payments/key')
                ]);
                setDoctors(docRes.data);
                setPets(petRes.data);
                setRazorpayKey(keyRes.data.key);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    const parseBackendDate = (dt) => {
        if (Array.isArray(dt)) {
            const [y, m, d, h = 0, mn = 0, s = 0] = dt;
            return new Date(y, m - 1, d, h, mn, s);
        }
        return new Date(dt);
    };

    useEffect(() => {
        let intervalId;
        const fetchBusySlots = async () => {
            if (!selectedDoctor) return;
            try {
                const [appointmentsRes, consultationsRes] = await Promise.all([
                    api.get(`/appointments/doctor/${selectedDoctor}`),
                    api.get(`/consultations/doctor/${selectedDoctor}`)
                ]);

                const appointmentSlots = appointmentsRes.data
                    .filter(a => a.status !== 'CANCELLED')
                    .filter(a => parseBackendDate(a.dateTime) > new Date());

                const consultationSlots = consultationsRes.data
                    .filter(c => c.status !== 'REJECTED')
                    .filter(c => parseBackendDate(c.meetingTime) > new Date())
                    .map(c => ({
                        ...c,
                        dateTime: c.meetingTime
                    }));

                setBusySlots([...appointmentSlots, ...consultationSlots]);
            } catch (err) {
                console.error("Error fetching busy slots:", err);
            }
        };

        if (selectedDoctor) {
            fetchBusySlots();
            intervalId = setInterval(fetchBusySlots, 5000);
        } else {
            setBusySlots([]);
        }

        return () => { if (intervalId) clearInterval(intervalId); };
    }, [selectedDoctor]);

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour <= 23; hour++) {
            for (let min of ['00', '30']) {
                const floatTime = hour + (min === '30' ? 0.5 : 0);
                if (floatTime >= docAvailability.startHour && floatTime < docAvailability.endHour) {
                    slots.push(`${hour.toString().padStart(2, '0')}:${min}`);
                }
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const isSlotDisabled = (timeStr) => {
        if (!selectedDate) return true;
        const slotDateTime = new Date(`${selectedDate}T${timeStr}:00`);
        const now = new Date();
        if (slotDateTime <= now) return true;
        return busySlots.some(app => {
            const appDate = parseBackendDate(app.dateTime);
            return appDate.getTime() === slotDateTime.getTime();
        });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTimeSlot) {
            alert('Please select an available time slot.');
            return;
        }

        const finalDateTime = `${selectedDate}T${selectedTimeSlot}:00`;
        setIsProcessingRoute(true);

        try {
            if (isConsultationMode) {
                const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                await api.post('/consultations/request', {
                    userId: userObj.id,
                    doctorId: selectedDoctor,
                    petName: pets.find(p => p.id.toString() === selectedPet.toString())?.name || "Pet",
                    petType: pets.find(p => p.id.toString() === selectedPet.toString())?.species || "Other",
                    problemDescription: reason,
                    meetingTime: finalDateTime
                });
                alert('Video Consultation Requested Successfully!');
                setIsProcessingRoute(false);
                navigate('/dashboard');
                return;
            }

            const bookRes = await api.post('/appointments/book', {
                doctorId: selectedDoctor,
                petId: selectedPet,
                dateTime: finalDateTime,
                reason: reason
            });
            const appointment = bookRes.data;

            const orderRes = await api.post('/payments/create-order', {
                amount: selectedDocObj?.consultationFee || 500.0,
                appointmentId: appointment.id
            });
            const paymentDto = orderRes.data;

            // REAL RAZORPAY FLOW ONLY
            const resScript = await loadRazorpayScript();
            if (!resScript) {
                alert('Razorpay SDK failed to load.');
                setIsProcessingRoute(false);
                return;
            }

            const petOwnerData = JSON.parse(localStorage.getItem('user') || '{}');
            const options = {
                key: razorpayKey,
                amount: Math.round(paymentDto.amount * 100),
                currency: "INR",
                name: "Smart Pet Care",
                description: `Consultation with Dr. ${selectedDocObj?.name}`,
                order_id: paymentDto.razorpayOrderId,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            appointmentId: appointment.id
                        });
                        alert('Payment & Appointment Booked Successfully!');
                        navigate('/dashboard');
                    } catch (verifyError) {
                        alert('Verification failed. Contact support.');
                    } finally {
                        setIsProcessingRoute(false);
                    }
                },
                prefill: {
                    name: petOwnerData?.name || "Pet Owner",
                    email: petOwnerData?.email || "owner@example.com",
                    contact: petOwnerData?.phone || "9999999999"
                },
                theme: { color: "#6366f1" },
                modal: {
                    ondismiss: function() {
                        setIsProcessingRoute(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert('Payment failed: ' + response.error.description);
                setIsProcessingRoute(false);
            });
            rzp.open();

        } catch (err) {
            setIsProcessingRoute(false);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Booking failed.';
            alert(`Error: ${errorMsg}`);
        }
    };

    return (
        <div className="container booking-container">
            <header className="booking-header">
                <h2>Schedule Consultation</h2>
                <p>Register for expert clinical care with our certified specialists.</p>
            </header>

            <div className="booking-grid">
                {/* DOCTOR PREVIEW SIDEBAR */}
                <aside className="doctor-preview-card">
                    {selectedDocObj ? (
                        <div className="preview-content">
                            <div className="preview-avatar-wrapper">
                                <img
                                    src={selectedDocObj.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=600"}
                                    alt={selectedDocObj.name}
                                    className="preview-avatar"
                                />
                            </div>
                            <div className="preview-info">
                                <span className="preview-specialty">{selectedDocObj.specialization}</span>
                                <h3>Dr. {selectedDocObj.name}</h3>
                                <div className="preview-meta">
                                    <div className="meta-row">
                                        <span>📍</span>
                                        <span>{selectedDocObj.clinicAddress || "Primary Care Center"}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span>🕒</span>
                                        <span>Working: {selectedDocObj.availability || "Mon-Fri"}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span>⭐</span>
                                        <span>{selectedDocObj.experienceYears}+ Years Experience</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="preview-content text-center" style={{padding: '2rem 0'}}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🩺</div>
                            <p className="text-muted">Select a veterinarian to view their profile details here.</p>
                        </div>
                    )}
                </aside>

                {/* BOOKING FORM */}
                <main className="booking-form-card">
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h4><span>1.</span> Select Professional</h4>
                            <select
                                value={selectedDoctor}
                                onChange={e => {
                                    setSelectedDoctor(e.target.value);
                                    setSelectedTimeSlot('');
                                }}
                                required
                            >
                                <option value="">-- Choose a Veterinarian --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.name} ({doc.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-section">
                            <h4><span>2.</span> Select Patient</h4>
                            <select
                                value={selectedPet}
                                onChange={e => setSelectedPet(e.target.value)}
                                required
                            >
                                <option value="">-- Choose your Pet --</option>
                                {pets.map(pet => (
                                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-section">
                            <h4><span>3.</span> Choose Date</h4>
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTimeSlot('');
                                }}
                                required
                            />
                            {selectedDoctor && selectedDate && !isWorkingDay(selectedDate) && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 'bold' }}>
                                    ⚠️ Dr. {selectedDocObj.name} is not available on this day.
                                </p>
                            )}
                        </div>

                        {selectedDoctor && selectedDate && isWorkingDay(selectedDate) && (
                            <div className="form-section">
                                <h4><span>4.</span> Select Available Slot</h4>
                                <div className="slot-grid">
                                    {timeSlots.map(time => {
                                        const disabled = isSlotDisabled(time);
                                        const selected = selectedTimeSlot === time;
                                        return (
                                            <div
                                                key={time}
                                                className={`slot-btn ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                                                onClick={() => !disabled && setSelectedTimeSlot(time)}
                                            >
                                                {time}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedTimeSlot && (
                            <div className="form-section">
                                <div className="flex items-center gap-4 mb-4">
                                    <input
                                        type="checkbox"
                                        id="videoConsultBox"
                                        checked={isConsultationMode}
                                        onChange={e => setIsConsultationMode(e.target.checked)}
                                        className="w-5 h-5 accent-blue-600"
                                    />
                                    <label htmlFor="videoConsultBox" className="font-bold text-blue-600 text-lg cursor-pointer">
                                        📹 Request Video Consultation
                                    </label>
                                </div>
                                <h4><span>5.</span> Reason for Visit</h4>
                                <textarea
                                    className="booking-reason-textarea"
                                    placeholder="Briefly describe the pet's problem or reason for this appointment..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        minHeight: '100px',
                                        marginTop: '10px'
                                    }}
                                />
                            </div>
                        )}

                        {selectedTimeSlot && (
                            <div className="booking-summary">
                                <div className="summary-row">
                                    <span>Consultation Fee</span>
                                    <span>₹{selectedDocObj?.consultationFee || 500}</span>
                                </div>
                                <div className="summary-row" style={{color: '#10b981'}}>
                                    <span>Service Fee</span>
                                    <span>₹0 (Waived)</span>
                                </div>
                                <div className="summary-total">
                                    <span>Grand Total</span>
                                    <span>₹{selectedDocObj?.consultationFee || 500}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary btn-confirm-booking"
                            disabled={!selectedTimeSlot || (selectedDoctor && !isWorkingDay(selectedDate)) || isProcessingRoute}
                        >
                            {isProcessingRoute ? (
                                <>
                                    <span className="modern-spinner" style={{"--spinner-size": "20px"}}></span>
                                    Verifying...
                                </>
                            ) : (
                                isConsultationMode ? "Request Video Consultation" : "Authorize Payment & Secure Slot"
                            )}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default BookAppointment;
