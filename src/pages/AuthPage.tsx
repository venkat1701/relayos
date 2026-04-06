/**
 * Dark Theme Authentication Page (Login/Register)
 */

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface AuthPageProps {
  mode: "login" | "register";
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (fullName: string, email: string, password: string) => Promise<void>;
}

export function AuthPage({ mode, onLogin, onRegister }: AuthPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.fullName, formData.email, formData.password);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-large">
              <div className="logo-icon">RO</div>
              <span className="logo-text">RelayOS</span>
            </div>
            <h2 className="branding-title">Your AI-Powered Executive Assistant</h2>
            <p className="branding-subtitle">
              Intelligent briefings, task prioritization, and real-time insights powered by Claude AI.
            </p>
            <div className="features-list">
              <div className="feature-item">
                <i className="fi fi-rr-check feature-icon" />
                <span>AI-powered task prioritization</span>
              </div>
              <div className="feature-item">
                <i className="fi fi-rr-check feature-icon" />
                <span>Real-time calendar intelligence</span>
              </div>
              <div className="feature-item">
                <i className="fi fi-rr-check feature-icon" />
                <span>Automated executive briefings</span>
              </div>
              <div className="feature-item">
                <i className="fi fi-rr-check feature-icon" />
                <span>Deep Gmail & Drive integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="form-header">
            <button className="back-button" onClick={() => navigate("/")} type="button">
              ← Back to home
            </button>
            <h1 className="form-title">{isLogin ? "Welcome back" : "Create your account"}</h1>
            <p className="form-subtitle">
              {isLogin ? "Sign in to continue to RelayOS" : "Get started with your 14-day free trial"}
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <i className="fi fi-rr-exclamation alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={8}
              />
              {!isLogin && <p className="form-hint">Must be at least 8 characters</p>}
            </div>

            {isLogin && (
              <div className="form-footer">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="link-button">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            <span className="switch-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button className="switch-button" onClick={() => navigate(isLogin ? "/register" : "/login")} type="button">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          {!isLogin && (
            <p className="terms-text">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="terms-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="terms-link">
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020202;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          width: 100%;
          background: #0a0a0a;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          border: 1px solid #1a1a1a;
        }

        @media (max-width: 968px) {
          .auth-container {
            grid-template-columns: 1fr;
          }

          .auth-branding {
            display: none;
          }
        }

        /* Branding Side */
        .auth-branding {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 50%, #CC2936 100%);
          padding: 60px;
          color: #020202;
          display: flex;
          align-items: center;
        }

        .branding-content {
          max-width: 400px;
        }

        .logo-large {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .logo-large .logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #020202;
          color: #ECE4B7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }

        .logo-large .logo-text {
          font-size: 28px;
          font-weight: 800;
        }

        .branding-title {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 16px;
        }

        .branding-subtitle {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(2, 2, 2, 0.8);
          margin: 0 0 40px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
        }

        .feature-icon {
          width: 24px;
          height: 24px;
          background: rgba(2, 2, 2, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Form Side */
        .auth-form-container {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #0a0a0a;
        }

        .back-button {
          background: none;
          border: none;
          color: rgba(236, 228, 183, 0.5);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 32px;
          padding: 0;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #ECE4B7;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 32px;
          font-weight: 800;
          color: #ECE4B7;
          margin: 0 0 8px;
        }

        .form-subtitle {
          font-size: 16px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(204, 41, 54, 0.1);
          border: 1px solid rgba(204, 41, 54, 0.3);
          border-radius: 12px;
          color: #CC2936;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .alert-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(204, 41, 54, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(236, 228, 183, 0.8);
        }

        .form-input {
          padding: 14px 16px;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          font-size: 15px;
          color: #ECE4B7;
          background: #141414;
          transition: all 0.2s;
          outline: none;
        }

        .form-input:focus {
          border-color: #00A7E1;
          box-shadow: 0 0 0 3px rgba(0, 167, 225, 0.1);
        }

        .form-input:disabled {
          background: #0a0a0a;
          cursor: not-allowed;
          color: rgba(236, 228, 183, 0.4);
        }

        .form-input::placeholder {
          color: rgba(236, 228, 183, 0.3);
        }

        .form-hint {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.4);
          margin: 0;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.7);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .link-button {
          background: none;
          border: none;
          color: #00A7E1;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .link-button:hover {
          color: #DEC0F1;
          text-decoration: underline;
        }

        .submit-button {
          padding: 16px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          color: #020202;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Auth Switch */
        .auth-switch {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #1a1a1a;
        }

        .switch-text {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
        }

        .switch-button {
          background: none;
          border: none;
          color: #00A7E1;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .switch-button:hover {
          color: #DEC0F1;
          text-decoration: underline;
        }

        /* Terms */
        .terms-text {
          text-align: center;
          font-size: 13px;
          color: rgba(236, 228, 183, 0.4);
          margin-top: 16px;
        }

        .terms-link {
          color: #00A7E1;
          text-decoration: none;
          font-weight: 500;
        }

        .terms-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
