import { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, X, Calendar, Filter } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

function ExportModal({
  isOpen,
  onClose,
  allExpenses = [],
  currentFilteredExpenses = [],
  onExportSuccess,
}) {
  const { settings, formatCurrency } = useSettings();
  const { user } = useAuth();

  const [format, setFormat] = useState('csv'); // 'csv' or 'pdf'
  const [range, setRange] = useState('this-month');
  const [category, setCategory] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  // Custom date range state
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);

  // Filter expenses according to chosen scope
  const targetExpenses = useMemo(() => {
    let list = [];

    if (range === 'filtered') {
      list = [...currentFilteredExpenses];
    } else {
      list = [...allExpenses];

      const now = new Date();
      if (range === 'this-month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        list = list.filter((item) => new Date(item.date) >= start);
      } else if (range === 'last-30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        list = list.filter((item) => new Date(item.date) >= thirtyDaysAgo);
      } else if (range === 'last-90') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        list = list.filter((item) => new Date(item.date) >= ninetyDaysAgo);
      } else if (range === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          list = list.filter((item) => new Date(item.date) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          list = list.filter((item) => new Date(item.date) <= end);
        }
      }
    }

    if (category !== 'All') {
      list = list.filter((item) => item.category === category);
    }

    return list;
  }, [allExpenses, category, currentFilteredExpenses, endDate, range, startDate]);

  const totalSum = useMemo(() => {
    return targetExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [targetExpenses]);

  if (!isOpen) return null;

  const getRangeLabel = () => {
    switch (range) {
      case 'filtered':
        return 'Current Filtered Table View';
      case 'this-month':
        return 'Current Month';
      case 'last-30':
        return 'Last 30 Days';
      case 'last-90':
        return 'Last 90 Days';
      case 'custom':
        return `${startDate} to ${endDate}`;
      case 'all':
      default:
        return 'All Time';
    }
  };

  const handleDownload = async () => {
    if (targetExpenses.length === 0) {
      alert('No transactions found matching your selected export criteria.');
      return;
    }

    setIsExporting(true);

    try {
      const dateTag = new Date().toISOString().split('T')[0];
      const rangeLabel = getRangeLabel();

      if (format === 'csv') {
        const filename = `Expense_Export_${dateTag}.csv`;
        exportToCSV(targetExpenses, {
          filename,
          currency: settings.currency || 'USD',
        });
        if (onExportSuccess) {
          onExportSuccess(`Downloaded CSV spreadsheet with ${targetExpenses.length} records.`);
        }
      } else {
        const filename = `Expense_Statement_${dateTag}.pdf`;
        exportToPDF(targetExpenses, {
          user,
          settings,
          dateRangeLabel: rangeLabel,
          filename,
        });
        if (onExportSuccess) {
          onExportSuccess(`Generated PDF Statement with ${targetExpenses.length} records.`);
        }
      }

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--export"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title-group">
            <div className="modal__icon-badge">
              <Download size={18} />
            </div>
            <div>
              <h2>Export Financial Data</h2>
              <p className="modal__subtitle">Download your records for spreadsheets, tax, or archiving</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close export dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal__body export-modal-body">
          {/* Format Selection Cards */}
          <div className="export-section">
            <label className="export-label">1. Choose Format</label>
            <div className="export-format-grid">
              <button
                type="button"
                className={`export-format-card ${format === 'csv' ? 'export-format-card--active-csv' : ''}`}
                onClick={() => setFormat('csv')}
              >
                <div className="export-format-card__icon export-format-card__icon--csv">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="export-format-card__info">
                  <strong>CSV Spreadsheet</strong>
                  <span>Excel, Google Sheets, Raw Data</span>
                </div>
              </button>

              <button
                type="button"
                className={`export-format-card ${format === 'pdf' ? 'export-format-card--active-pdf' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                <div className="export-format-card__icon export-format-card__icon--pdf">
                  <FileText size={20} />
                </div>
                <div className="export-format-card__info">
                  <strong>PDF Statement</strong>
                  <span>Executive Financial Report, Printable</span>
                </div>
              </button>
            </div>
          </div>

          {/* Date Scope Selection */}
          <div className="export-section">
            <label className="export-label" htmlFor="export-range-select">
              <Calendar size={13} />
              <span>2. Date Scope</span>
            </label>
            <select
              id="export-range-select"
              className="export-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="this-month">This Month</option>
              <option value="filtered">
                Current Filtered Table View ({currentFilteredExpenses.length} records)
              </option>
              <option value="last-30">Last 30 Days</option>
              <option value="last-90">Last 90 Days</option>
              <option value="all">All Time (Full History)</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {range === 'custom' && (
            <div className="export-custom-dates">
              <div className="export-field">
                <label htmlFor="export-start-date">From</label>
                <input
                  type="date"
                  id="export-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="export-input"
                />
              </div>
              <div className="export-field">
                <label htmlFor="export-end-date">To</label>
                <input
                  type="date"
                  id="export-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="export-input"
                />
              </div>
            </div>
          )}

          {/* Category Scope Selection */}
          <div className="export-section">
            <label className="export-label" htmlFor="export-cat-select">
              <Filter size={13} />
              <span>3. Category Filter</span>
            </label>
            <select
              id="export-cat-select"
              className="export-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Summary Badge */}
          <div className="export-summary-box">
            <div className="export-summary-box__left">
              <span className="export-summary-dot" />
              <span>
                Ready to export <strong>{targetExpenses.length}</strong>{' '}
                {targetExpenses.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <div className="export-summary-box__right">
              Total: <strong>{formatCurrency(totalSum)}</strong>
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary export-submit-btn"
            onClick={handleDownload}
            disabled={isExporting || targetExpenses.length === 0}
          >
            <Download size={15} />
            <span>
              {isExporting
                ? 'Generating File...'
                : format === 'csv'
                ? 'Download CSV (.csv)'
                : 'Download Statement (.pdf)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
