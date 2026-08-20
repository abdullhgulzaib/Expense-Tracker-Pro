import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { ExpenseProvider } from './context/ExpenseContext';
import useExpenseData from './hooks/useExpenses';

function AppShell() {
  useExpenseData();

  return (
    <Router>
      <div className="app-shell">
        <Sidebar />

        <main className="main-panel">
          <Topbar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <AppShell />
    </ExpenseProvider>
  );
}

export default App;
