import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';
import PaymentMethodIcon from '../PaymentMethodIcon';

const PAYMENT_METHODS = [
  'Easypaisa',
  'JazzCash',
  'Raast',
  'Bank Transfer',
  'SadaPay',
  'NayaPay',
  'Cash / Other',
];

export default function SettleNetBalanceModal({ isOpen, onClose, netSettlement, onSettlementComplete }) {
  const { user } = useAuth();
  const { createSettlement } = useSplitVault();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [senderNote, setSenderNote] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [copiedType, setCopiedType] = useState(null);

  useEffect(() => {
    if (!isOpen || !netSettlement) return;

    setError('');
    setAmount(netSettlement.amount ? String(netSettlement.amount) : '');
    setMethod('Easypaisa');
    setTransactionId('');
    setSenderNote('');
    setPaymentDate(new Date().toISOString().slice(0, 16));
    setImageUrl('');
    setShowBreakdown(true);
    setCopiedType(null);
  }, [isOpen, netSettlement]);

  if (!isOpen || !netSettlement) return null;

  const totalDue = Number(netSettlement.amount) || 0;
  const breakdown = netSettlement.breakdown || [];
  const recipientPayment = netSettlement.recipientPaymentDetails || {};

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP) from your gallery.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid settlement payment amount.');
      return;
    }

    if (!transactionId.trim() && !imageUrl) {
      setError('Please provide either a Transaction ID (TID) or upload your transfer screenshot slip.');
      return;
    }

    setSubmitting(true);
    const coveredExpenseIds = breakdown.map((item) => item.expenseId);

    const res = await createSettlement({
      toUserId: netSettlement.toUserId,
      groupId: netSettlement.groupId || null,
      amount: parsedAmount,
      coveredExpenseIds,
      method,
      transactionId: transactionId.trim(),
      imageUrl,
      senderNote: senderNote.trim(),
      paymentDate: paymentDate || new Date().toLocaleString(),
    });

    setSubmitting(false);

    if (res.success) {
      if (typeof onSettlementComplete === 'function') {
        onSettlementComplete(res.data);
      }
      onClose();
    } else {
      setError(res.error || 'Failed to submit settlement proof.');
    }
  };

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="sv-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="sv-modal-header__title" style={{ fontSize: '1.1rem' }}>
                Settle Net Balance
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Pay total debt once to clear all {breakdown.length} shared expense(s)
              </p>
            </div>
          </div>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="sv-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px 22px' }}>
            {error && (
              <div className="sv-alert sv-alert--danger" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Recipient Creditor Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(30, 41, 59, 0.5))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Paying To Creditor
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  {netSettlement.toUser}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {breakdown.length} expense(s) will be marked as settled
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Net Due
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                  Rs {totalDue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Creditor Fast Copy Payment Channels (If Provided) */}
            {(recipientPayment.easypaisa || recipientPayment.jazzcash || recipientPayment.phone) && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--sv-card-border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                  Roommate's Payment Accounts (Click to Copy):
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {recipientPayment.easypaisa && (
                    <button
                      type="button"
                      onClick={() => handleCopy(recipientPayment.easypaisa, 'easypaisa')}
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PaymentMethodIcon method="easypaisa" size={16} />
                      <span>Easypaisa: <strong>{recipientPayment.easypaisa}</strong></span>
                      {copiedType === 'easypaisa' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  )}
                  {recipientPayment.jazzcash && (
                    <button
                      type="button"
                      onClick={() => handleCopy(recipientPayment.jazzcash, 'jazzcash')}
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PaymentMethodIcon method="jazzcash" size={16} />
                      <span>JazzCash: <strong>{recipientPayment.jazzcash}</strong></span>
                      {copiedType === 'jazzcash' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  )}
                  {recipientPayment.phone && !recipientPayment.easypaisa && !recipientPayment.jazzcash && (
                    <button
                      type="button"
                      onClick={() => handleCopy(recipientPayment.phone, 'phone')}
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PaymentMethodIcon method="phone" size={16} />
                      <span>Mobile: <strong>{recipientPayment.phone}</strong></span>
                      {copiedType === 'phone' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Editable Settlement Amount (Allows Partial Payments) */}
            <div className="sv-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="sv-form-label" style={{ marginBottom: '4px' }}>
                  Settlement Payment Amount (Rs)
                </label>
                {parseFloat(amount) !== totalDue && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(totalDue))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Reset to Full Due (Rs {totalDue})
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                className="sv-form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount transferred"
                required
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                You can pay the full net amount (Rs {totalDue}) or enter a partial payment amount.
              </span>
            </div>

            {/* Progressive Disclosure: Collapsible Covered Expenses Breakdown */}
            {breakdown.length > 0 && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--sv-card-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setShowBreakdown((prev) => !prev)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Receipt size={14} color="#818cf8" />
                    Covered Expenses in this Transfer ({breakdown.length})
                  </span>
                  {showBreakdown ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>

                {showBreakdown && (
                  <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {breakdown.map((exp, idx) => (
                      <div
                        key={exp.expenseId || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.78rem',
                          padding: '4px 0',
                          borderBottom: idx < breakdown.length - 1 ? '1px dashed rgba(255, 255, 255, 0.06)' : 'none',
                        }}
                      >
                        <span style={{ color: '#cbd5e1' }}>{exp.title}</span>
                        <strong style={{ color: '#f59e0b' }}>Rs {Number(exp.amount).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="sv-form-group">
              <label className="sv-form-label" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PaymentMethodIcon method={method} size={15} />
                <span>Payment Method Used</span>
              </label>
              <select
                className="sv-form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction ID */}
            <div className="sv-form-group">
              <label className="sv-form-label" style={{ marginBottom: '4px' }}>
                Transaction ID (TID) / Reference Number
              </label>
              <input
                type="text"
                className="sv-form-input"
                placeholder="e.g. 02938471829 or Bank Ref Number"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            {/* Screenshot Receipt Upload Area */}
            <div className="sv-form-group">
              <label className="sv-form-label" style={{ marginBottom: '4px' }}>
                Transfer Receipt Screenshot
              </label>
              <div
                className={`sv-file-upload-zone ${isDragOver ? 'dragover' : ''} ${imageUrl ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--sv-card-border)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                }}
              >
                {imageUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={imageUrl}
                      alt="Proof Slip"
                      style={{ maxHeight: '110px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981' }}>
                      <CheckCircle2 size={14} /> Receipt attached
                    </div>
                    <label
                      htmlFor="settle-receipt-input"
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ cursor: 'pointer', padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      Change Slip
                    </label>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={24} style={{ color: '#818cf8', margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                      Drag & drop transfer screenshot here or{' '}
                      <label htmlFor="settle-receipt-input" style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
                        Browse Gallery
                      </label>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      Supports PNG, JPG, WebP slips
                    </div>
                  </div>
                )}
                <input
                  id="settle-receipt-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Sender Note */}
            <div className="sv-form-group">
              <label className="sv-form-label" style={{ marginBottom: '4px' }}>
                Note for Roommate (Optional)
              </label>
              <input
                type="text"
                className="sv-form-input"
                placeholder="e.g. Sent via Easypaisa for November expenses"
                value={senderNote}
                onChange={(e) => setSenderNote(e.target.value)}
              />
            </div>
          </div>

          <div className="sv-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid var(--sv-card-border)' }}>
            <button
              type="button"
              className="splitvault-btn splitvault-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="splitvault-btn splitvault-btn--primary"
              disabled={submitting}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 700 }}
            >
              <FileCheck size={16} />
              {submitting ? 'Submitting Proof...' : `Submit Settlement (Rs ${Number(amount || totalDue).toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
