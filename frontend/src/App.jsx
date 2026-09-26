import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Home, Receipt, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import SplitVault from './pages/SplitVault';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { VaultProvider } from './context/VaultContext';
import { SplitVaultProvider } from './context/SplitVaultContext';
import SecureVault from './components/vault/SecureVault';
import useExpenseData from './hooks/useExpenses';

function AppShell() {
  useExpenseData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('et_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('et_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="app-shell">
      {/* Fixed Privacy & Security Vault Overlay */}
      <SecureVault />

      {/* Responsive & Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen ? (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      ) : null}

      <main className="main-panel">
        <Topbar onMenuClick={() => setIsSidebarOpen((open) => !open)} />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/splitvault" element={<SplitVault />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Mobile Bottom Navigation Bar (Across All Pages on Mobile Screen) */}
      <nav className="global-mobile-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `global-mobile-nav__item ${isActive ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => `global-mobile-nav__item ${isActive ? 'active' : ''}`}
        >
          <Receipt size={20} />
          <span>Transactions</span>
        </NavLink>
        <NavLink
          to="/splitvault"
          className={({ isActive }) => `global-mobile-nav__item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>SplitVault</span>
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => `global-mobile-nav__item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `global-mobile-nav__item ${isActive ? 'active' : ''}`}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <ExpenseProvider>
            <VaultProvider>
              <NotificationProvider>
                <SplitVaultProvider>
                  <Routes>
                    {/* Public Authentication Routes */}
                    <Route path="/login" element={<Auth initialMode="login" />} />
                    <Route path="/signup" element={<Auth initialMode="signup" />} />

                    {/* Protected Main Application Shell */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <AppShell />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </SplitVaultProvider>
              </NotificationProvider>
            </VaultProvider>
          </ExpenseProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
