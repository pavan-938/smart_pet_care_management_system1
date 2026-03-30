import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminPages.css';

const AdminMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/products/categories')])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data);
        setCategories(cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleUpdateStock = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        ...product,
        stockQuantity: 0,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: 0 } : p)));
    } catch (err) {
      alert('Failed to update stock.');
    }
  };

  if (loading) return <div className="admin-loading">Loading products...</div>;

  return (
    <>
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1 className="admin-page-title">Marketplace</h1>
          <p className="admin-page-subtitle">Manage products, inventory, and listings.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => alert('Add product form – implement as needed')}>
          <svg className="admin-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Product
        </button>
      </div>

      <div className="admin-section-block">
        <h3 className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </span> 
          Deals of the Week
        </h3>
        <div className="admin-product-grid">
          {products.map((product) => (
            <div key={product.id} className="admin-product-card">
              <div className="admin-product-card-badge">-20%</div>
              <div className="admin-product-card-image">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'}
                  alt={product.name}
                  onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400')}
                />
              </div>
              <span className="admin-product-featured">FEATURED</span>
              <h4 className="admin-product-name">{product.name}</h4>
              <div className="admin-product-stars">★★★★☆</div>
              <div className="admin-product-meta">
                <span>₹{Number(product.price || 0).toLocaleString()}</span>
                <span>Stock: {product.stockQuantity ?? 0}</span>
              </div>
              <div className="admin-product-actions">
                <button className="admin-btn-outline" onClick={() => setEditingProduct(product)}>Edit</button>
                <button className="admin-btn-outline admin-btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
              </div>
              <button
                className="admin-btn-out-of-stock"
                onClick={() => handleUpdateStock(product)}
                disabled={product.stockQuantity === 0}
              >
                Mark Out of Stock
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setEditingProduct(null)}>×</button>
            <h3>Edit Product</h3>
            <p>Product ID: {editingProduct.id}</p>
            <p>Use backend API to update. Close and implement full form as needed.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMarketplace;
