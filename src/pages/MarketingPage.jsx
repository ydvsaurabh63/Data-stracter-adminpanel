import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Tag, Users, Check, Gift, Crown, Calendar, Copy, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MarketingPage = ({ preselectedCustomer, activeClient }) => {
  const { admin } = useAuth();
  const restaurantName = activeClient?.name || admin?.restaurantName || 'Restaurant';

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('inactive_reengage');
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer || null);
  const [customerList, setCustomerList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [offerCode, setOfferCode] = useState('MISSYOU15');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [message, setMessage] = useState(
    'Hello {name}! It has been a while since your last visit. Treat yourself this week and enjoy 15% OFF with code {code}!'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
    }
  }, [preselectedCustomer]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.getCustomers();
        if (res.success && Array.isArray(res.data)) {
          setCustomerList(res.data);
        }
      } catch (err) {
        console.error('Error loading customer list:', err);
      }
    };
    fetchCustomers();
  }, [activeClient]);

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
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(personalizedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleInsertTag = (tag) => {
    setMessage((prev) => prev + ` ${tag}`);
  };

  const targetName = selectedCustomer ? selectedCustomer.name : 'Valued Guest';
  const personalizedMessage = message
    .replace(/{name}/g, targetName)
    .replace(/{code}/g, offerCode)
    .replace(/{restaurant}/g, restaurantName);

  const handleOpenWhatsAppDirect = () => {
    if (!selectedCustomer || !selectedCustomer.phone) {
      setErrorMessage('Pehle niche se ek customer select karein jise WhatsApp bhejna hai.');
      return;
    }
    setErrorMessage('');
    const cleanPhone = '91' + selectedCustomer.phone.replace(/\D/g, '').slice(-10);
    const encodedText = encodeURIComponent(personalizedMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  const category =
    activeClient?.category ||
    admin?.category ||
    (restaurantName.toLowerCase().includes('cafe') ? 'Cafe' : 'Restaurant');

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'Cafe': return '☕';
      case 'Garments & Fashion': return '👕';
      case 'Hardware & Sanitary': return '🔧';
      case 'Electronics & Mobile': return '📱';
      case 'Grocery & Supermarket': return '🛒';
      case 'General Retail Store': return '🏪';
      case 'Restaurant':
      default: return '🍽️';
    }
  };

  const categoryEmoji = getCategoryEmoji(category);

  const getCategoryTemplates = (cat) => {
    switch (cat) {
      case 'Garments & Fashion':
        return [
          {
            id: 'garments_trend',
            title: 'New Season Trend',
            target: 'all',
            discountPercent: 20,
            offerCode: 'TREND20',
            message: 'Hello {name}! New Season Trend Collection has arrived at {restaurant}! Enjoy flat 20% OFF on your next shopping with code {code}!',
          },
          {
            id: 'garments_vip',
            title: 'VIP Style Privilege',
            target: 'vip',
            discountPercent: 25,
            offerCode: 'VIPSTYLE25',
            message: 'Dear {name}, thank you for choosing {restaurant}! Enjoy exclusive 25% OFF on premium apparel with code {code}!',
          },
          {
            id: 'garments_reengage',
            title: 'Wardrobe Refresh',
            target: 'inactive',
            discountPercent: 15,
            offerCode: 'REFRESH15',
            message: "Hello {name}! We haven't seen you lately at {restaurant}. Treat yourself this week with 15% OFF code {code}!",
          },
        ];
      case 'Hardware & Sanitary':
        return [
          {
            id: 'hardware_tools',
            title: 'Tools & Hardware Offer',
            target: 'all',
            discountPercent: 10,
            offerCode: 'BUILD10',
            message: 'Hello {name}! Need tools or sanitary material? Get flat 10% OFF at {restaurant} on your purchase with code {code}!',
          },
          {
            id: 'hardware_vip',
            title: 'VIP Contractor Privilege',
            target: 'vip',
            discountPercent: 15,
            offerCode: 'PROBUILD15',
            message: 'Dear {name}, thank you for your ongoing partnership with {restaurant}! Enjoy 15% OFF your next order with code {code}.',
          },
          {
            id: 'hardware_reengage',
            title: 'Supply Discount',
            target: 'inactive',
            discountPercent: 12,
            offerCode: 'TOOLS12',
            message: 'Hello {name}! Looking for trusted hardware & sanitary goods? Visit {restaurant} this week and take 12% OFF with code {code}!',
          },
        ];
      case 'Electronics & Mobile':
        return [
          {
            id: 'electronics_fest',
            title: 'Gadget & Tech Fest',
            target: 'all',
            discountPercent: 15,
            offerCode: 'TECH15',
            message: 'Hello {name}! Upgrade your tech at {restaurant}! Enjoy 15% OFF on gadgets & accessories with code {code}!',
          },
          {
            id: 'electronics_vip',
            title: 'VIP Tech Privilege',
            target: 'vip',
            discountPercent: 20,
            offerCode: 'VIPTECH20',
            message: 'Dear {name}, thank you for shopping at {restaurant}! Enjoy exclusive 20% OFF genuine accessories with code {code}.',
          },
          {
            id: 'electronics_reengage',
            title: 'Smart Upgrade Deal',
            target: 'inactive',
            discountPercent: 10,
            offerCode: 'UPGRADE10',
            message: 'Hello {name}! Ready for your next tech upgrade? Visit {restaurant} today and get 10% OFF with code {code}!',
          },
        ];
      case 'Grocery & Supermarket':
        return [
          {
            id: 'grocery_savings',
            title: 'Supermarket Savings',
            target: 'all',
            discountPercent: 10,
            offerCode: 'GROCERY10',
            message: 'Hello {name}! Stock up on fresh groceries & daily essentials at {restaurant}! Flat 10% OFF on billing above ₹1000 with code {code}!',
          },
          {
            id: 'grocery_vip',
            title: 'VIP Family Basket',
            target: 'vip',
            discountPercent: 15,
            offerCode: 'VIPBASKET15',
            message: 'Dear {name}, thank you for being a valued shopper at {restaurant}! Take 15% OFF on your grocery bill with code {code}.',
          },
          {
            id: 'grocery_reengage',
            title: 'We Miss You Savings',
            target: 'inactive',
            discountPercent: 12,
            offerCode: 'SAVINGS12',
            message: 'Hello {name}! It has been a while since your last visit. Save 12% on your grocery basket today at {restaurant} with code {code}!',
          },
        ];
      case 'Cafe':
        return [
          {
            id: 'cafe_brew',
            title: 'Coffee & Snacks Treat',
            target: 'all',
            discountPercent: 15,
            offerCode: 'CAFE15',
            message: 'Hello {name}! Craving your favorite brew & snacks? Enjoy 15% OFF your cafe bill at {restaurant} with code {code}!',
          },
          {
            id: 'cafe_vip',
            title: 'VIP Beverage Treat',
            target: 'vip',
            discountPercent: 20,
            offerCode: 'VIPCAFE20',
            message: 'Dear {name}, thank you for making {restaurant} your favorite hangout! Enjoy 20% OFF today with code {code}!',
          },
          {
            id: 'cafe_reengage',
            title: 'We Miss Your Vibe!',
            target: 'inactive',
            discountPercent: 15,
            offerCode: 'CHILL15',
            message: "Hello {name}! We haven't seen you lately at {restaurant}. Drop in this week and grab 15% OFF your favorites with code {code}!",
          },
        ];
      case 'General Retail Store':
        return [
          {
            id: 'retail_special',
            title: 'Customer Appreciation',
            target: 'all',
            discountPercent: 15,
            offerCode: 'RETAIL15',
            message: 'Hello {name}! Thank you for shopping with {restaurant}. Enjoy 15% OFF on your next visit with code {code}!',
          },
          {
            id: 'retail_vip',
            title: 'VIP Member Privilege',
            target: 'vip',
            discountPercent: 20,
            offerCode: 'VIPMEMBER20',
            message: 'Dear {name}, as our honored customer at {restaurant}, enjoy 20% OFF on your purchase with code {code}!',
          },
          {
            id: 'retail_reengage',
            title: 'Welcome Back Discount',
            target: 'inactive',
            discountPercent: 10,
            offerCode: 'WELCOME10',
            message: 'Hello {name}! We miss seeing you at {restaurant}. Enjoy 10% OFF on your next billing with code {code}!',
          },
        ];
      case 'Restaurant':
      default:
        return [
          {
            id: 'inactive_reengage',
            title: 'We Miss You!',
            target: 'inactive',
            discountPercent: 15,
            offerCode: 'MISSYOU15',
            message: 'Hello {name}! It has been a while since your last visit. Treat yourself this week and enjoy 15% OFF at {restaurant} with code {code}!',
          },
          {
            id: 'vip_appreciation',
            title: 'VIP Loyalty Reward',
            target: 'vip',
            discountPercent: 20,
            offerCode: 'VIPDESSERT',
            message: 'Dear {name}, thank you for dining with us at {restaurant}! Enjoy a complimentary Chef Special Dessert & 20% OFF with code {code}.',
          },
          {
            id: 'weekend_special',
            title: 'Weekend Dining Special',
            target: 'all',
            discountPercent: 10,
            offerCode: 'WEEKEND10',
            message: 'Hello {name}! Dine with us this weekend at {restaurant} and enjoy 10% OFF on your table with code {code}!',
          },
        ];
    }
  };

  const defaultTemplates = templates.length > 0 ? templates : getCategoryTemplates(category);

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

      {errorMessage && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          color: '#fcd34d',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.92rem',
          fontWeight: 600,
        }}>
          <AlertCircle size={20} color="#f59e0b" />
          <span>{errorMessage}</span>
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

          {/* 1. Direct Customer Selector */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Select Customer to Send Offer *</span>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  Clear Selection
                </button>
              )}
            </label>

            {selectedCustomer ? (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(145deg, rgba(37, 211, 102, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#25d366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {(selectedCustomer.name || 'C').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#f8fafc' }}>
                      {selectedCustomer.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📞 +91 {selectedCustomer.phone}</span>
                      <span>•</span>
                      <span>{selectedCustomer.visitsCount || 1} {selectedCustomer.visitsCount === 1 ? 'Visit' : 'Visits'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <select
                  className="form-select"
                  value={selectedCustomer?._id || ''}
                  onChange={(e) => {
                    const found = customerList.find(c => c._id === e.target.value);
                    if (found) {
                      setSelectedCustomer(found);
                      setErrorMessage('');
                    }
                  }}
                  style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                >
                  <option value="">-- Choose Customer from list ({customerList.length} registered) --</option>
                  {customerList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — 📞 +91 {c.phone} ({c.visitsCount || 1} visits)
                    </option>
                  ))}
                </select>

                {customerList.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                    Tip: Is store me abhi koi customer nahi hai. Scan Bill page se pehle bill scan karein.
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                    Aap Customers page par kisi customer ke aage "Send Offer" dabakar bhi direct yahan aa sakte hain.
                  </div>
                )}
              </div>
            )}
          </div>

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
                <button
                  type="button"
                  onClick={() => handleInsertTag('{restaurant}')}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                >
                  + {'{restaurant}'}
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

          {/* Dispatch Direct WhatsApp Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                background: selectedCustomer ? '#25d366' : 'rgba(37, 211, 102, 0.35)',
                borderColor: selectedCustomer ? '#22c55e' : 'rgba(37, 211, 102, 0.2)',
                color: '#ffffff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: selectedCustomer ? 'pointer' : 'not-allowed',
                boxShadow: selectedCustomer ? '0 6px 20px rgba(37, 211, 102, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onClick={handleOpenWhatsAppDirect}
              disabled={!selectedCustomer}
            >
              <MessageSquare size={19} />
              <span>
                {selectedCustomer
                  ? `Open in WhatsApp & Send to ${selectedCustomer.name}`
                  : 'Select a Customer Above to Send on WhatsApp'}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyMessage}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.88rem',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Copy size={16} />
              <span>{copied ? '✓ Message Copied to Clipboard!' : 'Copy Offer Message Text'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Realistic WhatsApp Phone Mockup */}
        <div>
          <div className="phone-mockup">
            {/* Phone Top Bar */}
            <div className="phone-header">
              <div className="phone-avatar">
                {categoryEmoji}
              </div>
              <div>
                <div className="phone-title">{restaurantName}</div>
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
                  {personalizedMessage}
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
