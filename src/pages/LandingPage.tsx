/**
 * RelayOS — Landing Page
 * Modern YC-style: gradient hero, glassmorphism cards, scroll animations
 */

import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ro-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".ro-animate");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="ro">
      {/* ===================== NAV ===================== */}
      <nav className="ro-nav">
        <div className="ro-nav-inner">
          <div className="ro-logo">
            <div className="ro-logo-mark">R</div>
            <span>RelayOS</span>
          </div>
          <div className="ro-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="ro-nav-actions">
            <Link to="/login" className="ro-btn-ghost">Sign In</Link>
            <Link to="/register" className="ro-btn-primary">Get Started Free</Link>
          </div>
          {/* Mobile menu toggle */}
          <button className="ro-mobile-toggle" onClick={(e) => {
            const nav = (e.currentTarget as HTMLElement).closest('.ro-nav');
            nav?.classList.toggle('ro-nav-open');
          }}>
            <span /><span /><span />
          </button>
        </div>
        <div className="ro-mobile-menu">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login">Sign In</Link>
          <Link to="/register" className="ro-btn-primary" style={{ textAlign: 'center' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="ro-hero">
        <div className="ro-hero-gradient" />
        <div className="ro-hero-grid-bg" />
        <div className="ro-hero-content">
          <div className="ro-hero-badge ro-animate">
            <span className="ro-badge-dot" />
            Now in Early Access
          </div>
          <h1 className="ro-animate">
            Your AI Operating System
            <br />
            <span className="ro-gradient-text">for Work</span>
          </h1>
          <p className="ro-hero-sub ro-animate">
            RelayOS is an AI-powered executive assistant that autonomously manages
            your email, calendar, tasks, and decisions — so you can focus on what
            actually matters.
          </p>
          <div className="ro-hero-actions ro-animate">
            <Link to="/register" className="ro-btn-hero">
              Get Started Free
              <span className="ro-btn-arrow">&rarr;</span>
            </Link>
            <button onClick={scrollToFeatures} className="ro-btn-demo">
              See How It Works
              <span className="ro-btn-chevron">&darr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="ro-section" id="features">
        <div className="ro-section-inner">
          <div className="ro-section-header ro-animate">
            <span className="ro-section-label">Features</span>
            <h2>Everything you need to<br /><span className="ro-gradient-text">operate at 10x</span></h2>
            <p className="ro-section-sub">
              Four intelligent systems that work together to eliminate busywork
              and keep your operations running autonomously.
            </p>
          </div>

          {/* Feature 1 - Text Left */}
          <div className="ro-feature-row ro-animate">
            <div className="ro-feature-text">
              <span className="ro-feature-num">01</span>
              <h3>Intelligent Email Triage</h3>
              <p>
                RelayOS reads every incoming email, scores it by priority and urgency,
                and drafts contextual responses for the ones that actually need your
                attention. Newsletters, notifications, and noise get filtered out
                automatically. You only see what matters.
              </p>
              <ul className="ro-feature-list">
                <li>AI priority scoring for every message</li>
                <li>Auto-drafted responses for human emails</li>
                <li>Smart filtering that learns your preferences</li>
              </ul>
            </div>
            <div className="ro-feature-visual">
              <div className="ro-fv-card ro-glass">
                <div className="ro-fv-inbox">
                  <div className="ro-fv-mail ro-fv-high">
                    <div className="ro-fv-mail-dot" style={{ background: '#CC2936' }} />
                    <div className="ro-fv-mail-lines">
                      <div className="ro-fv-line" style={{ width: '60%' }} />
                      <div className="ro-fv-line" style={{ width: '80%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: '#CC293620', color: '#CC2936' }}>Urgent</span>
                  </div>
                  <div className="ro-fv-mail ro-fv-med">
                    <div className="ro-fv-mail-dot" style={{ background: '#00A7E1' }} />
                    <div className="ro-fv-mail-lines">
                      <div className="ro-fv-line" style={{ width: '50%' }} />
                      <div className="ro-fv-line" style={{ width: '70%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: '#00A7E120', color: '#00A7E1' }}>Review</span>
                  </div>
                  <div className="ro-fv-mail ro-fv-low">
                    <div className="ro-fv-mail-dot" style={{ background: 'rgba(236,228,183,0.2)' }} />
                    <div className="ro-fv-mail-lines">
                      <div className="ro-fv-line" style={{ width: '45%' }} />
                      <div className="ro-fv-line" style={{ width: '65%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: 'rgba(236,228,183,0.05)', color: 'rgba(236,228,183,0.35)' }}>Filtered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Text Right */}
          <div className="ro-feature-row ro-reverse ro-animate">
            <div className="ro-feature-text">
              <span className="ro-feature-num">02</span>
              <h3>Autonomous Calendar Management</h3>
              <p>
                Your calendar becomes intelligent. RelayOS handles scheduling requests,
                generates meeting prep briefs with full context, and optimizes your
                week for focus time. It knows your preferences and protects your
                most productive hours.
              </p>
              <ul className="ro-feature-list">
                <li>Automated scheduling and conflict resolution</li>
                <li>Pre-meeting briefs with attendee context</li>
                <li>Focus time protection and optimization</li>
              </ul>
            </div>
            <div className="ro-feature-visual">
              <div className="ro-fv-card ro-glass">
                <div className="ro-fv-calendar">
                  <div className="ro-fv-cal-header">
                    <div className="ro-fv-line" style={{ width: '30%', background: '#fff', height: '10px' }} />
                  </div>
                  <div className="ro-fv-cal-grid">
                    <div className="ro-fv-cal-block" style={{ background: '#00A7E120', borderLeft: '3px solid #00A7E1', height: '48px' }}>
                      <div className="ro-fv-line" style={{ width: '60%', height: '6px' }} />
                    </div>
                    <div className="ro-fv-cal-block ro-fv-focus" style={{ background: '#DEC0F110', borderLeft: '3px solid #DEC0F1', height: '64px' }}>
                      <div className="ro-fv-line" style={{ width: '40%', height: '6px' }} />
                      <span className="ro-fv-cal-tag">Focus Time</span>
                    </div>
                    <div className="ro-fv-cal-block" style={{ background: '#00A7E120', borderLeft: '3px solid #00A7E1', height: '36px' }}>
                      <div className="ro-fv-line" style={{ width: '55%', height: '6px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Text Left */}
          <div className="ro-feature-row ro-animate">
            <div className="ro-feature-text">
              <span className="ro-feature-num">03</span>
              <h3>Custom Agent Builder</h3>
              <p>
                Build AI agents tailored to your exact workflows. Connect any tool,
                define triggers and actions, and let your custom agents handle
                repetitive operational tasks end-to-end. No code required.
              </p>
              <ul className="ro-feature-list">
                <li>Visual workflow builder for any process</li>
                <li>500+ tool integrations via Composio</li>
                <li>Trigger-based automation with human-in-the-loop</li>
              </ul>
            </div>
            <div className="ro-feature-visual">
              <div className="ro-fv-card ro-glass">
                <div className="ro-fv-builder">
                  <div className="ro-fv-node ro-fv-node-trigger">
                    <div className="ro-fv-node-icon" style={{ background: '#00A7E120', borderColor: '#00A7E140' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A7E1' }} />
                    </div>
                    <div className="ro-fv-line" style={{ width: '50%', height: '6px' }} />
                  </div>
                  <div className="ro-fv-connector" />
                  <div className="ro-fv-node">
                    <div className="ro-fv-node-icon" style={{ background: '#DEC0F110', borderColor: '#DEC0F140' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: '#DEC0F1' }} />
                    </div>
                    <div className="ro-fv-line" style={{ width: '60%', height: '6px' }} />
                  </div>
                  <div className="ro-fv-connector" />
                  <div className="ro-fv-node">
                    <div className="ro-fv-node-icon" style={{ background: '#4ade8020', borderColor: '#4ade8040' }}>
                      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #4ade80' }} />
                    </div>
                    <div className="ro-fv-line" style={{ width: '45%', height: '6px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 - Text Right */}
          <div className="ro-feature-row ro-reverse ro-animate">
            <div className="ro-feature-text">
              <span className="ro-feature-num">04</span>
              <h3>Decision Intelligence</h3>
              <p>
                Every decision, commitment, and goal is tracked with full context.
                RelayOS detects when promises go unfulfilled, deadlines slip, and
                decisions stall — then surfaces the right information at the right
                time so nothing falls through the cracks.
              </p>
              <ul className="ro-feature-list">
                <li>Automatic commitment extraction from emails and meetings</li>
                <li>Decision ledger with rationale and status tracking</li>
                <li>Proactive alerts when things go off track</li>
              </ul>
            </div>
            <div className="ro-feature-visual">
              <div className="ro-fv-card ro-glass">
                <div className="ro-fv-decisions">
                  <div className="ro-fv-decision-item">
                    <div className="ro-fv-decision-status" style={{ background: '#4ade80' }} />
                    <div style={{ flex: 1 }}>
                      <div className="ro-fv-line" style={{ width: '70%', height: '8px', marginBottom: 6 }} />
                      <div className="ro-fv-line" style={{ width: '50%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: '#4ade8020', color: '#4ade80' }}>On Track</span>
                  </div>
                  <div className="ro-fv-decision-item">
                    <div className="ro-fv-decision-status" style={{ background: '#f0a030' }} />
                    <div style={{ flex: 1 }}>
                      <div className="ro-fv-line" style={{ width: '60%', height: '8px', marginBottom: 6 }} />
                      <div className="ro-fv-line" style={{ width: '45%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: '#f0a03020', color: '#f0a030' }}>At Risk</span>
                  </div>
                  <div className="ro-fv-decision-item">
                    <div className="ro-fv-decision-status" style={{ background: '#CC2936' }} />
                    <div style={{ flex: 1 }}>
                      <div className="ro-fv-line" style={{ width: '55%', height: '8px', marginBottom: 6 }} />
                      <div className="ro-fv-line" style={{ width: '40%', opacity: 0.4 }} />
                    </div>
                    <span className="ro-fv-badge" style={{ background: '#CC293620', color: '#CC2936' }}>Overdue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="ro-section ro-how" id="how-it-works">
        <div className="ro-section-inner">
          <div className="ro-section-header ro-animate">
            <span className="ro-section-label">How It Works</span>
            <h2>Three steps to<br /><span className="ro-gradient-text">autonomous operations</span></h2>
          </div>
          <div className="ro-steps">
            <div className="ro-step ro-animate">
              <div className="ro-step-number">
                <span>1</span>
              </div>
              <div className="ro-step-line" />
              <h4>Connect</h4>
              <p>
                Link your Gmail, Calendar, and Drive. Add Slack, Notion, or 500+ other
                tools through Composio. Setup takes two minutes.
              </p>
            </div>
            <div className="ro-step ro-animate">
              <div className="ro-step-number">
                <span>2</span>
              </div>
              <div className="ro-step-line" />
              <h4>Configure</h4>
              <p>
                Set your preferences, create custom agents, and define your workflows.
                RelayOS learns your priorities and communication style.
              </p>
            </div>
            <div className="ro-step ro-animate">
              <div className="ro-step-number">
                <span>3</span>
              </div>
              <div className="ro-step-line ro-step-line-hidden" />
              <h4>Operate</h4>
              <p>
                RelayOS takes over. Emails triaged, meetings prepped, decisions tracked,
                follow-ups sent. You focus on high-leverage work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="ro-cta-section">
        <div className="ro-cta-gradient" />
        <div className="ro-cta-content ro-animate">
          <h2>Ready to 10x your productivity?</h2>
          <p>
            Join teams already using RelayOS to run their operations on autopilot.
            Free to start. No credit card required.
          </p>
          <Link to="/register" className="ro-btn-hero ro-btn-cta-main">
            Get Started Free
            <span className="ro-btn-arrow">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="ro-footer">
        <div className="ro-footer-inner">
          <div className="ro-footer-top">
            <div className="ro-footer-brand">
              <div className="ro-logo">
                <div className="ro-logo-mark">R</div>
                <span>RelayOS</span>
              </div>
              <p className="ro-footer-tagline">
                Your AI operating system for work.
              </p>
            </div>
            <div className="ro-footer-columns">
              <div className="ro-footer-col">
                <h5>Product</h5>
                <a href="#features">Features</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Pricing</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Docs</a>
              </div>
              <div className="ro-footer-col">
                <h5>Company</h5>
                <a href="#" onClick={(e) => e.preventDefault()}>About</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Blog</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
              </div>
              <div className="ro-footer-col">
                <h5>Legal</h5>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
              <div className="ro-footer-col">
                <h5>Contact</h5>
                <a href="mailto:krish@getmetacognition.com">krish@getmetacognition.com</a>
              </div>
            </div>
          </div>
          <div className="ro-footer-bottom">
            <p>2025 RelayOS. All rights reserved.</p>
            <div className="ro-footer-social">
              {/* Twitter/X */}
              <a href="#" onClick={(e) => e.preventDefault()} className="ro-social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" onClick={(e) => e.preventDefault()} className="ro-social-icon" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="4" />
                  <line x1="8" y1="11" x2="8" y2="16" />
                  <line x1="8" y1="8" x2="8" y2="8.01" />
                  <line x1="12" y1="16" x2="12" y2="11" />
                  <path d="M16 16v-3a2 2 0 0 0-4 0" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" onClick={(e) => e.preventDefault()} className="ro-social-icon" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== STYLES ===================== */}
      <style>{`
        /* === Reset & Base === */
        .ro {
          min-height: 100vh;
          background: #020202;
          color: #ECE4B7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        .ro *, .ro *::before, .ro *::after {
          box-sizing: border-box;
        }

        /* === Scroll Animations === */
        .ro-animate {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ro-animate.ro-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger children */
        .ro-feature-row.ro-visible { transition-delay: 0.05s; }
        .ro-step:nth-child(2).ro-visible { transition-delay: 0.1s; }
        .ro-step:nth-child(3).ro-visible { transition-delay: 0.2s; }

        /* === Gradient Text === */
        .ro-gradient-text {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 50%, #00A7E1 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ro-gradient-shift 6s ease infinite;
        }

        @keyframes ro-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* === Glass === */
        .ro-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* ============================================
           NAV
        ============================================ */
        .ro-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(2, 2, 2, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ro-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ro-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #ECE4B7;
          text-decoration: none;
        }

        .ro-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00A7E1, #DEC0F1);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .ro-nav-links {
          display: flex;
          gap: 36px;
        }

        .ro-nav-links a {
          color: rgba(236, 228, 183, 0.5);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }

        .ro-nav-links a:hover {
          color: #ECE4B7;
        }

        .ro-nav-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .ro-btn-ghost {
          padding: 8px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: #ECE4B7;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .ro-btn-ghost:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .ro-btn-primary {
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          background: #ECE4B7;
          color: #020202;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .ro-btn-primary:hover {
          background: #d6ce9e;
          transform: translateY(-1px);
        }

        /* Mobile toggle */
        .ro-mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .ro-mobile-toggle span {
          display: block;
          width: 20px;
          height: 2px;
          background: #ECE4B7;
          border-radius: 1px;
          transition: all 0.2s;
        }

        .ro-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 4px;
          padding: 0 32px 20px;
        }

        .ro-mobile-menu a {
          color: rgba(236, 228, 183, 0.5);
          text-decoration: none;
          padding: 10px 0;
          font-size: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: color 0.2s;
        }

        .ro-mobile-menu a:hover {
          color: #ECE4B7;
        }

        /* ============================================
           HERO
        ============================================ */
        .ro-hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 32px 100px;
          overflow: hidden;
        }

        .ro-hero-gradient {
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 167, 225, 0.12) 0%, rgba(222, 192, 241, 0.06) 40%, transparent 70%);
          animation: ro-hero-pulse 8s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes ro-hero-pulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        .ro-hero-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          pointer-events: none;
        }

        .ro-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
        }

        .ro-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border: 1px solid rgba(0, 167, 225, 0.2);
          border-radius: 20px;
          font-size: 13px;
          color: #00A7E1;
          margin-bottom: 32px;
          background: rgba(0, 167, 225, 0.05);
        }

        .ro-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00A7E1;
          animation: ro-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes ro-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .ro-hero h1 {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 24px;
          color: #ECE4B7;
        }

        .ro-hero-sub {
          font-size: 18px;
          line-height: 1.7;
          color: rgba(236, 228, 183, 0.55);
          max-width: 560px;
          margin: 0 auto 44px;
        }

        .ro-hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .ro-btn-hero {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          background: #ECE4B7;
          color: #020202;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ro-btn-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(236, 228, 183, 0.15);
        }

        .ro-btn-arrow {
          transition: transform 0.2s;
        }

        .ro-btn-hero:hover .ro-btn-arrow {
          transform: translateX(3px);
        }

        .ro-btn-demo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #ECE4B7;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
        }

        .ro-btn-demo:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }

        .ro-btn-chevron {
          opacity: 0.6;
          transition: transform 0.2s;
        }

        .ro-btn-demo:hover .ro-btn-chevron {
          transform: translateY(2px);
        }

        /* ============================================
           SECTIONS
        ============================================ */
        .ro-section {
          padding: 120px 32px;
        }

        .ro-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .ro-section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .ro-section-label {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          color: #00A7E1;
          margin-bottom: 16px;
        }

        .ro-section h2 {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          line-height: 1.1;
          color: #ECE4B7;
          margin: 0 0 20px;
          letter-spacing: -0.03em;
        }

        .ro-section-sub {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(236, 228, 183, 0.5);
          max-width: 540px;
          margin: 0 auto;
        }

        /* ============================================
           FEATURES - Alternating Layout
        ============================================ */
        .ro-feature-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          margin-bottom: 100px;
        }

        .ro-feature-row:last-child {
          margin-bottom: 0;
        }

        .ro-feature-row.ro-reverse .ro-feature-text {
          order: 2;
        }

        .ro-feature-row.ro-reverse .ro-feature-visual {
          order: 1;
        }

        .ro-feature-num {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          color: #00A7E1;
          letter-spacing: 2px;
          margin-bottom: 12px;
          font-variant-numeric: tabular-nums;
        }

        .ro-feature-text h3 {
          font-size: 28px;
          font-weight: 800;
          color: #ECE4B7;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .ro-feature-text p {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(236, 228, 183, 0.5);
          margin: 0 0 24px;
        }

        .ro-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ro-feature-list li {
          padding: 8px 0;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ro-feature-list li::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00A7E1;
          flex-shrink: 0;
        }

        /* Feature Visuals */
        .ro-feature-visual {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ro-fv-card {
          width: 100%;
          max-width: 440px;
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s;
        }

        .ro-fv-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* Email triage visual */
        .ro-fv-inbox {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ro-fv-mail {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s;
        }

        .ro-fv-mail:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .ro-fv-mail-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ro-fv-mail-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ro-fv-line {
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .ro-fv-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
          white-space: nowrap;
        }

        /* Calendar visual */
        .ro-fv-calendar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ro-fv-cal-header {
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ro-fv-cal-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ro-fv-cal-block {
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ro-fv-cal-tag {
          font-size: 10px;
          font-weight: 600;
          color: #DEC0F1;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Builder visual */
        .ro-fv-builder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .ro-fv-node {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
          max-width: 260px;
        }

        .ro-fv-node-trigger {
          composes: ro-fv-node;
        }

        .ro-fv-node-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ro-fv-connector {
          width: 2px;
          height: 20px;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Decisions visual */
        .ro-fv-decisions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ro-fv-decision-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .ro-fv-decision-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ============================================
           HOW IT WORKS
        ============================================ */
        .ro-how {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .ro-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 64px;
        }

        .ro-step {
          position: relative;
          text-align: center;
          padding: 40px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .ro-step:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }

        .ro-step-number {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 167, 225, 0.1), rgba(222, 192, 241, 0.1));
          border: 1px solid rgba(0, 167, 225, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .ro-step-number span {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #00A7E1, #DEC0F1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ro-step-line {
          position: absolute;
          top: 58px;
          right: -16px;
          width: 32px;
          height: 2px;
          background: rgba(0, 167, 225, 0.2);
          z-index: 1;
        }

        .ro-step-line-hidden {
          display: none;
        }

        .ro-step h4 {
          font-size: 20px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 12px;
        }

        .ro-step p {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(236, 228, 183, 0.45);
          margin: 0;
        }

        /* ============================================
           FINAL CTA
        ============================================ */
        .ro-cta-section {
          position: relative;
          padding: 120px 32px;
          text-align: center;
          overflow: hidden;
        }

        .ro-cta-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(0, 167, 225, 0.08) 0%, rgba(222, 192, 241, 0.04) 40%, transparent 70%);
          pointer-events: none;
        }

        .ro-cta-content {
          position: relative;
          z-index: 2;
        }

        .ro-cta-content h2 {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          color: #ECE4B7;
          margin: 0 0 16px;
          letter-spacing: -0.03em;
        }

        .ro-cta-content p {
          font-size: 17px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0 0 40px;
          line-height: 1.7;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 40px;
        }

        .ro-btn-cta-main {
          font-size: 18px;
          padding: 18px 40px;
        }

        /* ============================================
           FOOTER
        ============================================ */
        .ro-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 64px 32px 32px;
        }

        .ro-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .ro-footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 64px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ro-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ro-footer-tagline {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.35);
          margin: 0;
          line-height: 1.5;
        }

        .ro-footer-columns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .ro-footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ro-footer-col h5 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0 0 4px;
        }

        .ro-footer-col a {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.3);
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.4;
        }

        .ro-footer-col a:hover {
          color: #ECE4B7;
        }

        .ro-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
        }

        .ro-footer-bottom p {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.25);
          margin: 0;
        }

        .ro-footer-social {
          display: flex;
          gap: 16px;
        }

        .ro-social-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(236, 228, 183, 0.3);
          text-decoration: none;
          transition: all 0.2s;
        }

        .ro-social-icon:hover {
          color: #ECE4B7;
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.03);
        }

        /* ============================================
           RESPONSIVE
        ============================================ */
        @media (max-width: 1024px) {
          .ro-feature-row {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .ro-feature-row.ro-reverse .ro-feature-text {
            order: 1;
          }

          .ro-feature-row.ro-reverse .ro-feature-visual {
            order: 2;
          }

          .ro-fv-card {
            max-width: 100%;
          }

          .ro-footer-top {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .ro-nav-links,
          .ro-nav-actions {
            display: none;
          }

          .ro-mobile-toggle {
            display: flex;
          }

          .ro-nav.ro-nav-open .ro-mobile-menu {
            display: flex;
          }

          .ro-hero {
            min-height: auto;
            padding: 100px 20px 60px;
          }

          .ro-hero h1 {
            font-size: 36px;
          }

          .ro-hero-sub {
            font-size: 16px;
          }

          .ro-hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .ro-btn-hero,
          .ro-btn-demo {
            width: 100%;
            justify-content: center;
          }

          .ro-section {
            padding: 80px 20px;
          }

          .ro-section-header {
            margin-bottom: 48px;
          }

          .ro-feature-row {
            margin-bottom: 64px;
          }

          .ro-feature-text h3 {
            font-size: 24px;
          }

          .ro-steps {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ro-step-line {
            display: none;
          }

          .ro-footer-columns {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .ro-footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .ro-cta-section {
            padding: 80px 20px;
          }
        }

        @media (max-width: 480px) {
          .ro-nav-inner {
            padding: 14px 16px;
          }

          .ro-hero h1 {
            font-size: 30px;
          }

          .ro-section h2 {
            font-size: 28px;
          }

          .ro-footer-columns {
            grid-template-columns: 1fr;
          }

        }
      `}</style>
    </div>
  );
}
