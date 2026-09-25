import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const hasToken = Boolean(localStorage.getItem('et_token'));

  // If no token exists at all and loading is finished, redirect to login
  if (!loading && !isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has a token, AppShell renders with SecureVault covering the screen seamlessly
  return children;
}

export default ProtectedRoute;
