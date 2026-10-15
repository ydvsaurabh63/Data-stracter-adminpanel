import React, { useState } from 'react';
import {
  Camera,
  LayoutDashboard,
  Users,
  MessageSquareQuote,
  LogOut,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Wrench,
  Smartphone,
  ShoppingCart,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentTab, setCurrentTab, activeClient, onGoToSuperAdmin }) => {
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const clientName = activeClient?.name || admin?.restaurantName || 'Restaurant';
  const category = activeClient?.category || admin?.category || 'Restaurant';

  const renderBrandIcon = (size = 20) => {
    const isCafe = category === 'Cafe' || clientName.toLowerCase().includes('cafe');
    if (isCafe) {
      return <Coffee size={size} strokeWidth={2.2} />;
    }

    switch (category) {
      case 'Garments & Fashion':
        return <ShoppingBag size={size} strokeWidth={2.2} />;
      case 'Hardware & Sanitary':
        return <Wrench size={size} strokeWidth={2.2} />;
      case 'Electronics & Mobile':
        return <Smartphone size={size} strokeWidth={2.2} />;
      case 'Grocery & Supermarket':
        return <ShoppingCart size={size} strokeWidth={2.2} />;
      case 'General Retail Store':
        return <Store size={size} strokeWidth={2.2} />;
      case 'Restaurant':
      default:
        return <UtensilsCrossed size={size} strokeWidth={2.2} />;
    }
  };

  return (
    <>
      {/* Mobile & Tablet Top Header */}
      <div className="mobile-header">
        <div className="brand" onClick={() => handleTabClick('scan')}>
          <div className="brand-icon" style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderBrandIcon(18)}
          </div>
          <div className="brand-name" style={{ fontSize: '0.96rem' }}>
            {clientName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)}></div>
      )}

      {/* Left Sidebar (Desktop Fixed, Mobile/Tablet Slide-out Drawer) */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand" onClick={() => handleTabClick('scan')}>
            <div className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderBrandIcon(20)}
            </div>
            <div>
              <div className="brand-name">{clientName}</div>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${currentTab === 'scan' ? 'active' : ''}`}
            onClick={() => handleTabClick('scan')}
          >
            <Camera size={18} />
            <span className="sidebar-link-text">Scan Bill</span>
          </button>

          <button
            className={`sidebar-link ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span className="sidebar-link-text">Dashboard</span>
          </button>

          <button
            className={`sidebar-link ${currentTab === 'customers' ? 'active' : ''}`}
            onClick={() => handleTabClick('customers')}
          >
            <Users size={18} />
            <span className="sidebar-link-text">Customers</span>
          </button>

          <button
            className={`sidebar-link ${currentTab === 'marketing' ? 'active' : ''}`}
            onClick={() => handleTabClick('marketing')}
          >
            <MessageSquareQuote size={18} />
            <span className="sidebar-link-text">Offers</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Thumb Navigation Bar (Phones < 768px) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${currentTab === 'scan' ? 'active' : ''}`}
          onClick={() => handleTabClick('scan')}
        >
          <Camera size={19} />
          <span>Scan</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabClick('dashboard')}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'customers' ? 'active' : ''}`}
          onClick={() => handleTabClick('customers')}
        >
          <Users size={19} />
          <span>Customers</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'marketing' ? 'active' : ''}`}
          onClick={() => handleTabClick('marketing')}
        >
          <MessageSquareQuote size={19} />
          <span>Offers</span>
        </button>
      </nav>
    </>
  );
};
