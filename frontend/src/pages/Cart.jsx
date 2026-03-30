import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [razorpayKey, setRazorpayKey] = useState('');
    const [isProcessingRoute, setIsProcessingRoute] = useState(false);

    useEffect(() => {
        fetchCart();
        fetchKey();
    }, []);

    const fetchKey = async () => {
        try {
            const res = await api.get('/payments/key');
            setRazorpayKey(res.data.key);
        } catch(e) {
            console.error("Failed to load razorpay key", e);
        }
    };

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCartItems(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setLoading(false);
        }
    };

    const updateQuantity = async (id, qty) => {
        if (qty < 1) return;
        try {
            await api.put(`/cart/${id}?quantity=${qty}`);
            fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeItem = async (id) => {
        try {
            await api.delete(`/cart/${id}`);
            fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const handleCheckout = () => {
        if (!address) {
            alert('Please enter a shipping address');
            return;
        }
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (paymentMethod === 'Cash on Delivery') {
            processOrder();
        } else {
            handleRazorpayCheckout();
        }
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

    const handleRazorpayCheckout = async () => {
        setIsProcessingRoute(true);
        try {
            // 1. Place order first (UNPAID status assumed)
            const orderRes = await api.post('/marketplace/orders/place', {
                shippingAddress: address,
                paymentMethod: paymentMethod
            });
            const placedOrder = orderRes.data;

            // 2. Create Payment Order
            const payOrderRes = await api.post('/payments/create-order', {
                amount: placedOrder.totalAmount,
                orderId: placedOrder.id
            });
            const paymentDto = payOrderRes.data;

            // Handle Mock Mode
            if (paymentDto.razorpayOrderId && paymentDto.razorpayOrderId.startsWith("order_mock_")) {
                alert('Mock Payment Successful (Razorpay Keys not configured). Order Placed Successfully!');
                window.location.href = '/orders';
                return;
            }

            // 3. Initiate payment
            // Real Razorpay Flow

            // Real Razorpay Flow
            const resScript = await loadRazorpayScript();
            if (!resScript) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsProcessingRoute(false);
                return;
            }

            const petOwnerData = JSON.parse(localStorage.getItem('user') || '{}');

            const options = {
                key: razorpayKey,
                amount: Math.round(paymentDto.amount * 100), // paise
                currency: "INR",
                name: "Smart Pet Care",
                description: "Marketplace Order",
                image: "/apple-touch-icon.png",
                order_id: paymentDto.razorpayOrderId,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId: placedOrder.id
                        });
                        alert('Payment & Order Placed Successfully!');
                        window.location.href = '/orders';
                    } catch (verifyError) {
                        console.error('Payment verification failed:', verifyError);
                        alert('Payment was successful but backend verification failed.');
                    } finally {
                        setIsProcessingRoute(false);
                    }
                },
                prefill: {
                    name: petOwnerData?.name || "Pet Owner",
                    email: petOwnerData?.email || "owner@example.com",
                    contact: petOwnerData?.phone || "9999999999"
                },
                theme: {
                    color: "#6366f1"
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessingRoute(false);
                        alert('Payment cancelled. Your order will be marked as Payment Pending.');
                        window.location.href = '/orders';
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert('Payment failed: ' + response.error.description);
                setIsProcessingRoute(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Checkout error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to initiate checkout.';
            alert(`Checkout Error: ${errorMsg}`);
            setIsProcessingRoute(false);
        }
    };

    const processOrder = async () => {
        try {
            await api.post('/marketplace/orders/place', {
                shippingAddress: address,
                paymentMethod: paymentMethod
            });
            alert('Order placed successfully!');
            window.location.href = '/orders';
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to place order.');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) return <div className="loading">Loading Cart...</div>;

    return (
        <div className="cart-container">
            <h1>🛒 Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <button onClick={() => window.location.href = '/marketplace'}>Explore Marketplace Inventory</button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.productName} />
                                <div className="item-details">
                                    <h3>{item.productName}</h3>
                                    <p>Price: ₹{item.price}</p>
                                </div>
                                <div className="item-qty">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                                <div className="item-total">
                                    ₹{item.price * item.quantity}
                                </div>
                                <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑️</button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free">FREE</span>
                        </div>
                        <hr />
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{subtotal}</span>
                        </div>

                        <div className="shipping-form">
                            <label>Shipping Address</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your full address"
                            />
                        </div>

                        <div className="shipping-form" style={{ marginTop: '15px' }}>
                            <label>Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    marginTop: '5px'
                                }}
                            >
                                <option value="Cash on Delivery">Cash on Delivery</option>
                                <option value="Credit/Debit Card">Credit/Debit Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Net Banking">Net Banking</option>
                            </select>
                        </div>

                        <button className="checkout-btn" onClick={handleCheckout} disabled={isProcessingRoute}>
                            {isProcessingRoute ? (
                                <>
                                    <span className="modern-spinner" style={{"--spinner-size": "20px", display: "inline-block", marginRight: "10px"}}></span>
                                    Processing...
                                </>
                            ) : (
                                paymentMethod === 'Cash on Delivery' ? 'Place Order' : 'Authorize Secure Payment'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
