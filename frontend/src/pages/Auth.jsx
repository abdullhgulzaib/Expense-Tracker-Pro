import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
  Brain,
  Target,
  Shield,
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

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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

  const setAuthMode = (mode) => {
    setIsLogin(mode === 'login');
    setError('');
  };

  return (
    <div className="auth-page">
      {/* Ambient Radial Glowing Light Fields */}
      <div className="auth-ambient-glow auth-glow-1" />
      <div className="auth-ambient-glow auth-glow-2" />
      <div className="auth-ambient-glow auth-glow-3" />

      {/* Top Header Bar */}
      <header className="auth-topbar">
        <BrandLogo size="md" subtitle="Your Financial Life, Secured." />

        <div className="auth-security-pill">
          <Shield size={14} className="text-cyan-400" />
          <span>Secure & Encrypted</span>
        </div>
      </header>

      {/* Main Split Screen Container */}
      <main className="auth-main-grid">
        
        {/* Left Side: Financial Command Center Branding & 3D Visual Showcase */}
        <div className="auth-showcase-column">
          
          {/* Hero Section */}
          <div className="showcase-hero-box">
            <div className="showcase-demo-tag">
              <span className="demo-pulse-dot" />
              <span>✦ Interactive Product Preview</span>
            </div>

            <h1 className="showcase-hero-heading">
              Your Money. <br />
              <span className="hero-gradient-text">Your Control.</span>
            </h1>

            <p className="showcase-hero-desc">
              Track your expenses, understand your spending, and build a better financial future with intelligent cloud sync.
            </p>
          </div>

          {/* 3 Feature Pillars */}
          <div className="showcase-pillars">
            <div className="pillar-item">
              <div className="pillar-icon-box bg-blue-500/10 border-blue-500/25 text-blue-400">
                <BarChart3 size={18} />
              </div>
              <div>
                <div className="pillar-title">Track</div>
                <div className="pillar-desc">Your expenses in real-time</div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon-box bg-indigo-500/10 border-indigo-500/25 text-indigo-400">
                <Brain size={18} />
              </div>
              <div>
                <div className="pillar-title">Analyze</div>
                <div className="pillar-desc">Smart insights with charts</div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon-box bg-cyan-500/10 border-cyan-500/25 text-cyan-400">
                <Target size={18} />
              </div>
              <div>
                <div className="pillar-title">Improve</div>
                <div className="pillar-desc">Make better decisions</div>
              </div>
            </div>
          </div>

          {/* 3D Glowing Podium & Live Card Stack */}
          <div className="showcase-visual-stage">
            <div className="visual-cards-grid">
              
              {/* Main Chart Card (Left) */}
              <div className="glass-chart-card animate-float-1">
                <div className="chart-card-header">
                  <span className="chart-card-label">Total Balance</span>
                  <span className="chart-card-badge">LIVE DEMO</span>
                </div>
                <div className="chart-card-balance">$2,840.00</div>
                <div className="chart-card-trend">
                  <TrendingUp size={14} />
                  <span>12.4% this month</span>
                </div>

                {/* Glowing Bezier Wave SVG Chart */}
                <div className="chart-svg-container">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38"/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M 0,65 Q 25,75 50,55 T 100,60 T 150,25 T 200,15 L 200,80 L 0,80 Z" fill="url(#chartWaveGrad)" />
                    <path d="M 0,65 Q 25,75 50,55 T 100,60 T 150,25 T 200,15" fill="none" stroke="#38bdf8" strokeWidth="3" className="chart-glow-path" strokeLinecap="round"/>
                    <circle cx="200" cy="15" r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Floating Transaction Stack (Right) */}
              <div className="glass-transactions-stack animate-float-2">
                
                {/* Item 1: Coffee */}
                <div className="tx-card">
                  <div className="tx-left">
                    <div className="tx-icon bg-amber-500/20 text-amber-400">☕</div>
                    <div>
                      <div className="tx-title">Coffee</div>
                      <div className="tx-category">Food & Drinks</div>
                    </div>
                  </div>
                  <div className="tx-amount tx-expense">-$4.50</div>
                </div>

                {/* Item 2: Software */}
                <div className="tx-card">
                  <div className="tx-left">
                    <div className="tx-icon bg-blue-500/20 text-blue-400">💻</div>
                    <div>
                      <div className="tx-title">Software</div>
                      <div className="tx-category">Subscriptions</div>
                    </div>
                  </div>
                  <div className="tx-amount tx-expense">-$29.00</div>
                </div>

                {/* Item 3: Salary */}
                <div className="tx-card">
                  <div className="tx-left">
                    <div className="tx-icon bg-emerald-500/20 text-emerald-400">💵</div>
                    <div>
                      <div className="tx-title">Salary</div>
                      <div className="tx-category">Income</div>
                    </div>
                  </div>
                  <div className="tx-amount tx-income">+$850.00</div>
                </div>

              </div>

            </div>

            {/* 3D Glowing Podium Base */}
            <div className="podium-platform">
              <div className="podium-ring" />
            </div>
          </div>

          {/* Bottom Session Security Statement */}
          <div className="showcase-security-footer">
            <div className="security-icon-box">
              <ShieldCheck size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="security-title">Secure Session</div>
              <div className="security-desc">Your financial data is protected with encrypted authentication.</div>
            </div>
          </div>

        </div>

        {/* Right Side: Authentication Glass Card */}
        <div className="auth-form-column">
          <div className="auth-glass-card">
            
            {/* Pill Segment Switcher (Login <-> Sign Up) */}
            <div className="auth-mode-pill-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isLogin}
                className={`mode-pill-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isLogin}
                className={`mode-pill-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Form Header Heading */}
            <div className="auth-card-heading-box">
              <h2 className="auth-card-title">
                {isLogin ? (
                  <>Welcome Back <span className="wave-hand">👋</span></>
                ) : (
                  <>Create Workspace <span className="wave-hand">🚀</span></>
                )}
              </h2>
              <p className="auth-card-subtitle">
                {isLogin
                  ? 'Sign in to your account and continue your financial journey.'
                  : 'Create your personal financial workspace and start tracking.'}
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

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

              {/* Password + 4-Level Dynamic Strength Meter */}
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

                {/* 4-Level Dynamic Password Strength Meter (In Sign Up Mode) */}
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

              {/* Fintech Gradient Submit Button */}
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
        </div>

      </main>
    </div>
  );
}

export default Auth;
