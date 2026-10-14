import React, { useState } from 'react';
import { UtensilsCrossed, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Crown } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLogin }) => {
  const { login } = useAuth();
  const [targetPortal, setTargetPortal] = useState(
    window.location.hash === '#admin' || window.location.hash === '#superadmin' || window.location.search.includes('admin')
      ? 'superadmin'
      : (localStorage.getItem('app_view_mode') || 'client')
  );
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePortalSwitch = (portal) => {
    setTargetPortal(portal);
    localStorage.setItem('app_view_mode', portal);
    window.location.hash = portal === 'superadmin' ? '#admin' : '#client';
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
      const res = await api.login(username, password);
      if (res.success) {
        localStorage.setItem('app_view_mode', targetPortal);
        window.location.hash = targetPortal === 'superadmin' ? '#admin' : '#client';
        if (onLogin) {
          onLogin(targetPortal);
        }
        login(res.data, res.data.token);
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to backend server. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError('');
  };

  const isSuper = targetPortal === 'superadmin';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px 30px' }}>
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
            onClick={() => handlePortalSwitch('client')}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              border: targetPortal === 'client' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: targetPortal === 'client' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: targetPortal === 'client' ? '#f59e0b' : '#94a3b8',
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
            <UtensilsCrossed size={15} />
            <span>Client Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('superadmin')}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              border: targetPortal === 'superadmin' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
              background: targetPortal === 'superadmin' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.32))' : 'transparent',
              color: targetPortal === 'superadmin' ? '#f59e0b' : '#94a3b8',
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
            <Crown size={15} />
            <span>Master Admin</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: isSuper
              ? 'linear-gradient(135deg, #f59e0b, #b45309)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
          }}>
            {isSuper ? <Crown size={30} color="#000" /> : <UtensilsCrossed size={30} color="#000" />}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isSuper ? 'Master Super Admin' : 'Client Portal'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
            {isSuper
              ? 'Multi-Tenant Restaurant & Client Management'
              : 'Bill Extraction & Customer Loyalty Management'}
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
            fontSize: '0.88rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="client"
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
            style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.84rem', padding: '8px' }}
          >
            <ShieldCheck size={16} color="#f59e0b" />
            <span>Fill Default Client Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
