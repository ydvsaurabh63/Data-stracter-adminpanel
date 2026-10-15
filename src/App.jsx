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
  const { isAuthenticated, loading, admin } = useAuth();
  const [viewMode, setViewMode] = useState(
    localStorage.getItem('app_view_mode') || 'superadmin'
  ); // 'superadmin' | 'client'
  const [currentTab, setCurrentTab] = useState('scan');
  const [targetCustomerForOffer, setTargetCustomerForOffer] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch Clients List
  const loadClients = async (preferredClientId) => {
    try {
      const res = await api.getClients();
      if (res.success && res.data?.length > 0) {
        setClients(res.data);
        const storedId = localStorage.getItem('active_client_id');
        const targetId = preferredClientId || storedId;

        let found = null;
        // If logged-in user is a client account, strictly bind to their restaurant record
        if (admin && (admin.role === 'client' || admin.clientId)) {
          const clientIdentifier = admin.clientId || admin._id;
          found = res.data.find(
            (c) =>
              c._id === clientIdentifier ||
              (c.email && admin.email && c.email.toLowerCase() === admin.email.toLowerCase())
          );
        }

        // If not found or user is superadmin, match by targetId
        if (!found && targetId) {
          found = res.data.find((c) => c._id === targetId);
        }

        // Fallback
        if (!found) {
          found = res.data[0];
        }

        setActiveClient(found);
        if (found) {
          localStorage.setItem('active_client_id', found._id);
        }
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const isClientRole = admin?.role === 'client';
      const mode = isClientRole ? 'client' : (localStorage.getItem('app_view_mode') || 'superadmin');
      setViewMode(mode);
      localStorage.setItem('app_view_mode', mode);
      const targetClientId = admin?.clientId || (isClientRole ? admin?._id : null) || localStorage.getItem('active_client_id');
      loadClients(targetClientId);
    }
  }, [isAuthenticated, admin]);

  // URL routing & Master key shortcut (Ctrl + Shift + A or Alt + A) to toggle Super Admin portal
  useEffect(() => {
    const checkUrlRoute = () => {
      if (admin?.role === 'client') {
        setViewMode('client');
        localStorage.setItem('app_view_mode', 'client');
        return;
      }
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
      if (admin?.role === 'client') return; // Do not allow client accounts to toggle superadmin
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
      if (admin?.role === 'client') return;
      localStorage.setItem('app_view_mode', 'superadmin');
      setViewMode('superadmin');
    };
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkUrlRoute);
    };
  }, [admin]);

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
        Loading Business Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(portal, targetClientId) => {
          setViewMode(portal);
          localStorage.setItem('app_view_mode', portal);
          if (targetClientId) {
            localStorage.setItem('active_client_id', targetClientId);
            loadClients(targetClientId);
          }
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
                activeClient={activeClient}
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
              <MarketingPage
                preselectedCustomer={targetCustomerForOffer}
                activeClient={activeClient}
              />
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
