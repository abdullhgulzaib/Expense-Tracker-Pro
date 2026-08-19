import { Wallet, ArrowDownCircle, PiggyBank, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionsTable from '../components/TransactionsTable';

function Dashboard() {
  return (
    <div className="page page--dashboard">
      <div className="page__header">
        <div>
          <p className="eyebrow">Good evening</p>
          <h1>Dashboard</h1>
        </div>
        <button className="btn btn--primary">+ Add Expense</button>
      </div>

      <div className="stats-grid">
        <StatCard icon={Wallet} title="Balance" value="$8,420.00" change="12.5%" trend="up" />
        <StatCard icon={TrendingUp} title="Income" value="$5,200.00" change="8.3%" trend="up" />
        <StatCard icon={ArrowDownCircle} title="Expenses" value="$2,880.00" change="4.1%" trend="down" />
        <StatCard icon={PiggyBank} title="Savings" value="$2,320.00" change="15.2%" trend="up" />
      </div>

      <div className="content-grid content-grid--two-cols">
        <SpendingLineChart />
        <CategoryPieChart />
      </div>

      <TransactionsTable />
    </div>
  );
}

export default Dashboard;
