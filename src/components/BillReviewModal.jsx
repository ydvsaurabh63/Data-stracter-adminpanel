import React, { useState } from 'react';
import { CheckCircle2, UserCheck, Sparkles, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const BillReviewModal = ({ extractedData, onClose, onSaved }) => {
  const { billImageUrl, extracted, customerMatch } = extractedData;

  const [customerName, setCustomerName] = useState(extracted.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(extracted.customerPhone || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [items, setItems] = useState(extracted.items || []);
  const [subtotal, setSubtotal] = useState(extracted.subtotal || 0);
  const [tax, setTax] = useState(extracted.tax || 0);
  const [totalAmount, setTotalAmount] = useState(extracted.totalAmount || 0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Recalculate totals
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'name' ? value : Number(value);
    if (field === 'qty' || field === 'price') {
      updated[index].amount = (updated[index].qty || 1) * (updated[index].price || 0);
    }
    setItems(updated);

    const newSubtotal = updated.reduce((sum, item) => sum + (item.amount || 0), 0);
    setSubtotal(newSubtotal);
    const newTax = Math.round(newSubtotal * 0.05);
    setTax(newTax);
    setTotalAmount(newSubtotal + newTax);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', qty: 1, price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const newSubtotal = updated.reduce((sum, item) => sum + (item.amount || 0), 0);
    setSubtotal(newSubtotal);
    const newTax = Math.round(newSubtotal * 0.05);
    setTax(newTax);
    setTotalAmount(newSubtotal + newTax);
  };

  const handleConfirmSave = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit customer mobile number');
      return;
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      setError('Please provide a valid bill amount');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        totalAmount: Number(totalAmount),
        subtotal: Number(subtotal),
        tax: Number(tax),
        items,
        billImageUrl,
        paymentMethod,
        notes,
        billDate: extracted.billDate || new Date(),
      };

      const res = await api.confirmBill(payload);
      if (res.success) {
        onSaved(res.data);
      } else {
        setError(res.message || 'Failed to save bill');
      }
    } catch (err) {
      setError(err.message || 'Error saving bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Review Bill</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Status Banner (Minimal) */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          marginBottom: '16px',
          background: customerMatch.isExisting ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          border: customerMatch.isExisting ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {customerMatch.isExisting ? (
            <UserCheck size={18} color="#f59e0b" />
          ) : (
            <Sparkles size={18} color="#818cf8" />
          )}

          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: customerMatch.isExisting ? '#fbbf24' : '#a5b4fc' }}>
            {customerMatch.isExisting
              ? `Returning Customer (Visit #${customerMatch.previousVisits + 1}) • ₹${customerMatch.previousTotalSpent.toLocaleString('en-IN')} spent`
              : 'New Customer (1st Visit)'}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '18px' }}>
          <div className="form-group">
            <label className="form-label">Customer Mobile Number *</label>
            <input
              type="tel"
              className="form-input"
              value={customerPhone}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9876543210"
              style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.04em' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
        </div>

        {/* Bill Items List */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="form-label">Ordered Items ({items.length})</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddItem}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#090d16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 3, minWidth: '95px', padding: '6px 8px', fontSize: '0.85rem' }}
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  placeholder="Item / Product name"
                />
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '50px', padding: '6px 4px', fontSize: '0.85rem', textAlign: 'center' }}
                  value={item.qty}
                  min="1"
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  title="Quantity"
                />
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '70px', padding: '6px 6px', fontSize: '0.85rem' }}
                  value={item.price}
                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                  placeholder="₹ Price"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div style={{
          background: '#090d16',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>
            <span>Subtotal</span>
            <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
            <span>Taxes & GST</span>
            <span>₹{Number(tax).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Amount:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>₹</span>
              <input
                type="number"
                className="form-input"
                style={{ width: '120px', padding: '6px 10px', fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmSave}
            disabled={saving}
            style={{ minWidth: '180px' }}
          >
            {saving ? 'Recording...' : (
              <>
                <CheckCircle2 size={18} />
                Save & Update Visit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
