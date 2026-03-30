import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Payments = () => {
    // This assumes backend has an endpoint for payments history
    // I haven't created one explicitly in PaymentController but I can list appointments that are COMPLETED/CONFIRMED
    // Or I need to add GET /payments/my-payments

    // For now, I'll show a placeholder as I didn't add the endpoint in backend plan
    return (
        <div style={{ padding: '2rem' }}>
            <h2>Payment History</h2>
            <p>Feature under construction. Please check your Dashboard for appointment status.</p>
        </div>
    );
};

export default Payments;
