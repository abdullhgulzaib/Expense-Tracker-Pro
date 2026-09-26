import React, { useState, useEffect } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';
import { generateSampleReceipt } from '../../utils/receiptPresets';

const PAYMENT_METHODS = [
  'Easypaisa',
  'JazzCash',
  'Raast',
  'Bank Transfer',
  'SadaPay',
  'Nayapay',
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
    setTransactionId(`EP-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setSenderNote('');
    setPaymentDate(new Date().toISOString().slice(0, 16));
    setImageUrl('');

    // Pre-populate with sample Easypaisa receipt so user has a ready-to-test proof immediately
    const sample = generateSampleReceipt('Easypaisa', {
      amount: splitData?.amount || 1500,
      recipient: expense?.paidByName || 'Hostel Roommate',
      tid: `EP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    });
    setImageUrl(sample);
  }, [isOpen, expense, splitData]);

  if (!isOpen || !expense) return null;

  // File Upload Handlers (converts image to Base64)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
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

  // Select Sample Presets
  const handleApplyPreset = (type) => {
    setMethod(type);
    const generatedTid = `${type.slice(0, 2).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTransactionId(generatedTid);
    const sample = generateSampleReceipt(type, {
      amount: splitData?.amount || 1500,
      recipient: expense?.paidByName || 'Roommate',
      tid: generatedTid,
    });
    setImageUrl(sample);
    setSenderNote(`Paid via ${type} mobile app. Transaction ID: ${generatedTid}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!transactionId.trim()) {
      setError('Please provide a Transaction ID / Reference Number.');
      return;
    }
    if (!imageUrl) {
      setError('Please upload or generate a screenshot receipt of the payment.');
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
            <UploadCloud size={20} color="#6366f1" />
            <span>Submit Payment Proof</span>
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
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 600 }}>
                  You are paying
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#ffffff' }}>
                  {expense.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Recipient: <strong style={{ color: '#ffffff' }}>{expense.paidByName}</strong>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase' }}>
                  Your Share
                </span>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>
                  Rs {Number(splitData?.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Presets Selection Bar */}
            <div className="sv-form-group">
              <label className="sv-form-label">
                Quick Sample Presets (For instant testing)
              </label>
              <div className="sv-presets-bar">
                <button
                  type="button"
                  className="sv-preset-chip"
                  onClick={() => handleApplyPreset('Easypaisa')}
                >
                  🟢 Easypaisa Sample
                </button>
                <button
                  type="button"
                  className="sv-preset-chip"
                  onClick={() => handleApplyPreset('JazzCash')}
                >
                  🔴 JazzCash Sample
                </button>
                <button
                  type="button"
                  className="sv-preset-chip"
                  onClick={() => handleApplyPreset('Raast')}
                >
                  🔵 Raast / Bank Sample
                </button>
              </div>
            </div>

            {/* Screenshot Dropzone */}
            <div className="sv-form-group">
              <label className="sv-form-label">Payment Receipt Screenshot</label>
              {imageUrl ? (
                <div className="sv-receipt-preview-box">
                  <img
                    src={imageUrl}
                    alt="Receipt Screenshot"
                    className="sv-receipt-preview-img"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    <label
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                      style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.85)' }}
                    >
                      <ImageIcon size={14} /> Change Image
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
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="sv-dropzone__icon">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <strong style={{ color: '#e5e7eb', fontSize: '0.95rem' }}>
                      Click to upload receipt screenshot
                    </strong>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                      or drag & drop PNG, JPG, or WebP screenshot
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
                <label className="sv-form-label">Transaction ID (TID) / Ref</label>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="e.g. TRX-84920492"
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
                <label className="sv-form-label">Note for {expense.paidByName}</label>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="e.g. Sent from my JazzCash account"
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
              {submitting ? 'Submitting...' : 'Submit Proof to Payer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
