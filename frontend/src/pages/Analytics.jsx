import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import ExportModal from '../components/ExportModal';
import Toast from '../components/Toast';
import useAnalytics from '../hooks/useAnalytics';
import { useExpenses } from '../context/ExpenseContext';

function Analytics() {
  const { categoryData, monthlyData, loading, error } = useAnalytics();
  const { state } = useExpenses();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState('');

  const allTimePieData = useMemo(() => {
    return Object.entries(
      state.expenses.reduce((acc, item) => {
        const category = item.category || 'Other';
        acc[category] = (acc[category] || 0) + Number(item.amount || 0);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
  }, [state.expenses]);

  if (loading) {
    return (
      <div className="page">
        <div className="panel empty-panel">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="panel empty-panel">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Financial Insights</p>
          <h1>Analytics</h1>
        </div>
        <button
          type="button"
          className="btn btn--secondary btn--export"
          onClick={() => setIsExportOpen(true)}
        >
          <Download size={15} />
          <span>Export Statement</span>
        </button>
      </div>

      <div className="content-grid content-grid--two-cols">
        <SpendingLineChart data={monthlyData} />
        <CategoryPieChart data={allTimePieData} title="All-Time Category Distribution" />
      </div>

      <div style={{ marginTop: '18px' }}>
        <CategoryBarChart data={categoryData} />
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        allExpenses={state.expenses}
        currentFilteredExpenses={state.expenses}
        onExportSuccess={(msg) => {
          setToast(msg);
          setTimeout(() => setToast(''), 3000);
        }}
      />

      <Toast message={toast} visible={Boolean(toast)} type="success" />
    </div>
  );
}

export default Analytics;
