import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle, Crown } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLogin }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        const userRole = res.data?.role || (username.toLowerCase().includes('client') ? 'client' : 'superadmin');
        const targetClientId = res.data?.clientId || (userRole === 'client' ? res.data?._id : null);

        localStorage.setItem('app_view_mode', userRole);
        if (targetClientId) {
          localStorage.setItem('active_client_id', targetClientId);
        } else {
          localStorage.removeItem('active_client_id');
        }
        window.location.hash = userRole === 'superadmin' ? '#admin' : '#client';
        if (onLogin) {
          onLogin(userRole, targetClientId);
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(14px, 4vw, 24px)',
      backgroundColor: '#0a0e17',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '430px',
        width: '100%',
        padding: 'clamp(26px, 6vw, 36px) clamp(16px, 5vw, 30px)',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
        boxSizing: 'border-box',
      }}>
        {/* Crown Icon with Golden/Amber Glow */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 18px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
          }}>
            <Crown size={32} color="#000" strokeWidth={2.2} />
          </div>

          <h1 style={{
            fontSize: '1.7rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            margin: '0 0 6px 0',
          }}>
            Sign In Portal
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.92rem',
            margin: 0,
            fontWeight: 400,
          }}>
            Multi-Business Client Management Portal
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
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#8da2bc',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
            }}>
              USERNAME OR EMAIL
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '0 14px',
              height: '48px',
              transition: 'border-color 0.2s',
            }}>
              <User size={18} color="#64748b" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#8da2bc',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
            }}>
              PASSWORD
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '0 14px',
              height: '48px',
              transition: 'border-color 0.2s',
            }}>
              <Lock size={18} color="#64748b" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#0a0e17',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
