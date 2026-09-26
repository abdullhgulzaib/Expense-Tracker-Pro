import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
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

  return (
    <div className="app-shell">
      {/* Fixed Privacy & Security Vault Overlay */}
      <SecureVault />

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
          <Route path="/splitvault" element={<SplitVault />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
