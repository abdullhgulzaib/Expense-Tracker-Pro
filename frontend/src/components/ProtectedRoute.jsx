import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const hasToken = Boolean(localStorage.getItem('et_token'));

  // If no token exists at all in localStorage, immediately redirect to login (never show vault to unauthenticated guests)
  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has a token, AppShell renders with SecureVault verifying the session
  return children;
}

export default ProtectedRoute;
