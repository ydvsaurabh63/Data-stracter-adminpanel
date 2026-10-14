import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Repeat,
  UserX,
  IndianRupee,
  Camera,
  Send,
  FileSpreadsheet,
  Download,
  Eye,
  Star,
  Search,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Crown,
  Calendar,
  History,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';

export const DashboardPage = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'vip' | 'regular' | 'new'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const {
    totalCustomers = 0,
    repeatCustomers = 0,
    repeatRate = 0,
    inactiveCustomers = 0,
    totalBills = 0,
    totalRevenue = 0,
    uniqueCustomers = [],
  } = analytics || {};

  // Status counts for filter pills
  const counts = useMemo(() => {
    let vip = 0;
    let regular = 0;
    let newCust = 0;
    uniqueCustomers.forEach((c) => {
      if (c.visitsCount >= 5) vip++;
      else if (c.visitsCount > 1) regular++;
      else newCust++;
    });
    return { vip, regular, newCust };
  }, [uniqueCustomers]);

  // Filtered customers based on search and status tabs
  const filteredCustomers = useMemo(() => {
    return uniqueCustomers.filter((c) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q));

      // Status filter
      let matchStatus = true;
      if (statusFilter === 'vip') matchStatus = c.visitsCount >= 5;
      else if (statusFilter === 'regular') matchStatus = c.visitsCount > 1 && c.visitsCount < 5;
      else if (statusFilter === 'new') matchStatus = c.visitsCount === 1;

      return matchSearch && matchStatus;
    });
  }, [uniqueCustomers, searchQuery, statusFilter]);

  // Avatar gradient color generator based on name
  const getAvatarGradient = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const handleExportCSV = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      alert('No customer records available to export');
      return;
    }

    const headers = ['#', 'Customer Name', 'Phone Number (Unique)', 'Total Visits', 'Total Spent (INR)', 'First Visit', 'Last Visit', 'Status'];
    const rows = filteredCustomers.map((c, idx) => {
      const statusStr = c.visitsCount >= 5 ? 'VIP' : c.visitsCount > 1 ? 'Regular' : 'New';
      return [
        idx + 1,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${c.phone ? '+91 ' + c.phone : ''}"`,
        c.visitsCount || 1,
        c.totalSpent || 0,
        `"${new Date(c.firstVisit || Date.now()).toLocaleDateString('en-IN')}"`,
        `"${new Date(c.lastVisit || Date.now()).toLocaleDateString('en-IN')}"`,
        `"${statusStr}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `All_Customer_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontSize: '1.1rem', fontWeight: 700 }}>
          <Sparkles className="spin-slow" size={24} />
          <span>Loading AI Customer Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              LIVE AI SYSTEM
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>• {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            Executive Dashboard
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Real-time customer analytics, repeat visits & automated retention engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('marketing')}
            style={{
              padding: '10px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Send size={15} color="#38bdf8" />
            <span>Send Offer</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onNavigate('scan')}
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
              fontWeight: 800,
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Camera size={17} />
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (Modern Glassmorphic Cards) */}
      <div className="grid-4" style={{ marginBottom: '24px', gap: '16px' }}>
        {/* Card 1: Total Customers */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 23, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #38bdf8 0%, transparent 100%)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Customers
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
            {totalCustomers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: '#38bdf8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }}></span>
            <span>100% Unique Phone Records</span>
          </div>
        </div>

        {/* Card 2: Repeat Rate */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 23, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10b981 0%, transparent 100%)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Repeat Rate
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Repeat size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>
            {repeatRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: '#34d399' }}>
            <TrendingUp size={13} />
            <span>{repeatCustomers} Returning Diners</span>
          </div>
        </div>

        {/* Card 3: Inactive Diners */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 23, 0.95) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #f43f5e 0%, transparent 100%)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inactive Diners
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f43f5e', lineHeight: 1.1 }}>
            {inactiveCustomers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: '#fda4af' }}>
            <span>&gt; 20 Days Since Visit</span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 23, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #f59e0b 0%, transparent 100%)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Revenue
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.1 }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', color: '#fbbf24' }}>
            <span>{totalBills} Total Bills Recorded</span>
          </div>
        </div>
      </div>

      {/* 3. Inactive Diners Alert Banner (if any) */}
      {inactiveCustomers > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.04) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#fecdd3' }}>
                {inactiveCustomers} customers haven't dined in the last 20 days
              </div>
              <div style={{ fontSize: '0.8rem', color: '#fda4af' }}>
                Re-engage them with a quick 15% OFF WhatsApp campaign to boost repeat revenue.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: 700 }}
            onClick={() => onNavigate('marketing')}
          >
            <Send size={14} /> Send Retention Offer
          </button>
        </div>
      )}

      {/* 4. MAIN DATA SECTION: All Customer Data (High-end Spreadsheet) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 14, 23, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Section Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                All Customer Data
              </h2>
              <span style={{
                fontSize: '0.74rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 800
              }}>
                {filteredCustomers.length} Records
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Unified customer directory with visit history, cumulative spend & WhatsApp actions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px'
              }}
              title="Download structured data as Excel (.csv)"
            >
              <Download size={15} />
              <span>Download Excel (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Interactive Search & Filter Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '18px',
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {/* Live Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 34px 8px 36px',
                color: '#f8fafc',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <X
                size={14}
                style={{ position: 'absolute', right: '10px', top: '12px', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${uniqueCustomers.length})` },
              { id: 'vip', label: `👑 VIP (${counts.vip})` },
              { id: 'regular', label: `⭐️ Regular (${counts.regular})` },
              { id: 'new', label: `🌱 New (${counts.newCust})` },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: active ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: active ? 'rgba(245, 158, 11, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#f59e0b' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* High-End Spreadsheet Table */}
        {filteredCustomers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>No customers found</div>
            <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
              {searchQuery ? `No matching customers for "${searchQuery}"` : 'Scan your first customer receipt to build your database!'}
            </div>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(10, 14, 23, 0.6)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  <th style={{ padding: '14px 16px', width: '48px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '14px 20px', minWidth: '220px' }}>Customer</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', minWidth: '120px' }}>Visits</th>
                  <th style={{ padding: '14px 36px 14px 16px', textAlign: 'right', minWidth: '150px' }}>Total Spent</th>
                  <th style={{ padding: '14px 20px 14px 36px', minWidth: '170px', whiteSpace: 'nowrap' }}>Last Visit</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', minWidth: '100px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', minWidth: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust, index) => {
                  const isVip = cust.visitsCount >= 5;
                  const isRegular = cust.visitsCount > 1 && cust.visitsCount < 5;
                  const initials = (cust.name || 'G').slice(0, 1).toUpperCase();

                  return (
                    <tr
                      key={cust._id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        transition: 'background 0.15s ease'
                      }}
                      className="excel-table-row"
                    >
                      {/* Index */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        <span style={{
                          display: 'inline-block',
                          width: '24px',
                          height: '24px',
                          lineHeight: '24px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          fontSize: '0.78rem'
                        }}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Customer Avatar & Name & Phone */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: getAvatarGradient(cust.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                          }}>
                            {initials}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f8fafc' }}>
                                {cust.name}
                              </span>
                              {isVip && (
                                <Crown size={14} color="#f59e0b" fill="#f59e0b" title="VIP Guest" />
                              )}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#38bdf8', marginTop: '2px', fontFamily: 'monospace', fontWeight: 600 }}>
                              📞 +91 {cust.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Visits Pill Badge */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: isVip
                            ? 'rgba(245, 158, 11, 0.18)'
                            : isRegular
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(148, 163, 184, 0.12)',
                          color: isVip ? '#fbbf24' : isRegular ? '#34d399' : '#cbd5e1',
                          border: isVip
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : isRegular
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(148, 163, 184, 0.2)'
                        }}>
                          {cust.visitsCount > 1 && <Star size={12} fill={isVip ? '#f59e0b' : '#10b981'} color={isVip ? '#f59e0b' : '#10b981'} />}
                          <span>{cust.visitsCount} {cust.visitsCount === 1 ? 'Visit' : 'Visits'}</span>
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td style={{ padding: '14px 36px 14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#10b981',
                          letterSpacing: '-0.01em'
                        }}>
                          ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td style={{ padding: '14px 20px 14px 36px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="#64748b" />
                          <span style={{ fontWeight: 600 }}>
                            {new Date(cust.lastVisit || cust.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', paddingLeft: '19px' }}>
                          {new Date(cust.lastVisit || cust.updatedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: isVip
                            ? 'rgba(245, 158, 11, 0.2)'
                            : isRegular
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)',
                          color: isVip ? '#fbbf24' : isRegular ? '#34d399' : '#38bdf8',
                          border: isVip
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : isRegular
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          {isVip ? '👑 VIP' : isRegular ? '⭐️ Regular' : '🌱 New'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedCustomerId(cust._id)}
                            style={{
                              padding: '6px 11px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '7px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                            title={`View all ${cust.visitsCount} bills of ${cust.name}`}
                          >
                            <History size={13} />
                            <span>History</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              // Direct WhatsApp chat
                              const cleanPhone = '91' + cust.phone.replace(/\D/g, '').slice(-10);
                              const text = encodeURIComponent(`Hello ${cust.name}! Greetings from our restaurant. We would love to welcome you back!`);
                              window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                            }}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '7px',
                              border: '1px solid rgba(37, 211, 102, 0.35)',
                              background: 'rgba(37, 211, 102, 0.12)',
                              color: '#25d366',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            title={`Send direct WhatsApp message to ${cust.name}`}
                          >
                            <MessageSquare size={14} />
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

      {/* View Customer All Bills Modal */}
      {selectedCustomerId && (
        <CustomerDetailsModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onSendOffer={() => {
            setSelectedCustomerId(null);
            onNavigate('marketing');
          }}
        />
      )}
    </div>
  );
};
