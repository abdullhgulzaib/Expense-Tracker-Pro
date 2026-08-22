import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { ExpenseProvider } from './context/ExpenseContext';
import { SettingsProvider } from './context/SettingsContext';
import useExpenseData from './hooks/useExpenses';

function AppShell() {
  useExpenseData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-shell">
        <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
        {isSidebarOpen ? (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
        ) : null}

        <main className="main-panel">
          <Topbar onMenuClick={() => setIsSidebarOpen((open) => !open)} />

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
    <SettingsProvider>
      <ExpenseProvider>
        <AppShell />
      </ExpenseProvider>
    </SettingsProvider>
  );
}

export default App;
