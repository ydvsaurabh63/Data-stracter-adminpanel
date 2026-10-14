import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Receipt,
  Send,
  Crown,
  Star,
  Clock,
  Sparkles,
  MessageSquare,
  IndianRupee,
  Download,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { api } from '../services/api';

export const CustomerDetailsModal = ({ customerId, onClose, onSendOffer }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.getCustomerDetails(customerId);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchDetails();
  }, [customerId]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '500px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontSize: '1.1rem', fontWeight: 700 }}>
            <Sparkles className="spin-slow" size={24} />
            <span>Loading Customer History...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { customer, bills, stats } = data;
  const isVip = customer.visitsCount >= 5;
  const isRegular = customer.visitsCount > 1 && customer.visitsCount < 5;
  const initials = (customer.name || 'G').slice(0, 1).toUpperCase();

  // Avatar gradient
  const avatarGradient = isVip
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // Export this customer's individual bills to CSV
  const handleExportCustomerBills = () => {
    if (!bills || bills.length === 0) {
      alert('No bills to export for this customer');
      return;
    }
    const headers = ['#', 'Date', 'Bill No', 'Items', 'Subtotal (INR)', 'Tax / GST (INR)', 'Total Amount (INR)', 'Payment Method'];
    const rows = bills.map((b, idx) => {
      const dateStr = new Date(b.billDate).toLocaleDateString('en-IN');
      const itemsStr = (b.items || []).map(i => `${i.name} (x${i.qty || 1})`).join('; ');
      return [
        idx + 1,
        `"${dateStr}"`,
        `"${b.billNumber || b._id}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        b.subtotal || b.totalAmount || 0,
        b.tax || 0,
        b.totalAmount || 0,
        `"${b.paymentMethod || 'Cash'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${customer.name.replace(/\s+/g, '_')}_Bills_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanPhone = '91' + (customer.phone || '').replace(/\D/g, '').slice(-10);

  return (
    <div className="modal-overlay">
      <div
        className="modal-dialog"
        style={{
          maxWidth: '920px',
          width: '95%',
          background: 'linear-gradient(180deg, #0e1526 0%, #090d18 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
          padding: '24px 28px'
        }}
      >
        {/* 1. Modal Top Bar / Customer Identity */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: avatarGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: isVip ? '0 0 20px rgba(245, 158, 11, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.3)',
              flexShrink: 0
            }}>
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                  {customer.name}
                </h2>

                {isVip && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
                  }}>
                    <Crown size={12} fill="#fbbf24" color="#fbbf24" />
                    <span>VIP GUEST</span>
                  </span>
                )}

                {isRegular && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}>
                    <Star size={11} fill="#34d399" color="#34d399" />
                    <span>REGULAR</span>
                  </span>
                )}

                {!isVip && !isRegular && (
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    NEW GUEST
                  </span>
                )}

                {stats.daysSinceLastVisit > 20 && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    ⚠️ Inactive ({stats.daysSinceLastVisit}d)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.84rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}
                  title="Click to chat on WhatsApp"
                >
                  <Phone size={13} color="#25d366" />
                  <span>+91 {customer.phone}</span>
                </a>

                <span>•</span>
                <span>Member since {new Date(customer.firstVisit).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Four Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '22px', gap: '14px' }}>
          {/* Total Visits */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 26, 0.95) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Visits
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', lineHeight: 1.1 }}>
              {customer.visitsCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '4px' }}>
              {customer.visitsCount >= 5 ? '⭐️ VIP Frequency' : 'Verified Visits'}
            </div>
          </div>

          {/* Total Spent */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 26, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Spent
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981', marginTop: '4px', lineHeight: 1.1 }}>
              ₹{customer.totalSpent.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
              Lifetime Revenue
            </div>
          </div>

          {/* Avg. Per Visit */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 26, 0.95) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg. Per Visit
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px', lineHeight: 1.1 }}>
              ₹{customer.averageBillValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7dd3fc', marginTop: '4px' }}>
              Per Bill Average
            </div>
          </div>

          {/* Last Visit */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 26, 0.95) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Last Visit
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px', lineHeight: 1.1 }}>
              {new Date(customer.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
            <div style={{ fontSize: '0.72rem', color: stats.daysSinceLastVisit > 20 ? '#f87171' : '#94a3b8', marginTop: '4px' }}>
              {stats.daysSinceLastVisit === 0 ? 'Dined Today' : `${stats.daysSinceLastVisit} days ago`}
            </div>
          </div>
        </div>

        {/* 3. Customer Itemized History Table (Clean High-Contrast White Background) */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={17} color="#10b981" />
              <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.98rem' }}>
                Itemized Bill History
              </span>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 800
              }}>
                {bills.length} Invoices
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportCustomerBills}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 10px',
                borderRadius: '7px',
                color: '#cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Download this customer's receipts as CSV"
            >
              <Download size={13} />
              <span>Export Receipts</span>
            </button>
          </div>

          {/* Pure White Table Container */}
          <div style={{
            maxHeight: '340px',
            overflowY: 'auto',
            overflowX: 'auto',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', minWidth: '650px', color: '#1e293b' }}>
              <thead>
                <tr style={{
                  background: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2
                }}>
                  <th style={{ padding: '14px 16px', width: '130px', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ padding: '14px 16px', width: '130px', whiteSpace: 'nowrap' }}>Bill No</th>
                  <th style={{ padding: '14px 20px', minWidth: '220px' }}>Item Name</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>Quantity</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', width: '130px', whiteSpace: 'nowrap' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🧾</div>
                      <div style={{ fontWeight: 700, color: '#334155' }}>No receipts on record</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Scan a bill to add invoices to this guest.</div>
                    </td>
                  </tr>
                ) : (
                  bills.map((bill, bIdx) => {
                    const dateStr = new Date(bill.billDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const timeStr = new Date(bill.billDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const billNoStr = bill.billNumber || `#${bill._id.slice(-6).toUpperCase()}`;
                    const hasItems = bill.items && bill.items.length > 0;

                    return (
                      <tr
                        key={bill._id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: bIdx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* 1. Date */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>
                            {dateStr}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            {timeStr}
                          </div>
                        </td>

                        {/* 2. Bill No */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            border: '1px solid #bae6fd'
                          }}>
                            {billNoStr}
                          </span>
                        </td>

                        {/* 3. Item Name */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'top' }}>
                          {hasItems ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {bill.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }}></span>
                                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                                    {item.name || 'General Item'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.84rem' }}>Standard Dining</span>
                          )}
                        </td>

                        {/* 4. Quantity */}
                        <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                          {hasItems ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {bill.items.map((item, i) => (
                                <div key={i}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '1px 7px',
                                    borderRadius: '5px',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    border: '1px solid #fde68a'
                                  }}>
                                    {item.qty || 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '1px 7px',
                              borderRadius: '5px',
                              background: '#fef3c7',
                              color: '#b45309',
                              fontWeight: 800,
                              fontSize: '0.8rem'
                            }}>
                              1
                            </span>
                          )}
                        </td>

                        {/* 5. Total Amount */}
                        <td style={{ padding: '14px 20px', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                            ₹{(bill.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                          {bill.paymentMethod && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              {bill.paymentMethod}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: '9px'
            }}
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(`Hello ${customer.name}! Greetings from our restaurant. Thank you for your continued visits!`);
                window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '9px',
                background: '#25d366',
                border: '1px solid #22c55e',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
              }}
            >
              <MessageSquare size={16} />
              <span>Chat on WhatsApp</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onSendOffer(customer);
              }}
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                fontWeight: 800,
                borderRadius: '9px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Send size={15} />
              <span>Send Promo Offer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
