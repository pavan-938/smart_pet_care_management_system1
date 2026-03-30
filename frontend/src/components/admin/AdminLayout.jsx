import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NotificationCenter from '../NotificationCenter';
import './AdminLayout.css';

const SIDEBAR_ITEMS = [
  { path: '/admin', label: 'Overview', icon: '📊' },
  { path: '/admin/users', label: 'User Management', icon: '👥' },
  { path: '/admin/doctor', label: 'Doctor Approvals', icon: '🩺' },
  { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { path: '/admin/marketplace', label: 'Marketplace', icon: '🛒' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/financials', label: 'Financials', icon: '💰' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/moderation', label: 'Moderation', icon: '🛡️' },
  { path: '/admin/support', label: 'Support', icon: '💬' },
  { path: '/admin/audit', label: 'Audit Logs', icon: '📋' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SIDEBAR_ITEMS.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.addEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">PetCare <span style={{ color: '#fff' }}>Pulse</span></span>
        </div>
        <nav className="admin-sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search" ref={searchRef}>
            <div className="admin-search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search modules... (Press /)" 
                className="admin-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
            
            {showResults && filteredItems.length > 0 && (
              <div className="admin-search-results">
                {filteredItems.map(item => (
                  <div 
                    key={item.path} 
                    className="search-result-item"
                    onClick={() => {
                      navigate(item.path);
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                  >
                    <span className="result-icon">{item.icon}</span>
                    <span className="result-label">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="admin-topbar-right">
            <span className="admin-badge-enterprise">ENTERPRISE</span>
            <NotificationCenter />
            <div className="admin-user-profile">
              <span className="admin-user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">Sign Out</button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
