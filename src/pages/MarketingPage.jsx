import React, { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, CheckCircle, Tag, Users, Check, Gift, Crown, Calendar } from 'lucide-react';
import { api } from '../services/api';

export const MarketingPage = ({ preselectedCustomer }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('inactive_reengage');
  const [targetGroup, setTargetGroup] = useState('inactive');
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer || null);
  const [offerCode, setOfferCode] = useState('MISSYOU15');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [message, setMessage] = useState(
    'Hello {name}! It has been a while since your last visit. Treat yourself this week and enjoy 15% OFF with code {code}!'
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.getOfferTemplates();
        if (res.success && res.data.length > 0) {
          setTemplates(res.data);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplateId(tmpl.id);
    setMessage(tmpl.message);
    setOfferCode(tmpl.offerCode);
    setDiscountPercent(tmpl.discountPercent);
    setTargetGroup(tmpl.target);
  };

  const handleInsertTag = (tag) => {
    setMessage((prev) => prev + ` ${tag}`);
  };

  const targetName = selectedCustomer ? selectedCustomer.name : 'Valued Guest';
  const personalizedMessage = message
    .replace('{name}', targetName)
    .replace('{code}', offerCode);

  const handleOpenWhatsAppDirect = () => {
    if (!selectedCustomer || !selectedCustomer.phone) {
      alert('Please select a customer to send WhatsApp message');
      return;
    }
    const cleanPhone = '91' + selectedCustomer.phone.replace(/\D/g, '').slice(-10);
    const encodedText = encodeURIComponent(personalizedMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  const handleDispatch = async () => {
    setSending(true);
    setResult(null);

    try {
      const payload = {
        targetGroup: selectedCustomer ? null : targetGroup,
        customerIds: selectedCustomer ? [selectedCustomer._id] : [],
        message,
        offerCode,
        discountPercent: Number(discountPercent),
      };

      const res = await api.sendOffer(payload);
      setResult(res);

      // If single customer, immediately launch WhatsApp chat with the prefilled message!
      if (selectedCustomer && selectedCustomer.phone) {
        const cleanPhone = '91' + selectedCustomer.phone.replace(/\D/g, '').slice(-10);
        const encodedText = encodeURIComponent(personalizedMessage);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
      }
    } catch (err) {
      alert('Error sending offer: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const defaultTemplates = templates.length > 0 ? templates : [
    {
      id: 'inactive_reengage',
      title: 'We Miss You!',
      target: 'inactive',
      discountPercent: 15,
      offerCode: 'MISSYOU15',
      message: 'Hello {name}! It has been a while since your last visit. Treat yourself this week and enjoy 15% OFF with code {code}!',
    },
    {
      id: 'vip_appreciation',
      title: 'VIP Loyalty Reward',
      target: 'vip',
      discountPercent: 20,
      offerCode: 'VIPDESSERT',
      message: 'Dear {name}, thank you for dining with us! Enjoy a complimentary Chef Special Dessert with code {code} on your next visit.',
    },
    {
      id: 'weekend_special',
      title: 'Weekend Special',
      target: 'all',
      discountPercent: 10,
      offerCode: 'WEEKEND10',
      message: 'Hello {name}! Dine with us this weekend and enjoy 10% OFF on your table with code {code}!',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Offers & WhatsApp</h1>
      </div>

      {result && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          color: '#6ee7b7',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.92rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={20} color="#10b981" />
          <span>{result.message}</span>
        </div>
      )}

      {/* Step 1: Horizontal Quick Template Selector Cards */}
      <div className="templates-grid">
        {defaultTemplates.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              className={`template-card ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectTemplate(tmpl)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {tmpl.id === 'inactive_reengage' && <Gift size={18} color="#f59e0b" />}
                  {tmpl.id === 'vip_appreciation' && <Crown size={18} color="#eab308" />}
                  {tmpl.id === 'weekend_special' && <Calendar size={18} color="#38bdf8" />}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#f59e0b' : '#f8fafc' }}>
                    {tmpl.title}
                  </span>
                </div>
                <span className="badge badge-vip">{tmpl.discountPercent}% OFF</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginTop: '4px' }}>
                {tmpl.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 2: Main Layout (Composer Form + Real Phone Preview) */}
      <div className="offer-studio-layout">
        {/* Left Column: Composer Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem', marginBottom: '18px' }}>
            <Tag size={18} color="#f59e0b" />
            <span>Customize Campaign</span>
          </div>

          {selectedCustomer ? (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>Single Customer</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCustomer.name} (📞 +91 {selectedCustomer.phone})</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setSelectedCustomer(null)}
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Send To Target Audience</label>
              <select
                className="form-select"
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                style={{ padding: '12px 14px', fontSize: '0.95rem' }}
              >
                <option value="inactive">⚠️ Inactive Diners (Haven't visited in &gt; 20 days)</option>
                <option value="vip">⭐️ VIP Regular Diners (5+ visits)</option>
                <option value="all">👥 All Registered Diners</option>
              </select>
            </div>
          )}

          {/* Promo Code & Discount % in a Balanced Row */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              <label className="form-label">Promo Code</label>
              <input
                type="text"
                className="form-input"
                style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em' }}
                value={offerCode}
                onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOMEBACK"
              />
            </div>

            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Discount %</label>
              <input
                type="number"
                className="form-input"
                style={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="5"
                max="50"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Message Template</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleInsertTag('{name}')}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                >
                  + {'{name}'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('{code}')}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                >
                  + {'{code}'}
                </button>
              </div>
            </div>

            <textarea
              className="form-textarea"
              rows="4"
              style={{ fontSize: '0.92rem', lineHeight: 1.5 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your offer message..."
            />
          </div>

          {/* Dispatch Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {selectedCustomer ? (
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  background: '#25d366',
                  borderColor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onClick={handleOpenWhatsAppDirect}
              >
                <MessageSquare size={19} />
                <span>Open in WhatsApp & Send to {selectedCustomer.name}</span>
              </button>
            ) : null}

            <button
              type="button"
              className={selectedCustomer ? "btn btn-secondary" : "btn btn-primary"}
              style={{ width: '100%', padding: '13px', fontSize: '0.96rem' }}
              onClick={handleDispatch}
              disabled={sending}
            >
              <Send size={17} />
              <span>{sending ? 'Dispatching Campaign...' : (selectedCustomer ? 'Record Campaign & Open WhatsApp' : 'Dispatch WhatsApp Campaign (Bulk)')}</span>
            </button>
          </div>

          {/* Quick Notice about WhatsApp sending */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '4px' }}>💬 How WhatsApp Sending Works:</strong>
            1. <strong>Direct Send (Instant &amp; Free)</strong>: Click green button to open WhatsApp Web/App with message ready to send to this customer.<br />
            2. <strong>Automated Server API</strong>: Background automatic bulk sending requires Meta WhatsApp Business Cloud API keys in backend <code style={{ color: '#38bdf8' }}>.env</code>.
          </div>
        </div>

        {/* Right Column: Realistic WhatsApp Phone Mockup */}
        <div>
          <div className="phone-mockup">
            {/* Phone Top Bar */}
            <div className="phone-header">
              <div className="phone-avatar">
                🍽️
              </div>
              <div>
                <div className="phone-title">Grand Spice Restaurant</div>
                <div className="phone-status">WhatsApp Business • Online</div>
              </div>
            </div>

            {/* Phone Chat Body */}
            <div className="phone-body">
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '4px', color: '#8696a0' }}>
                  TODAY
                </span>
              </div>

              {/* Chat Bubble */}
              <div className="chat-bubble">
                <div style={{ wordBreak: 'break-word' }}>
                  {message
                    .replace('{name}', selectedCustomer ? selectedCustomer.name : 'Rahul Sharma')
                    .replace('{code}', offerCode)}
                </div>

                <div className="chat-action-btn">
                  <span>🎁 Redeem Code: {offerCode} ({discountPercent}% OFF)</span>
                </div>

                <div className="chat-time">
                  <span>11:45 AM</span>
                  <span style={{ color: '#53bdeb' }}>✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
