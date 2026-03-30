import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/marketplace/orders/my-orders');
            // Sort by Date descending so newest is on top
            const sortedOrders = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setOrders(sortedOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const getStatusIndex = (status) => {
        const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];
        // Treat COMPLETED like DELIVERED for the timeline
        if (status === 'COMPLETED') return 5;
        const index = statuses.indexOf(status?.toUpperCase());
        return index !== -1 ? index : 0;
    };

    const getTimelineSteps = (status) => {
        const isCancelled = status?.toUpperCase() === 'CANCELLED';
        const currentIndex = getStatusIndex(status);

        if (isCancelled) {
            return [
                { label: 'Order Placed', completed: true },
                { label: 'Cancelled', completed: true, isError: true }
            ];
        }

        return [
            { label: 'Order Placed', completed: currentIndex >= 0 },
            { label: 'Processing', completed: currentIndex >= 1 },
            { label: 'Shipped', completed: currentIndex >= 2 },
            { label: 'Out for Delivery', completed: currentIndex >= 3 },
            { label: 'Delivered', completed: currentIndex >= 4 || currentIndex === 5 } // 5 is COMPLETED
        ];
    };

    if (loading) return <div className="loading">Loading your orders...</div>;

    return (
        <div className="orders-container">
            <h1>📦 Track Your Orders</h1>
            <p className="orders-subtitle">View and track the status of your recent purchases</p>

            {orders.length === 0 ? (
                <div className="no-orders-wrapper">
                    <p>You haven't placed any orders yet.</p>
                    <button className="shop-btn" onClick={() => window.location.href = '/marketplace'}>Start Shopping</button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => {
                        const steps = getTimelineSteps(order.status);

                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-meta">
                                        <div>
                                            <span className="meta-label">Order placed</span>
                                            <span className="meta-value">{new Date(order.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="meta-label">Total</span>
                                            <span className="meta-value">₹{order.totalAmount}</span>
                                        </div>
                                        <div>
                                            <span className="meta-label">Ship To</span>
                                            <span className="meta-value address-truncate" title={order.shippingAddress}>{order.shippingAddress}</span>
                                        </div>
                                    </div>
                                    <div className="order-id">
                                        <span>Order # {order.id}</span>
                                        <a href={`#`} className="view-details-link">View Details</a>
                                    </div>
                                </div>

                                {/* Timeline Tracker */}
                                <div className="tracking-section">
                                    <div className="tracking-status-text">
                                        <h3>
                                            {order.status?.toUpperCase() === 'CANCELLED'
                                                ? 'Order Cancelled'
                                                : `Arriving expectedly by ${new Date(new Date(order.orderDate).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
                                        </h3>
                                        {/* Simple assumption: 4 days approx delivery */}
                                    </div>

                                    <div className="timeline-container">
                                        {steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <div className="timeline-step">
                                                    <div className={`timeline-icon ${step.completed ? 'completed' : ''} ${step.isError ? 'error' : ''}`}>
                                                        {step.completed ? '✓' : ''}
                                                    </div>
                                                    <div className={`timeline-label ${step.completed ? 'completed-label' : ''} ${step.isError ? 'error-label' : ''}`}>
                                                        {step.label}
                                                    </div>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`timeline-connector ${steps[index + 1].completed ? 'completed-connector' : ''}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="order-items">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="order-item">
                                            {/* We might not have item image directly in Dto if it's simplified, fallback logic */}
                                            <div className="item-image-placeholder">
                                                🛒
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.productName || 'Product Name'}</h4>
                                                <p className="item-price">₹{item.price} x {item.quantity}</p>
                                                <div className="item-actions">
                                                    <button className="btn-secondary">Buy it again</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
