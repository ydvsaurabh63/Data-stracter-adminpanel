import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { ScanBillPage } from './pages/ScanBillPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { MarketingPage } from './pages/MarketingPage';
import { api } from './services/api';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [viewMode, setViewMode] = useState(
    localStorage.getItem('app_view_mode') || 'superadmin'
  ); // 'superadmin' | 'client'
  const [currentTab, setCurrentTab] = useState('scan');
  const [targetCustomerForOffer, setTargetCustomerForOffer] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch Clients List
  const loadClients = async () => {
    try {
      const res = await api.getClients();
      if (res && res.success && res.data?.length > 0) {
        setClients(res.data);
        const storedClientId = localStorage.getItem('active_client_id');
        const found = res.data.find((c) => c._id === storedClientId) || res.data[0];
        setActiveClient(found);
        localStorage.setItem('active_client_id', found._id);
        return;
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }

    // Fallback if client logged in or API returned single client
    const storedAdmin = localStorage.getItem('restaurant_admin');
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        if (parsed.role === 'client' || parsed.clientId) {
          const fallback = {
            _id: parsed.clientId || parsed._id || '6acf321767db4fe28bb58b35',
            name: parsed.restaurantName || parsed.name || 'Grand Spice Bistro',
            email: parsed.email || 'owner@grandspice.com',
            plan: 'Pro',
          };
          setActiveClient(fallback);
          setClients([fallback]);
          localStorage.setItem('active_client_id', fallback._id);
        }
      } catch {}
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      const mode = localStorage.getItem('app_view_mode') || 'superadmin';
      setViewMode(mode);
      loadClients();
    }
  }, [isAuthenticated]);

  // URL routing & Master key shortcut (Ctrl + Shift + A or Alt + A) to toggle Super Admin portal
  useEffect(() => {
    const checkUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#superadmin' || search.includes('admin=true') || search.includes('admin=1')) {
        setViewMode('superadmin');
        localStorage.setItem('app_view_mode', 'superadmin');
      } else if (hash === '#client') {
        setViewMode('client');
        localStorage.setItem('app_view_mode', 'client');
      }
    };

    checkUrlRoute();
    window.addEventListener('hashchange', checkUrlRoute);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setViewMode((prev) => {
          const next = prev === 'superadmin' ? 'client' : 'superadmin';
          localStorage.setItem('app_view_mode', next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.openSuperAdmin = () => {
      localStorage.setItem('app_view_mode', 'superadmin');
      setViewMode('superadmin');
    };
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkUrlRoute);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e17',
          color: '#f59e0b',
          fontWeight: 700,
          fontSize: '1.2rem',
        }}
      >
        Loading Restaurant Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(portal) => {
          setViewMode(portal);
          localStorage.setItem('app_view_mode', portal);
        }}
      />
    );
  }

  // Switch to specific client's workspace
  const handleSelectClient = (client) => {
    setActiveClient(client);
    localStorage.setItem('active_client_id', client._id);
    setViewMode('client');
    localStorage.setItem('app_view_mode', 'client');
    setCurrentTab('dashboard'); // start on client's overview dashboard
  };

  // Exit back to master super admin
  const handleBackToSuperAdmin = () => {
    setViewMode('superadmin');
    localStorage.setItem('app_view_mode', 'superadmin');
    loadClients(); // refresh stats
  };

  const handleSendOfferToCustomer = (customer) => {
    setTargetCustomerForOffer(customer);
    setCurrentTab('marketing');
  };

  return (
    <div className="app-root-wrapper">
      {/* Main Container Layout */}
      {viewMode === 'superadmin' ? (
        <div className="super-admin-layout">
          <SuperAdminPage
            onSelectClient={handleSelectClient}
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        </div>
      ) : (
        <div className="app-container client-workspace-container">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            activeClient={activeClient}
            onGoToSuperAdmin={handleBackToSuperAdmin}
          />

          <main className="main-content">
            {currentTab === 'scan' && (
              <ScanBillPage
                onBillSaved={(result) => {
                  // Instant bill callback
                }}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {currentTab === 'customers' && (
              <CustomersPage onSendOfferToCustomer={handleSendOfferToCustomer} />
            )}

            {currentTab === 'marketing' && (
              <MarketingPage preselectedCustomer={targetCustomerForOffer} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
