import { useState } from 'react';
import { Wallet, ArrowDownCircle, PiggyBank, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionsTable from '../components/TransactionsTable';
import AddExpenseModal from '../components/AddExpenseModal';
import Toast from '../components/Toast';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';

function Dashboard() {
  const { state, dispatch } = useExpenseContext();
  const { formatCurrency } = useSettings();
  const { expenses, summary, loading, error } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalExpenses = Number(summary?.totalExpenses || 0);
  const highestExpense = Number(summary?.highestExpense || 0);
  const averageExpense = Number(summary?.averageExpense || 0);
  const transactionCount = Number(summary?.transactionCount || 0);

  const monthlyChartData = expenses.reduce((acc, item) => {
    const date = new Date(item.date);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const existing = acc.find((entry) => entry.name === monthName);

    if (existing) {
      existing.total += Number(item.amount || 0);
    } else {
      acc.push({ name: monthName, total: Number(item.amount || 0) });
    }

    return acc;
  }, []).slice(-6);

  const categoryChartData = Object.entries(
    expenses.reduce((acc, item) => {
      const category = item.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(item.amount || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const recentTransactions = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const handleSubmit = async (formData) => {
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      const { data } = await api.post('/expenses', payload);
      dispatch({ type: 'ADD_EXPENSE', payload: data });
      setToast('Expense added successfully');
      setIsModalOpen(false);
    } catch (error) {
      setToast(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 2200);
    }
  };

  if (loading) {
    return <div className="page"><div className="panel empty-panel"><p>Loading dashboard...</p></div></div>;
  }

  if (error) {
    return <div className="page"><div className="panel empty-panel"><p>Error loading dashboard: {error}</p></div></div>;
  }

  return (
    <div className="page page--dashboard">
      <div className="page__header">
        <div>
          <p className="eyebrow">Good evening</p>
          <h1>Dashboard</h1>
        </div>
        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>+ Add Expense</button>
      </div>

      <div className="stats-grid">
        <StatCard icon={Wallet} title="Balance" value={formatCurrency(totalExpenses)} change="Live" trend="up" />
        <StatCard icon={TrendingUp} title="Income" value={`${transactionCount}`} change="Transactions" trend="up" />
        <StatCard icon={ArrowDownCircle} title="Expenses" value={formatCurrency(totalExpenses)} change="Total" trend="down" />
        <StatCard icon={PiggyBank} title="Average" value={formatCurrency(averageExpense)} change="Avg" trend="up" />
      </div>

      <div className="content-grid content-grid--two-cols">
        <SpendingLineChart data={monthlyChartData} />
        <CategoryPieChart data={categoryChartData} />
      </div>

      <TransactionsTable rows={recentTransactions} onAdd={() => setIsModalOpen(true)} />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <Toast message={toast} visible={Boolean(toast)} />
    </div>
  );
}

export default Dashboard;
