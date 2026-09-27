import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

function Auth({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Smooth mouse & touch reactive spotlight without React re-renders
  useEffect(() => {
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX / window.innerWidth) * 100).toFixed(1);
      const y = ((clientY / window.innerHeight) * 100).toFixed(1);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  // Real-time 4-level password security evaluation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak (Too short)', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Fair (Add numbers)', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Strong (Good)', color: '#38bdf8' };
    return { score: 4, label: 'Optimal (Unbreakable)', color: '#22c55e' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email.trim(), password);
      } else {
        result = await register(name.trim(), email.trim(), password);
      }

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setError('');
      setIsSubmitting(true);
      const result = await loginWithGoogle({ access_token: tokenResponse.access_token });
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during Google sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = (err) => {
    console.warn('Google sign-in error:', err);
    setError('Google sign-in was unsuccessful. Please try again or use email.');
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const setAuthMode = (mode) => {
    setIsLogin(mode === 'login');
    setError('');
  };

  return (
    <div ref={containerRef} className="auth-page financial-aurora-env">
      
      {/* 1. Living Aurora Deep Background Fields */}
      <div className="aurora-ambient-container" aria-hidden="true">
        <div className="aurora-blob-cyan" />
        <div className="aurora-blob-blue" />
        <div className="aurora-blob-teal" />
      </div>

      {/* 2. Smooth Cursor / Touch Following Radial Light */}
      <div className="aurora-mouse-spotlight" aria-hidden="true" />

      {/* 3. Financial Data Orbits & Traveling Nodes */}
      <div className="orbit-field-system" aria-hidden="true">
        <div className="orbit-orbit-ring orbit-ring-inner">
          <div className="orbit-node cyan-node" />
        </div>
        <div className="orbit-orbit-ring orbit-ring-outer">
          <div className="orbit-node teal-node" />
          <div className="orbit-node blue-node" />
        </div>
      </div>

      {/* 4. Delicate Restrained Particles */}
      <div className="auth-particles-field" aria-hidden="true">
        <span className="aurora-particle p1" />
        <span className="aurora-particle p2" />
        <span className="aurora-particle p3" />
        <span className="aurora-particle p4" />
        <span className="aurora-particle p5" />
        <span className="aurora-particle p6" />
      </div>

      {/* 5. Faint Security Core HUD Status Behind the Card */}
      <div className="auth-security-core-hud" aria-hidden="true">
        <div className="security-hud-row">
          <span>◉ SECURE VAULT CORE</span>
          <span className="hud-accent">ONLINE</span>
        </div>
        <div className="security-hud-row">
          <span>ENCRYPTION ENGINE</span>
          <span>AES-256 GCM</span>
        </div>
        <div className="security-hud-row">
          <span>ZERO-KNOWLEDGE AUTH</span>
          <span className="hud-teal">ACTIVE</span>
        </div>
        <div className="security-hud-row">
          <span>SESSION ENVIRONMENT</span>
          <span>READY</span>
        </div>
      </div>

      {/* 6. Centered Authentic Translucent Glass Card */}
      <main className="auth-card-stage">
        <div className="auth-glass-card">

          {/* Official Brand Identity (Using official BrandLogo with ET gradient mark) */}
          <div className="auth-card-brand-header">
            <BrandLogo size="md" className="auth-brand-centered" />
          </div>

          {/* Pill Segment Switcher (Sign In <-> Create Account) */}
          <div className="auth-mode-pill-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={`mode-pill-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={`mode-pill-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Custom Pristine Full-Width Google Button */}
          <button
            type="button"
            onClick={() => triggerGoogleLogin()}
            disabled={isSubmitting}
            className="custom-google-auth-btn"
          >
            <svg className="google-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="auth-divider-row">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Or continue with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
            
            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <div className="form-field-group animate-slide-down">
                <label htmlFor="auth-name" className="field-label">
                  Full Name
                </label>
                <div className="field-input-box">
                  <UserIcon size={18} className="field-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abdullah Khan"
                    className="field-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-field-group">
              <label htmlFor="auth-email" className="field-label">
                Email Address
              </label>
              <div className="field-input-box">
                <Mail size={18} className="field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field-input"
                  required
                />
              </div>
            </div>

            {/* Password + Dynamic 4-Level Strength Meter */}
            <div className="form-field-group">
              <label htmlFor="auth-password" className="field-label">
                Password
              </label>
              <div className="field-input-box">
                <Lock size={18} className="field-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                  className="field-input"
                  required
                />
                <button
                  type="button"
                  className="field-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Dynamic Password Strength Indicator (Sign Up Mode) */}
              {!isLogin && password && (
                <div className="password-strength-container animate-fade-in">
                  <div className="strength-bars-track">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="strength-bar-cell"
                        style={{
                          backgroundColor:
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="strength-label-row">
                    <span>Security Level</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 700 }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password (Login mode) */}
            {isLogin && (
              <div className="auth-remember-row">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="remember-checkbox"
                  />
                  <span>Remember me</span>
                </label>
                <span className="forgot-password-link" title="Contact administrator to reset">
                  Forgot password?
                </span>
              </div>
            )}

            {/* Financial Aurora Gradient Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`auth-submit-btn ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? (
                <div className="btn-loading-wrapper">
                  <span className="btn-spinner" />
                  <span>{isLogin ? 'Authenticating...' : 'Creating Workspace...'}</span>
                </div>
              ) : (
                <div className="btn-label-wrapper">
                  <span>{isLogin ? 'Sign In' : 'Create Workspace'}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>

            {/* Bottom Switcher Link */}
            <div className="auth-footer-switch">
              <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button
                type="button"
                onClick={() => setAuthMode(isLogin ? 'signup' : 'login')}
                className="switch-action-btn"
              >
                {isLogin ? 'Create one →' : 'Sign in instead →'}
              </button>
            </div>

          </form>

        </div>
      </main>

    </div>
  );
}

export default Auth;
