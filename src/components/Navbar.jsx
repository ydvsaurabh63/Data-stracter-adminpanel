import React from 'react';
import { Camera, LayoutDashboard, Users, MessageSquareQuote, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { admin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand" onClick={() => setCurrentTab('scan')}>
          <div className="brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div className="brand-name">{admin?.restaurantName || 'Client Portal'}</div>
            <div className="brand-subtitle">Client Portal</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn scan-action ${currentTab === 'scan' ? 'active' : ''}`}
            onClick={() => setCurrentTab('scan')}
          >
            <Camera size={18} />
            <span>Scan Bill</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'customers' ? 'active' : ''}`}
            onClick={() => setCurrentTab('customers')}
          >
            <Users size={18} />
            <span>Customers & Visits</span>
          </button>

          <button
            className={`nav-btn ${currentTab === 'marketing' ? 'active' : ''}`}
            onClick={() => setCurrentTab('marketing')}
          >
            <MessageSquareQuote size={18} />
            <span>Offers & WhatsApp</span>
          </button>

          <button
            className="nav-btn"
            style={{ marginLeft: '8px', color: '#94a3b8' }}
            onClick={logout}
            title="Log out"
          >
            <LogOut size={17} />
          </button>
        </nav>
      </div>
    </header>
  );
};
