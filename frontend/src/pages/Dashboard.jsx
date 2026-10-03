import { useMemo, useState } from 'react';
import { Wallet, ArrowDownCircle, PiggyBank, TrendingUp, Calendar } from 'lucide-react';
import StatCard from '../components/StatCard';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionsTable from '../components/TransactionsTable';
import AddExpenseModal from '../components/AddExpenseModal';
import StorageCleanupNotice from '../components/StorageCleanupNotice';
import Toast from '../components/Toast';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

function Dashboard() {
  const { state, dispatch } = useExpenseContext();
  const { formatCurrency } = useSettings();
  const { addNotification } = useNotifications();

  const { expenses, summary, loading, error } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [submitting, setSubmitting] = useState(false);

  const {
    totalExpenses,
    highestExpense,
    transactionCount,
    monthTotalExpenses,
    monthHighestExpense,
    monthTransactionCount,
    averageExpensePerDay,
    todaySpent,
    todayCount,
  } = useMemo(() => {
    const amounts = expenses.map((item) => Number(item.amount || 0));
    const count = amounts.length;
    const total = amounts.reduce((sum, amount) => sum + amount, 0);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDayOfMonth = now.getDate();

    let todayTotal = 0;
    let todayTxnCount = 0;

    expenses.forEach((item) => {
      const d = new Date(item.date);
      const amount = Number(item.amount || 0);

      if (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth &&
        d.getDate() === currentDayOfMonth
      ) {
        todayTotal += amount;
        todayTxnCount += 1;
      }
    });

    const currentMonthExpenses = expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthAmounts = currentMonthExpenses.map((item) => Number(item.amount || 0));
    const monthCount = monthAmounts.length;
    const monthTotal = monthAmounts.reduce((sum, amount) => sum + amount, 0);
    const monthHighest = monthCount ? Math.max(...monthAmounts) : 0;

    let avgPerDay = 0;

    if (currentMonthExpenses.length > 0) {
      const daysElapsed = Math.max(1, currentDayOfMonth);
      avgPerDay = monthTotal / daysElapsed;
    } else if (expenses.length > 0) {
      const sortedByDate = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestDate = new Date(sortedByDate[0].date);
      const targetYear = latestDate.getFullYear();
      const targetMonth = latestDate.getMonth();

      const targetMonthExpenses = expenses.filter((item) => {
        const d = new Date(item.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      });

      const targetMonthTotal = targetMonthExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      avgPerDay = daysInTargetMonth > 0 ? targetMonthTotal / daysInTargetMonth : 0;
    }

    return {
      totalExpenses: total,
      highestExpense: count ? Math.max(...amounts) : 0,
      transactionCount: count,
      monthTotalExpenses: monthTotal,
      monthHighestExpense: monthHighest,
      monthTransactionCount: monthCount,
      averageExpensePerDay: avgPerDay,
      todaySpent: todayTotal,
      todayCount: todayTxnCount,
    };
  }, [expenses]);

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

  // Monthly category pie chart distribution for Dashboard
  const categoryChartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthExpenses = expenses.filter((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (monthExpenses.length === 0 && expenses.length > 0) {
      const sortedByDate = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestDate = new Date(sortedByDate[0].date);
      monthExpenses = expenses.filter((item) => {
        const d = new Date(item.date);
        return d.getFullYear() === latestDate.getFullYear() && d.getMonth() === latestDate.getMonth();
      });
    }

    return Object.entries(
      monthExpenses.reduce((acc, item) => {
        const category = item.category || 'Other';
        acc[category] = (acc[category] || 0) + Number(item.amount || 0);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
  }, [expenses]);

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
      setToastType('success');
      setToast('Expense added successfully');
      addNotification({
        title: 'Expense Added',
        message: `"${payload.title}" (${formatCurrency(payload.amount)}) recorded.`,
        type: 'expense-add',
      });
      setIsModalOpen(false);
       } catch (error) {
      setToastType('error');
      setToast(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 2200);
    }
  };

  if (loading) {
    return (
      <div className="page page--dashboard" style={{ opacity: 0.5 }}>
        <div className="page__header">
          <div>
            <p className="eyebrow">Financial Workspace</p>
            <h1>Dashboard</h1>
          </div>
        </div>
        <div className="stats-grid">
          <div className="panel" style={{ minHeight: '110px' }} />
          <div className="panel" style={{ minHeight: '110px' }} />
          <div className="panel" style={{ minHeight: '110px' }} />
          <div className="panel" style={{ minHeight: '110px' }} />
        </div>
      </div>
    );
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="daily-spend-badge" title="Total expenses recorded today">
            <Calendar size={15} />
            <span>Spent Today: <strong>{formatCurrency(todaySpent)}</strong></span>
          </div>
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>+ Add Expense</button>
        </div>
      </div>

      <StorageCleanupNotice
        onToast={(msg, type) => {
          setToast(msg);
          setToastType(type || 'success');
          setTimeout(() => setToast(''), 3500);
        }}
      />

      <div className="stats-grid">
        <StatCard
          icon={ArrowDownCircle}
          title="Total Expenses"
          value={formatCurrency(monthTotalExpenses)}
          change="This month"
          trend="down"
          footer={<span>All-Time: <strong>{formatCurrency(totalExpenses)}</strong></span>}
        />
        <StatCard
          icon={TrendingUp}
          title="Highest Expense"
          value={formatCurrency(monthHighestExpense)}
          change="Peak"
          trend="up"
          footer={<span>All-Time Peak: <strong>{formatCurrency(highestExpense)}</strong></span>}
        />
        <StatCard
          icon={PiggyBank}
          title="Average Expense"
          value={formatCurrency(averageExpensePerDay)}
          change="Per day"
          trend="day"
        />
        <StatCard
          icon={Wallet}
          title="Transactions"
          value={`${monthTransactionCount} txns`}
          change="This month"
          trend="up"
          footer={<span>All-Time: <strong>{transactionCount} txns</strong></span>}
        />
      </div>

      <div className="content-grid content-grid--two-cols">
        <SpendingLineChart data={monthlyChartData} />
        <CategoryPieChart data={categoryChartData} title="Monthly Category Distribution" />
      </div>

      <TransactionsTable rows={recentTransactions} onAdd={() => setIsModalOpen(true)} />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

     <Toast message={toast} visible={Boolean(toast)} type={toastType} />
    </div>
  );
}

export default Dashboard;
