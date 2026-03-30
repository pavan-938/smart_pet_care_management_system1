import React, { useState, useEffect } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ amount, description, onSuccess, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form states
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const formatCardNumber = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        let parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return val;
        }
    };

    const formatExpiry = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handlePay = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network request to payment gateway
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 2500);
    };

    return (
        <div className="payment-modal-overlay">
            <div className={`payment-modal-box ${success ? 'success-mode' : ''}`}>

                {/* Close Button */}
                {!loading && !success && (
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                )}

                {/* Header Section */}
                {!success && (
                    <div className="payment-modal-header">
                        <div className="merchant-info">
                            <div className="merchant-logo">SPC</div>
                            <div className="merchant-details">
                                <h3>Smart Pet Care</h3>
                                <p>{description}</p>
                            </div>
                        </div>
                        <div className="amount-display">
                            <span className="currency">₹</span>
                            {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                )}

                {/* Body Section */}
                <div className="payment-modal-body">
                    {success ? (
                        <div className="payment-success-animation">
                            <div className="success-checkmark">
                                <div className="check-icon">
                                    <span className="icon-line line-tip"></span>
                                    <span className="icon-line line-long"></span>
                                    <div className="icon-circle"></div>
                                    <div className="icon-fix"></div>
                                </div>
                            </div>
                            <h2>Payment Successful!</h2>
                            <p>Routing your request securely...</p>
                        </div>
                    ) : loading ? (
                        <div className="payment-processing">
                            <div className="modern-spinner"></div>
                            <h3>Processing Payment...</h3>
                            <p>Please do not close this window or press back</p>
                            <div className="secure-badge mt-4">
                                🔒 256-bit Secure Connection
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePay} className="payment-form">
                            <div className="payment-methods">
                                <div className="method-tab active">Credit / Debit Card</div>
                            </div>

                            <div className="card-input-group">
                                <label>Card Number</label>
                                <div className="input-with-icon">
                                    <span className="icon">💳</span>
                                    <input
                                        type="text"
                                        required
                                        maxLength="19"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="card-row">
                                <div className="card-input-group expiry-group">
                                    <label>Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="5"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                    />
                                </div>
                                <div className="card-input-group cvv-group">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength="4"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                            </div>

                            <div className="card-input-group">
                                <label>Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Name on card"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="pay-now-btn">
                                Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </button>

                            <div className="secure-badge">
                                🔒 Secured by Real-time AES Encryption
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
