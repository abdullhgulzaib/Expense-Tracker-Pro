import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Receipt,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';
import PaymentMethodIcon from '../PaymentMethodIcon';

export default function VerifySettlementModal({ isOpen, onClose, settlement, onVerificationComplete }) {
  const { user } = useAuth();
  const { verifySettlement } = useSplitVault();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [zoomImage, setZoomImage] = useState(false);

  if (!isOpen || !settlement) return null;

  const proof = settlement.proof || {};
  const coveredExpenses = settlement.coveredExpenses || [];

  const handleApprove = async () => {
    setError('');
    setSubmitting(true);
    const res = await verifySettlement(settlement._id, { action: 'APPROVE' });
    setSubmitting(false);

    if (res.success) {
      if (typeof onVerificationComplete === 'function') {
        onVerificationComplete(res.data);
      }
      onClose();
    } else {
      setError(res.error || 'Failed to approve settlement.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejecting this payment proof.');
      return;
    }

    setError('');
    setSubmitting(true);
    const res = await verifySettlement(settlement._id, {
      action: 'REJECT',
      reason: rejectReason.trim(),
    });
    setSubmitting(false);

    if (res.success) {
      if (typeof onVerificationComplete === 'function') {
        onVerificationComplete(res.data);
      }
      onClose();
    } else {
      setError(res.error || 'Failed to reject settlement.');
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
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="sv-modal-header__title" style={{ fontSize: '1.1rem' }}>
                Verify Net Settlement
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                1-Tap batch review for all {coveredExpenses.length} covered expenses
              </p>
            </div>
          </div>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="sv-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px 22px' }}>
          {error && (
            <div className="sv-alert sv-alert--danger" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Settlement Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(30, 41, 59, 0.5))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Payment From Debtor
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {settlement.fromUserName || 'Roommate'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <PaymentMethodIcon method={proof.method} size={15} />
                <span>via <strong>{proof.method || 'Transfer'}</strong> {proof.transactionId ? `(TID: ${proof.transactionId})` : ''}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Amount Received
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                Rs {Number(settlement.amount).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Receipt Screenshot Image Preview */}
          {proof.imageUrl ? (
            <div
              style={{
                border: '1px solid var(--sv-card-border)',
                borderRadius: '12px',
                padding: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '6px' }}>
                Submitted Transfer Slip (Click to zoom):
              </div>
              <img
                src={proof.imageUrl}
                alt="Payment Slip"
                onClick={() => setZoomImage((prev) => !prev)}
                style={{
                  maxHeight: zoomImage ? '350px' : '150px',
                  maxWidth: '100%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'max-height 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--sv-card-border)',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}
            >
              No image slip uploaded. Debtor provided Transaction ID:{' '}
              <strong style={{ color: '#fff', fontFamily: 'monospace' }}>
                {proof.transactionId || 'None'}
              </strong>
            </div>
          )}

          {/* Sender Note */}
          {proof.senderNote && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '10px',
                fontSize: '0.8rem',
                color: '#cbd5e1',
              }}
            >
              <strong>Debtor Note:</strong> {proof.senderNote}
            </div>
          )}

          {/* Covered Expenses List */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--sv-card-border)',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={14} color="#10b981" />
              Approving this will clear all {coveredExpenses.length} expense(s):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {coveredExpenses.map((exp, idx) => (
                <div
                  key={exp.expenseId || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                  }}
                >
                  <span>• {exp.title}</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Rs {Number(exp.shareAmount || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection box toggle */}
          {showRejectBox && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
                Reason for Rejection:
              </label>
              <input
                type="text"
                className="sv-form-input"
                placeholder="e.g. TID not found in bank statement, screenshot unclear"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                  onClick={() => setShowRejectBox(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--danger splitvault-btn--sm"
                  onClick={handleReject}
                  disabled={submitting}
                >
                  {submitting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sv-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid var(--sv-card-border)' }}>
          {!showRejectBox && (
            <button
              type="button"
              className="splitvault-btn splitvault-btn--danger-outline"
              onClick={() => setShowRejectBox(true)}
              disabled={submitting}
            >
              Reject Proof
            </button>
          )}
          <button
            type="button"
            className="splitvault-btn splitvault-btn--secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </button>
          <button
            type="button"
            className="splitvault-btn splitvault-btn--emerald"
            onClick={handleApprove}
            disabled={submitting}
            style={{ fontWeight: 700 }}
          >
            <CheckCircle2 size={16} />
            {submitting ? 'Approving...' : `Approve & Settle All (${coveredExpenses.length} Expenses)`}
          </button>
        </div>
      </div>
    </div>
  );
}
