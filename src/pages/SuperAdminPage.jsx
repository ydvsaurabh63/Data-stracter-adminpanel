import React, { useState, useEffect } from 'react';
import {
  Crown,
  Building2,
  Users,
  Receipt,
  IndianRupee,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  LogOut,
  User,
  FileText,
  Store,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SuperAdminPage = ({
  onSelectClient,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State for New / Edit Client
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    plan: 'Pro',
    status: 'active',
    address: '',
    notes: '',
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [clientsRes, overviewRes] = await Promise.all([
        api.getClients(),
        api.getPlatformOverview(),
      ]);

      if (clientsRes.success) {
        setClients(clientsRes.data || []);
      }
      if (overviewRes.success) {
        setOverview(overviewRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      plan: 'Pro',
      status: 'active',
      address: '',
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      ownerName: client.ownerName || '',
      email: client.email || '',
      phone: client.phone || '',
      plan: client.plan || 'Pro',
      status: client.status || 'active',
      address: client.address || '',
      notes: client.notes || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification('');

    try {
      let res;
      if (editingClient) {
        res = await api.updateClient(editingClient._id, formData);
      } else {
        res = await api.createClient(formData);
      }

      if (res.success) {
        setNotification(
          editingClient
            ? `Client "${formData.name}" updated successfully!`
            : `Client "${formData.name}" created successfully!`
        );
        setIsCreateModalOpen(false);
        fetchDashboardData();
        setTimeout(() => setNotification(''), 4000);
      } else {
        alert(res.message || 'Operation failed');
      }
    } catch (err) {
      alert('Error saving client: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (
      !window.confirm(
        `Are you sure you want to delete client "${client.name}"? All their bills and customer records will also be deleted!`
      )
    ) {
      return;
    }

    try {
      const res = await api.deleteClient(client._id);
      if (res.success) {
        setNotification(`Client "${client.name}" deleted.`);
        fetchDashboardData();
        setTimeout(() => setNotification(''), 3000);
      } else {
        alert(res.message || 'Failed to delete client');
      }
    } catch (err) {
      alert('Error deleting client: ' + err.message);
    }
  };

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.updateClient(client._id, { status: newStatus });
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search) ||
      client.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="super-admin-page">
      {/* Top Header Row */}
      <div className="super-admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.12))',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.2)',
              flexShrink: 0,
            }}
          >
            <Crown size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="super-admin-main-heading">
                Master Admin
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24',
                }}
              >
                PLATFORM OVERVIEW
              </span>
            </div>
            <p className="super-admin-subheading">
              Manage all client workspaces, live cross-platform revenue, and counter configurations.
            </p>
          </div>
        </div>

        <div className="super-admin-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchDashboardData}
            title="Refresh Data"
            style={{ borderRadius: '10px', padding: '10px 16px' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary super-admin-create-btn"
            onClick={handleOpenCreateModal}
          >
            <Plus size={18} />
            <span>Add Client</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
            title="Sign Out of Master Admin"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '10px',
              padding: '10px 16px',
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="super-admin-notification">
          <CheckCircle size={18} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* Platform Master KPIs */}
      <div className="super-admin-kpi-grid">
        <div
          className="super-admin-kpi-card"
          style={{ '--kpi-accent': '#3b82f6', '--kpi-glow': 'rgba(59, 130, 246, 0.15)' }}
        >
          <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="kpi-label">Total Clients</div>
            <div className="kpi-value">{overview ? overview.totalClients : clients.length}</div>
            <div className="kpi-subtext">
              <span style={{ color: '#10b981', fontWeight: 700 }}>
                {overview ? overview.activeClients : clients.filter(c => c.status === 'active').length} Active
              </span>{' '}
              workspaces
            </div>
          </div>
        </div>

        <div
          className="super-admin-kpi-card"
          style={{ '--kpi-accent': '#10b981', '--kpi-glow': 'rgba(16, 185, 129, 0.15)' }}
        >
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="kpi-label">Platform Total Revenue</div>
            <div className="kpi-value" style={{ color: '#34d399' }}>
              ₹{(overview?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="kpi-subtext">Across all clients</div>
          </div>
        </div>

        <div
          className="super-admin-kpi-card"
          style={{ '--kpi-accent': '#f59e0b', '--kpi-glow': 'rgba(245, 158, 11, 0.15)' }}
        >
          <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Receipt size={24} />
          </div>
          <div>
            <div className="kpi-label">Total Bills Processed</div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>
              {overview ? overview.totalBills : 0}
            </div>
            <div className="kpi-subtext">Smart AI bill OCR & logs</div>
          </div>
        </div>

        <div
          className="super-admin-kpi-card"
          style={{ '--kpi-accent': '#8b5cf6', '--kpi-glow': 'rgba(139, 92, 246, 0.15)' }}
        >
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="kpi-label">Total Customers</div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>
              {overview ? overview.totalCustomers : 0}
            </div>
            <div className="kpi-subtext">In central loyalty database</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="super-admin-filter-bar">
        <div className="super-admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search clients by name, owner, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="super-admin-search-input"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="super-admin-status-tabs">
          {[
            { id: 'all', label: 'All Clients', count: clients.length },
            { id: 'active', label: 'Active', count: clients.filter((c) => c.status === 'active').length },
            { id: 'trial', label: 'Trial', count: clients.filter((c) => c.status === 'trial').length },
            { id: 'inactive', label: 'Inactive', count: clients.filter((c) => c.status === 'inactive').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-tab ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="status-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      {loading ? (
        <div className="super-admin-loading">
          <div className="scanner-spinner"></div>
          <div>Loading platform clients...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="super-admin-empty">
          <Building2 size={48} color="#64748b" />
          <h3>No Clients Found</h3>
          <p>Create your first restaurant client to start managing multiple workspaces.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} /> Create Client Now
          </button>
        </div>
      ) : (
        <div className="super-admin-clients-grid">
          {filteredClients.map((client) => {
            const cleanPhone = client.phone ? client.phone.replace(/\D/g, '') : '';
            const whatsappUrl =
              cleanPhone.length === 10
                ? `https://wa.me/91${cleanPhone}`
                : `https://wa.me/${cleanPhone}`;

            const initials = client.name
              ? client.name
                  .trim()
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'CR';

            return (
              <div key={client._id} className="client-card">
                <div className="client-card-header">
                  <div className="client-avatar-row">
                    <div className="client-avatar">
                      {initials}
                    </div>
                    <div>
                      <div className="client-name-row">
                        <h3 className="client-restaurant-name">{client.name}</h3>
                        <span className={`client-plan-pill ${client.plan?.toLowerCase() || 'pro'}`}>
                          {client.plan || 'Pro'}
                        </span>
                      </div>
                      <div className="client-owner-sub">
                        <User size={13} color="#94a3b8" />
                        <span>Owner: <strong style={{ color: '#e2e8f0' }}>{client.ownerName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(client)}
                    className={`client-status-badge ${client.status}`}
                    title="Click to toggle status"
                  >
                    <span className="status-dot"></span>
                    <span>{client.status}</span>
                  </button>
                </div>

                {/* Contact Meta Box */}
                <div className="client-meta-list">
                  <div className="client-meta-item">
                    <Phone size={13} color="#f59e0b" />
                    <span>{client.phone}</span>
                    {cleanPhone && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="client-whatsapp-btn"
                        title="Chat on WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                  <div className="client-meta-item">
                    <Mail size={13} color="#3b82f6" />
                    <span>{client.email}</span>
                  </div>
                  {client.address && (
                    <div className="client-meta-item">
                      <MapPin size={13} color="#10b981" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Metrics Row */}
                <div className="client-metrics-row">
                  <div className="metric-box bills">
                    <span className="metric-num">{client.billsCount || 0}</span>
                    <span className="metric-tag">Bills Scanned</span>
                  </div>
                  <div className="metric-box revenue">
                    <span className="metric-num">₹{(client.totalRevenue || 0).toLocaleString('en-IN')}</span>
                    <span className="metric-tag">Total Revenue</span>
                  </div>
                  <div className="metric-box customers">
                    <span className="metric-num">{client.customersCount || 0}</span>
                    <span className="metric-tag">Customers</span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="client-actions-bar">
                  <button
                    type="button"
                    className="client-launch-btn"
                    onClick={() => onSelectClient(client)}
                    title={`Open and work inside ${client.name}'s workspace`}
                  >
                    <ExternalLink size={16} />
                    <span>Enter Workspace</span>
                  </button>

                  <div className="client-secondary-actions">
                    <button
                      type="button"
                      className="client-icon-action edit"
                      onClick={() => handleOpenEditModal(client)}
                      title="Edit Client Information"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="client-icon-action delete"
                      onClick={() => handleDeleteClient(client)}
                      title="Delete Client"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div
            className="super-admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="super-admin-modal-icon">
                  <Building2 size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      {editingClient ? 'Edit Client Details' : 'Create New Client'}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(245, 158, 11, 0.18)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {editingClient ? 'EDIT MODE' : 'NEW CLIENT'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '3px 0 0' }}>
                    {editingClient
                      ? `Update configuration and contact details for ${editingClient.name}`
                      : 'Add a new client workspace to your platform.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="super-admin-modal-close"
                onClick={() => setIsCreateModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="super-admin-form">
              {/* SECTION 1: CLIENT PROFILE */}
              <div className="sa-form-section-title">
                <Store size={13} />
                <span>Client Information</span>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Client / Business Name</span>
                    <span className="sa-label-required">*</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      className="sa-input"
                      required
                      placeholder="e.g. Urban Wood Cafe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Location / Address</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      className="sa-input"
                      placeholder="e.g. Sector 18, Noida"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: OWNER & CONTACT */}
              <div className="sa-form-section-title">
                <User size={13} />
                <span>Manager & Contact</span>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Owner / Manager Name</span>
                    <span className="sa-label-required">*</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      className="sa-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Phone Number</span>
                    <span className="sa-label-required">*</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      className="sa-input"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="sa-form-group">
                <label className="sa-label">
                  <span>Email Address</span>
                  <span className="sa-label-required">*</span>
                </label>
                <div className="sa-input-box">
                  <div className="sa-input-icon">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    className="sa-input"
                    required
                    placeholder="e.g. contact@client.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* SECTION 3: PLAN & STATUS */}
              <div className="sa-form-section-title">
                <ShieldCheck size={13} />
                <span>Workspace Access & Status</span>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Plan Tier</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <Sparkles size={16} />
                    </div>
                    <select
                      className="sa-select"
                      value={formData.plan}
                      onChange={(e) =>
                        setFormData({ ...formData, plan: e.target.value })
                      }
                    >
                      <option value="Starter">Starter (Basic Scanning)</option>
                      <option value="Pro">Pro (Scanning + Customer CRM)</option>
                      <option value="Enterprise">Enterprise (Full Multi-Counter + AI)</option>
                    </select>
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Account Status</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <ShieldCheck size={16} />
                    </div>
                    <select
                      className="sa-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="active">Active (Full Access Enabled)</option>
                      <option value="trial">Free Trial (7 Days)</option>
                      <option value="inactive">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: INTERNAL NOTES */}
              <div className="sa-form-section-title">
                <FileText size={13} />
                <span>Internal Notes</span>
              </div>

              <div className="sa-form-group">
                <div className="sa-input-box sa-textarea-box">
                  <div className="sa-input-icon">
                    <FileText size={16} />
                  </div>
                  <textarea
                    rows={2}
                    className="sa-textarea"
                    placeholder="Notes about billing counters, custom preferences, bill templates..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="sa-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={saving}
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{
                    minWidth: '160px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {saving ? (
                    'Saving...'
                  ) : editingClient ? (
                    <>
                      <Sparkles size={16} />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Create Client</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
