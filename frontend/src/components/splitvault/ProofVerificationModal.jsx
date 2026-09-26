import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

export default function ProofVerificationModal({ isOpen, onClose, expense, splitData }) {
  const { user } = useAuth();
  const { verifyProof } = useSplitVault();

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !expense || !splitData) return null;

  // STRICT PAYER-ONLY AUTHORIZATION CHECK (Defense in Depth)
  const isPayer = expense.paidBy?.toString() === user?._id?.toString();

  const proof = splitData.proof || {};
  const tid = proof.transactionId || 'N/A';
  const method = proof.method || 'Mobile Wallet';
  const amount = splitData.amount || 0;
  const debtorName = splitData.name || 'Roommate';

  const handleCopyTid = () => {
    if (tid && tid !== 'N/A') {
      navigator.clipboard.writeText(tid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApprove = async () => {
    setError('');
    setSubmitting(true);
    const res = await verifyProof(expense._id, splitData.user, {
      action: 'APPROVE',
    });
    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to verify payment proof.');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejecting this proof (e.g. TID mismatch, payment not received).');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await verifyProof(expense._id, splitData.user, {
      action: 'REJECT',
      reason: rejectionReason.trim(),
    });
    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to reject payment proof.');
    }
  };

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog sv-modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <h2 className="sv-modal-header__title">
            <ShieldCheck size={20} color="#10b981" />
            <span>Payment Proof Verification Desk</span>
          </h2>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {!isPayer ? (
          <div className="sv-modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>
              Payer-Only Verification Restriction
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Only the person who paid for this expense upfront (<strong>{expense.paidByName}</strong>)
              has the authorization to verify and settle payment receipts.
            </p>
            <div style={{ marginTop: '24px' }}>
              <button className="splitvault-btn splitvault-btn--secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

              <div className="sv-verification-grid">
                {/* Left Column: Full Receipt Image Viewer */}
                <div className="sv-verification-image-col">
                  {proof.imageUrl ? (
                    <img
                      src={proof.imageUrl}
                      alt="Uploaded Payment Receipt"
                      className="sv-verification-image"
                    />
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      No receipt screenshot attached.
                    </div>
                  )}
                </div>

                {/* Right Column: Key Details Table */}
                <div className="sv-verification-details-col">
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a5b4fc', fontWeight: 600 }}>
                      Proof Claim For
                    </span>
                    <h3 style={{ margin: '2px 0 4px', fontSize: '1.2rem', color: '#ffffff' }}>
                      {expense.title}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Payer: You ({user?.name}) • Total Bill: Rs {Number(expense.totalAmount).toLocaleString()}
                    </span>
                  </div>

                  <div className="sv-detail-table">
                    <div className="sv-detail-row">
                      <span className="sv-detail-label">Amount Settled</span>
                      <span className="sv-detail-val" style={{ color: '#10b981', fontSize: '1.25rem' }}>
                        Rs {Number(amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="sv-detail-row">
                      <span className="sv-detail-label">Paid By</span>
                      <span className="sv-detail-val">{debtorName}</span>
                    </div>

                    <div className="sv-detail-row">
                      <span className="sv-detail-label">Payment Channel</span>
                      <span className="sv-detail-val" style={{ color: '#818cf8' }}>
                        {method}
                      </span>
                    </div>

                    <div className="sv-detail-row">
                      <span className="sv-detail-label">Transaction ID (TID)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="sv-detail-val" style={{ fontFamily: 'monospace', color: '#fde047' }}>
                          {tid}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTid}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                          title="Copy TID"
                        >
                          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="sv-detail-row">
                      <span className="sv-detail-label">Submitted On</span>
                      <span className="sv-detail-val" style={{ fontSize: '0.8rem' }}>
                        {proof.submittedAt
                          ? new Date(proof.submittedAt).toLocaleString()
                          : new Date().toLocaleString()}
                      </span>
                    </div>

                    {proof.senderNote && (
                      <div className="sv-detail-row" style={{ flexDirection: 'column', gap: '4px' }}>
                        <span className="sv-detail-label">Debtor's Note:</span>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: '#e2e8f0',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          "{proof.senderNote}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sv-payer-notice">
                    🛡️ <strong>Verification Protection:</strong> Please check your {method} account to confirm that Rs {Number(amount).toLocaleString()} was received before approving. Once approved, {debtorName}'s debt is settled.
                  </div>

                  {showRejectInput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#fb7185', fontWeight: 600 }}>
                        Reason for Rejection
                      </label>
                      <input
                        type="text"
                        className="sv-form-input"
                        placeholder="e.g. TID not found in my account, wrong amount"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sv-modal-footer">
              {!showRejectInput ? (
                <>
                  <button
                    type="button"
                    className="splitvault-btn splitvault-btn--secondary"
                    onClick={() => setShowRejectInput(true)}
                    disabled={submitting}
                  >
                    <XCircle size={16} color="#f43f5e" />
                    Reject Proof
                  </button>
                  <button
                    type="button"
                    className="splitvault-btn splitvault-btn--emerald"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    <CheckCircle2 size={18} />
                    {submitting ? 'Verifying...' : 'Verify & Settle Balance'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="splitvault-btn splitvault-btn--secondary"
                    onClick={() => setShowRejectInput(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="splitvault-btn splitvault-btn--rose"
                    onClick={handleReject}
                    disabled={submitting}
                  >
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
