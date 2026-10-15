import React, { useState } from 'react';
import { UtensilsCrossed, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Crown, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLogin }) => {
  const { login } = useAuth();
  const [targetPortal, setTargetPortal] = useState(
    window.location.hash === '#admin' || window.location.hash === '#superadmin' || window.location.search.includes('admin')
      ? 'superadmin'
      : (localStorage.getItem('app_view_mode') || 'superadmin')
  );

  const isSuper = targetPortal === 'superadmin';

  const [username, setUsername] = useState(isSuper ? 'admin' : 'client');
  const [password, setPassword] = useState(isSuper ? 'admin' : 'client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePortalSwitch = (portal) => {
    setTargetPortal(portal);
    localStorage.setItem('app_view_mode', portal);
    window.location.hash = portal === 'superadmin' ? '#admin' : '#client';
    if (portal === 'superadmin') {
      setUsername('admin');
      setPassword('admin');
    } else {
      setUsername('client');
      setPassword('client');
    }
    setError('');
  };

  const handleFillAdmin = () => {
    setTargetPortal('superadmin');
    localStorage.setItem('app_view_mode', 'superadmin');
    window.location.hash = '#admin';
    setUsername('admin');
    setPassword('admin');
    setError('');
  };

  const handleFillClient = () => {
    setTargetPortal('client');
    localStorage.setItem('app_view_mode', 'client');
    window.location.hash = '#client';
    setUsername('client');
    setPassword('client');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanUser = username.trim().toLowerCase();
      
      // Auto-detect portal based on what the user actually typed
      let detectedPortal = targetPortal;
      if (cleanUser === 'admin' || cleanUser.includes('admin') || cleanUser === 'owner@restaurant.com') {
        detectedPortal = 'superadmin';
      } else if (cleanUser === 'client' || cleanUser.includes('client') || cleanUser.includes('grandspice') || cleanUser === 'owner@grandspice.com') {
        detectedPortal = 'client';
      }

      const res = await api.login(username, password);

      if (res && res.success) {
        // Resolve portal from server response role or auto-detection
        const finalPortal = res.data?.role === 'superadmin'
          ? 'superadmin'
          : (res.data?.role === 'client' ? 'client' : detectedPortal);

        if (res.data?.clientId) {
          localStorage.setItem('active_client_id', res.data.clientId);
        }

        localStorage.setItem('app_view_mode', finalPortal);
        window.location.hash = finalPortal === 'superadmin' ? '#admin' : '#client';

        if (onLogin) {
          onLogin(finalPortal);
        }
        login(res.data, res.data.token);
      } else {
        setError(res?.message || 'Invalid credentials. Admin: admin / admin | Client: client / client');
      }
    } catch (err) {
      setError('Unable to authenticate. Make sure backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.08) 0%, rgba(10, 14, 23, 1) 75%)',
    }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '36px 30px' }}>
        
        {/* Portal Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '26px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => handlePortalSwitch('superadmin')}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: isSuper ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              background: isSuper ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.32))' : 'transparent',
              color: isSuper ? '#f59e0b' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Crown size={16} />
            <span>Master Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('client')}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: !isSuper ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              background: !isSuper ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: !isSuper ? '#f59e0b' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <UtensilsCrossed size={16} />
            <span>Client Portal</span>
          </button>
        </div>

        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '58px',
            height: '58px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: isSuper
              ? 'linear-gradient(135deg, #f59e0b, #b45309)'
              : 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSuper ? '0 8px 24px rgba(245, 158, 11, 0.35)' : '0 8px 24px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.3s ease',
          }}>
            {isSuper ? <Crown size={30} color="#000" /> : <UtensilsCrossed size={30} color="#fff" />}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {isSuper ? 'Master Super Admin' : 'Restaurant Client Portal'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '6px' }}>
            {isSuper
              ? 'Multi-Tenant Restaurant & System Management'
              : 'Bill Scanner & Customer CRM Workspace'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#fca5a5',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Username or Email</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {isSuper ? 'e.g. admin' : 'e.g. client or owner@grandspice.com'}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder={isSuper ? 'admin' : 'client'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '1rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to {isSuper ? 'Master Admin' : 'Client Portal'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick One-Click Fill Buttons */}
        <div style={{
          marginTop: '22px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          <button
            type="button"
            onClick={handleFillAdmin}
            className="btn btn-secondary"
            style={{
              padding: '8px 10px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderColor: isSuper ? 'rgba(245, 158, 11, 0.4)' : undefined,
            }}
          >
            <Crown size={14} color="#f59e0b" />
            <span>Fill Admin</span>
          </button>

          <button
            type="button"
            onClick={handleFillClient}
            className="btn btn-secondary"
            style={{
              padding: '8px 10px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderColor: !isSuper ? 'rgba(16, 185, 129, 0.4)' : undefined,
            }}
          >
            <UtensilsCrossed size={14} color="#10b981" />
            <span>Fill Client</span>
          </button>
        </div>

        {/* Credentials Info Badge */}
        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '10px',
          fontSize: '0.8rem',
          color: '#94a3b8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
            <KeyRound size={14} color="#f59e0b" />
            <span>Default Login Credentials</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>👑 <strong>Admin Portal:</strong></span>
            <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>admin / admin</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🍽️ <strong>Client Portal:</strong></span>
            <span style={{ color: '#10b981', fontFamily: 'monospace' }}>client / client</span>
          </div>
        </div>

      </div>
    </div>
  );
};
