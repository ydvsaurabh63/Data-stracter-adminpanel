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
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SuperAdminPage = ({
  onSelectClient,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { admin, updateUser, logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    restaurantName: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Form State for New / Edit Client
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    category: '',
    plan: 'Pro',
    status: 'active',
    address: '',
    notes: '',
  });

  const handleOpenProfileModal = () => {
    setProfileForm({
      username: admin?.username || '',
      email: admin?.email || '',
      restaurantName: admin?.restaurantName || 'Master Super Admin',
      newPassword: '',
      confirmPassword: '',
    });
    setProfileError('');
    setProfileSuccess('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      setProfileError('Username and Email are required.');
      return;
    }

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 4) {
        setProfileError('Password must be at least 4 characters long.');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError('Passwords do not match.');
        return;
      }
    }

    setProfileSaving(true);
    try {
      const payload = {
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
        restaurantName: profileForm.restaurantName.trim(),
      };
      if (profileForm.newPassword) {
        payload.password = profileForm.newPassword.trim();
      }

      const res = await api.updateProfile(payload);
      if (res.success) {
        if (updateUser) {
          updateUser(res.data, res.data.token);
        }
        setProfileSuccess('Profile updated successfully!');
        setNotification('Admin Profile Updated!');
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileSuccess('');
          setProfileError('');
        }, 1200);
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError('Error connecting to server. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

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
      password: '',
      category: '',
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
      password: '',
      category: client.category || '',
      plan: client.plan || 'Pro',
      status: client.status || 'active',
      address: client.address || '',
      notes: client.notes || '',
    });
    setIsCreateModalOpen(true);
  };

  const [showClientPassword, setShowClientPassword] = useState(false);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification('');

    try {
      if (!formData.name.trim() || !formData.ownerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
        alert('Name, Owner Name, Email, and Phone are required.');
        setSaving(false);
        return;
      }

      if (!formData.category) {
        alert('Please select a Business Category for this client.');
        setSaving(false);
        return;
      }

      if (!editingClient && (!formData.password || !formData.password.trim())) {
        alert('Please provide a login password for the new client.');
        setSaving(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        plan: formData.plan,
        status: formData.status,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
      };

      if (!editingClient) {
        payload.password = formData.password.trim();
      } else if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password.trim();
      }

      let res;
      if (editingClient) {
        res = await api.updateClient(editingClient._id, payload);
      } else {
        res = await api.createClient(payload);
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
                Admin
              </h1>
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
            onClick={handleOpenProfileModal}
            title="Admin Profile Settings"
            style={{
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fbbf24',
            }}
          >
            <User size={15} />
            <span>Profile</span>
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
          <p>Create your first client workspace to start managing multiple businesses.</p>
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
                      <h3 className="client-restaurant-name">{client.name}</h3>
                      <div className="client-owner-sub">
                        <User size={13} color="#94a3b8" />
                        <span>Owner: <strong style={{ color: '#e2e8f0' }}>{client.ownerName}</strong></span>
                      </div>
                      <div style={{ marginTop: '5px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#e2e8f0',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {client.category === 'Cafe' && '☕ Cafe'}
                          {client.category === 'Garments & Fashion' && '👕 Garments & Fashion'}
                          {client.category === 'Hardware & Sanitary' && '🔧 Hardware & Sanitary'}
                          {client.category === 'Electronics & Mobile' && '📱 Electronics & Mobile'}
                          {client.category === 'Grocery & Supermarket' && '🛒 Grocery & Supermarket'}
                          {client.category === 'General Retail Store' && '🏪 General Retail Store'}
                          {(!client.category || client.category === 'Restaurant') && '🍽️ Restaurant'}
                        </span>
                      </div>
                    </div>
                  </div>
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
                      placeholder="e.g. Royal Fashion Hub"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Business Category</span>
                    <span className="sa-label-required">*</span>
                  </label>
                  <div className="sa-input-box">
                    <select
                      className="sa-input"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      style={{
                        background: '#0f172a',
                        color: formData.category ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>-- Select Business Category --</option>
                      <option value="Restaurant">🍽️ Restaurant</option>
                      <option value="Cafe">☕ Cafe</option>
                      <option value="Garments & Fashion">👕 Garments & Fashion</option>
                      <option value="Hardware & Sanitary">🔧 Hardware & Sanitary</option>
                      <option value="Electronics & Mobile">📱 Electronics & Mobile</option>
                      <option value="Grocery & Supermarket">🛒 Grocery & Supermarket</option>
                      <option value="General Retail Store">🏪 General Retail Store</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sa-form-group" style={{ marginBottom: '16px' }}>
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
                    <span>Phone Number (Digits only)</span>
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Email Address (Login Username)</span>
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

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Login Password</span>
                    <span className="sa-label-required">{editingClient ? '(Optional - enter to change)' : '*'}</span>
                  </label>
                  <div className="sa-input-box" style={{ position: 'relative' }}>
                    <div className="sa-input-icon">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showClientPassword ? 'text' : 'password'}
                      className="sa-input"
                      required={!editingClient}
                      placeholder={editingClient ? 'Leave blank to keep existing' : 'Set client login password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientPassword(!showClientPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={showClientPassword ? 'Hide password' : 'Show password'}
                    >
                      {showClientPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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

      {/* ADMIN PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div
            className="super-admin-modal"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  className="super-admin-modal-icon"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      Admin Profile Settings
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
                      SUPER ADMIN
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '3px 0 0' }}>
                    Update your account username, login email, and password.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="super-admin-modal-close"
                onClick={() => setIsProfileModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {profileError && (
              <div style={{
                margin: '16px 24px 0',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
              }}>
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div style={{
                margin: '16px 24px 0',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
              }}>
                <CheckCircle size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="super-admin-form">
              {/* SECTION: BASIC INFO */}
              <div className="sa-form-section-title">
                <User size={13} />
                <span>Account Credentials</span>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Username</span>
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
                      placeholder="e.g. admin"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, username: e.target.value })
                      }
                    />
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
                      placeholder="admin@restaurant.com"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="sa-form-group">
                <label className="sa-label">
                  <span>Portal Display Name</span>
                </label>
                <div className="sa-input-box">
                  <div className="sa-input-icon">
                    <Crown size={16} />
                  </div>
                  <input
                    type="text"
                    className="sa-input"
                    placeholder="Master Super Admin"
                    value={profileForm.restaurantName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, restaurantName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* SECTION: PASSWORD CHANGE */}
              <div className="sa-form-section-title" style={{ marginTop: '16px' }}>
                <Key size={13} />
                <span>Change Password (Leave blank to keep current)</span>
              </div>

              <div className="form-grid-2">
                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>New Password</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      className="sa-input"
                      placeholder="New password (min 4 chars)"
                      value={profileForm.newPassword}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, newPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">
                    <span>Confirm New Password</span>
                  </label>
                  <div className="sa-input-box">
                    <div className="sa-input-icon">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      className="sa-input"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="sa-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={profileSaving}
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileSaving}
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
                  {profileSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Save Profile</span>
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
