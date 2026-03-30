import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Marketplace.css';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchData();
        fetchCartCount();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/products/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
            setLoading(false);
        }
    };

    const fetchCartCount = async () => {
        try {
            const res = await api.get('/cart');
            setCartCount(res.data.reduce((acc, item) => acc + item.quantity, 0));
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const addToCart = async (productId) => {
        try {
            await api.post(`/cart/add?productId=${productId}&quantity=1`);
            fetchCartCount();
            alert('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.message || 'Failed to add to cart. Secure session required.');
        }
    };

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.categoryName === selectedCategory);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Synchronizing Marketplace Inventory...</div>;

    return (
        <div className="container" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>Pet Resources</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '5px' }}>Premium supplies and professional-grade nutrition</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => window.location.href = '/cart'}
                        className="btn-primary"
                        style={{ padding: '12px 28px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 }}
                    >
                        🛒 Cart Interface <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>{cartCount}</span>
                    </button>
                </div>
            </header>

            {/* Filter Hub */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button
                    className={selectedCategory === 'All' ? 'active' : ''}
                    onClick={() => setSelectedCategory('All')}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        border: '1px solid #e2e8f0',
                        background: selectedCategory === 'All' ? '#1e293b' : '#fff',
                        color: selectedCategory === 'All' ? '#fff' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    All Supplies
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={selectedCategory === cat.name ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.name)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '30px',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0',
                            background: selectedCategory === cat.name ? '#1e293b' : '#fff',
                            color: selectedCategory === cat.name ? '#fff' : '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '10px' }}>
                {filteredProducts.map(product => (
                    <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                        {/* Image Banner */}
                        <div style={{ height: '140px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                            <img
                                src={product.imageUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600'}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600';
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)' }}>
                                {product.categoryName}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{product.name}</h3>
                            </div>
                            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, flexGrow: 1 }}>
                                {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Price</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>₹{product.price.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    className="btn-primary"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>➕</span> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
