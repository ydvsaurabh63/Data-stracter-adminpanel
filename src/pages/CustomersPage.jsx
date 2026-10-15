import React, { useEffect, useState } from 'react';
import { Search, Filter, History, Send, UserCheck, Star, Clock } from 'lucide-react';
import { api } from '../services/api';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';

export const CustomersPage = ({ onSendOfferToCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ search, filter });
      if (res.success) {
        setCustomers(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, filter]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Customers</h1>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', flex: '1 1 240px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          </div>

          {/* Filter Pills (Smooth scroll on Mobile/Tablet) */}
          <div className="filter-pills-row">
            {[
              { id: 'all', label: 'All' },
              { id: 'vip', label: 'VIP' },
              { id: 'regular', label: 'Regular' },
              { id: 'new', label: 'New' },
              { id: 'inactive_20', label: 'Inactive' },
              { id: 'high_spender', label: 'High Spenders' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-secondary ${filter === f.id ? 'active' : ''}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '9999px',
                  borderColor: filter === f.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                  background: filter === f.id ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: filter === f.id ? '#f59e0b' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Records Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#f59e0b' }}>Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8' }}>
            No customers match the current filter or search criteria.
          </div>
        ) : (
          <div className="table-scroll-container">
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border-color)', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Customer</th>
                  <th style={{ padding: '14px 16px' }}>Visits</th>
                  <th style={{ padding: '14px 16px' }}>Total Spent</th>
                  <th style={{ padding: '14px 16px' }}>Last Visit</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const daysSince = Math.floor((new Date() - new Date(cust.lastVisit)) / (1000 * 60 * 60 * 24));
                  return (
                    <tr
                      key={cust._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f8fafc' }}>{cust.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>📞 +91 {cust.phone}</div>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            background: cust.visitsCount >= 5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                            color: cust.visitsCount >= 5 ? '#fbbf24' : '#93c5fd',
                            border: cust.visitsCount >= 5 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                          }}>
                            {cust.visitsCount} {cust.visitsCount === 1 ? 'Visit' : 'Visits'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 16px', fontWeight: 800, color: '#10b981' }}>
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ color: '#f8fafc' }}>
                          {new Date(cust.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: daysSince > 20 ? '#ef4444' : '#64748b' }}>
                          {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setSelectedCustomerId(cust._id)}
                            title="View all scanned bills and items"
                          >
                            <History size={14} /> View History
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => onSendOfferToCustomer(cust)}
                            title="Send WhatsApp promo"
                          >
                            <Send size={14} /> Send Offer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Full History Modal */}
      {selectedCustomerId && (
        <CustomerDetailsModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onSendOffer={(cust) => onSendOfferToCustomer(cust)}
        />
      )}
    </div>
  );
};
