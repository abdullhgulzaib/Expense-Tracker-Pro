import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, Download, Trash2, X, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpenseContext';
import { exportToPDF } from '../utils/exportUtils';

export default function StorageCleanupNotice({ onToast }) {
  const { user } = useAuth();
  const { settings, formatCurrency } = useSettings();
  const { fetchExpenses } = useExpenses();

  const [cleanupData, setCleanupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/expenses/cleanup-status');
      setCleanupData(data);
    } catch (err) {
      console.error('Failed to check cleanup status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading || !cleanupData?.hasPendingCleanup || dismissed) {
    return null;
  }

  // 1. Email Statement
  const handleEmailStatement = async () => {
    setEmailing(true);
    try {
      const { data } = await api.post('/expenses/send-statement-email');
      if (typeof onToast === 'function') {
        onToast(data.message || `Statement sent to ${user?.email}`, 'success');
      } else {
        alert(data.message || `Statement sent to ${user?.email}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to email statement.';
      if (typeof onToast === 'function') {
        onToast(msg, 'error');
      } else {
        alert(msg);
      }
    } finally {
      setEmailing(false);
    }
  };

  // 2. Download PDF Statement
  const handleDownloadPDF = () => {
    try {
      exportToPDF(cleanupData.expenses, {
        user,
        settings,
        dateRangeLabel: cleanupData.periodName,
        filename: `Statement_${cleanupData.periodName.replace(/[\s&]+/g, '_')}.pdf`,
      });
      if (typeof onToast === 'function') {
        onToast('Statement PDF downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      if (typeof onToast === 'function') {
        onToast('Failed to export PDF statement', 'error');
      }
    }
  };

  // 3. Execute Cleanup
  const handleExecuteCleanup = async () => {
    const confirmed = window.confirm(
      `⚠️ Confirm Data Storage Cleanup:\n\nAre you sure you want to clean up transactions from ${cleanupData.periodName} (${cleanupData.count} transactions totaling ${formatCurrency(cleanupData.totalAmount)})?\n\nA summary will be safely archived, and individual rows deleted to maintain free database limits. Make sure you have downloaded or emailed your statement!`
    );

    if (!confirmed) return;

    setCleaning(true);
    try {
      const { data } = await api.post('/expenses/execute-cleanup');
      if (typeof onToast === 'function') {
        onToast(data.message || 'Storage cleaned up successfully!', 'success');
      }
      setCleanupData(null);
      if (typeof fetchExpenses === 'function') {
        await fetchExpenses();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to clean up storage.';
      if (typeof onToast === 'function') {
        onToast(msg, 'error');
      } else {
        alert(msg);
      }
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="storage-cleanup-banner">
      <div className="storage-cleanup-banner__left">
        <div className="storage-cleanup-banner__icon">
          <AlertTriangle size={20} />
        </div>
        <div className="storage-cleanup-banner__text">
          <h4>2-Month Storage Maintenance Notice ({cleanupData.periodName})</h4>
          <p>
            You have <strong>{cleanupData.count} completed transactions</strong> totaling{' '}
            <strong>{formatCurrency(cleanupData.totalAmount)}</strong> scheduled for cleanup to maintain free database storage limits. 
            Save or email your statement before clearing.
          </p>
        </div>
      </div>

      <div className="storage-cleanup-banner__actions">
        <button
          type="button"
          className="cleanup-btn cleanup-btn--email"
          onClick={handleEmailStatement}
          disabled={emailing}
          title={`Send statement copy to ${user?.email}`}
        >
          {emailing ? <RefreshCw size={14} className="spin" /> : <Mail size={14} />}
          <span>{emailing ? 'Sending...' : 'Email Statement'}</span>
        </button>

        <button
          type="button"
          className="cleanup-btn cleanup-btn--download"
          onClick={handleDownloadPDF}
          title="Download PDF statement to your device"
        >
          <Download size={14} />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          className="cleanup-btn cleanup-btn--clean"
          onClick={handleExecuteCleanup}
          disabled={cleaning}
          title="Archive and purge past transactions from database"
        >
          {cleaning ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
          <span>{cleaning ? 'Cleaning...' : 'Clean Up Now'}</span>
        </button>

        <button
          type="button"
          className="cleanup-btn cleanup-btn--close"
          onClick={() => setDismissed(true)}
          title="Dismiss notice for this session"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
