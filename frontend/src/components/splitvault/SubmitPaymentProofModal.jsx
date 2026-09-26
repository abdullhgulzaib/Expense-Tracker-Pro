import React, { useState, useEffect } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

const PAYMENT_METHODS = [
  'Easypaisa',
  'JazzCash',
  'Raast',
  'Bank Transfer',
  'SadaPay',
  'NayaPay',
  'Cash / Other',
];

export default function SubmitPaymentProofModal({ isOpen, onClose, expense, splitData }) {
  const { user } = useAuth();
  const { submitProof } = useSplitVault();

  const [method, setMethod] = useState('Easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [senderNote, setSenderNote] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setMethod('Easypaisa');
    setTransactionId('');
    setSenderNote('');
    setPaymentDate(new Date().toISOString().slice(0, 16));
    setImageUrl('');
  }, [isOpen]);

  if (!isOpen || !expense) return null;

  // File Upload Handlers (converts image from Gallery/Device to Base64)
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

    if (!imageUrl) {
      setError('Please upload a screenshot proof from your gallery before submitting.');
      return;
    }
    if (!transactionId.trim()) {
      setError('Please enter the Transaction ID (TID) or reference number.');
      return;
    }

    setSubmitting(true);
    const splitUserId = splitData?.user?._id || splitData?.user || splitData?._id || user?._id;
    const res = await submitProof(expense._id, splitUserId, {
      method,
      transactionId: transactionId.trim(),
      imageUrl,
      senderNote: senderNote.trim(),
      paymentDate,
    });

    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to submit payment proof.');
    }
  };

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <h2 className="sv-modal-header__title">
            <UploadCloud size={20} color="#2563eb" />
            <span>Upload Payment Proof</span>
          </h2>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="sv-modal-body">
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Expense Summary Banner */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                  You are settling
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                  {expense.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Payer / Recipient: <strong style={{ color: '#ffffff' }}>{expense.paidByName}</strong>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                  Your Share
                </span>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981' }}>
                  Rs {Number(splitData?.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Screenshot Upload from Gallery / Device */}
            <div className="sv-form-group">
              <label className="sv-form-label">
                Upload Payment Screenshot (From Gallery) <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {imageUrl ? (
                <div className="sv-receipt-preview-box" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  <img
                    src={imageUrl}
                    alt="Receipt Screenshot"
                    className="sv-receipt-preview-img"
                    style={{ maxHeight: '280px', width: '100%', objectFit: 'contain', background: '#0a0f1d' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      right: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(5, 10, 24, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Check size={14} color="#10b981" /> Ready to send to {expense.paidByName}
                    </span>
                    <label
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      <ImageIcon size={13} /> Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  className={`sv-dropzone ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed rgba(59, 130, 246, 0.45)',
                    borderRadius: '16px',
                    padding: '28px 16px',
                    cursor: 'pointer',
                    background: 'rgba(15, 23, 42, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="sv-dropzone__icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={26} />
                  </div>
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                      Click to choose screenshot from Gallery
                    </strong>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                      Supports PNG, JPG, JPEG, WebP receipts from mobile banking apps
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Payment Method & Transaction ID */}
            <div className="sv-form-row">
              <div className="sv-form-group">
                <label className="sv-form-label">Payment Channel</label>
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

              <div className="sv-form-group">
                <label className="sv-form-label">Transaction ID (TID) / Ref <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="e.g. 1029384756 or TRX-99218"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date & Note */}
            <div className="sv-form-row">
              <div className="sv-form-group">
                <label className="sv-form-label">Date & Time Sent</label>
                <input
                  type="datetime-local"
                  className="sv-form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">Note for {expense.paidByName} (Optional)</label>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="e.g. Sent via Raast from HBL app"
                  value={senderNote}
                  onChange={(e) => setSenderNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="sv-modal-footer">
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
            >
              <CheckCircle2 size={18} />
              {submitting ? 'Submitting...' : 'Send Proof to Payer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
