/**
 * Chief of Staff OS — Landing Page
 * YC-style: clear value prop, descriptive features, pricing, social proof
 */

import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp">
      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark noise">CS</div>
            <span>Chief of Staff</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="lp-nav-actions">
            <button onClick={() => navigate("/login")} className="lp-btn-ghost">Sign In</button>
            <button onClick={() => navigate("/register")} className="lp-btn-primary">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-badge">Backed by AI. Built for operators.</div>
        <h1>The operating system<br />for your <span className="lp-gradient-text">Chief of Staff</span></h1>
        <p className="lp-hero-sub">
          An autonomous agent that sits on Calendar, Gmail, Docs, and Sheets — understands
          commitments, priorities, risks, and rhythms — then pushes work forward
          without you having to remember everything.
        </p>
        <div className="lp-hero-actions">
          <button onClick={() => navigate("/register")} className="lp-btn-hero">Start Free — No Card Required</button>
        </div>
        <div className="lp-hero-proof">
          <span>Trusted by founders, operators, and executive teams</span>
        </div>

        {/* Preview */}
        <div className="lp-preview">
          <div className="lp-preview-bar">
            <div className="lp-dots"><span /><span /><span /></div>
            <span>Command Center</span>
          </div>
          <div className="lp-preview-grid">
            <div className="lp-pv-card">
              <div className="lp-pv-num" style={{ color: '#CC2936' }}>3</div>
              <div className="lp-pv-label">Overdue commitments</div>
            </div>
            <div className="lp-pv-card">
              <div className="lp-pv-num" style={{ color: '#00A7E1' }}>2</div>
              <div className="lp-pv-label">Decisions pending</div>
            </div>
            <div className="lp-pv-card">
              <div className="lp-pv-num" style={{ color: '#4ade80' }}>Normal</div>
              <div className="lp-pv-label">Crisis level</div>
            </div>
            <div className="lp-pv-card lp-pv-wide">
              <div className="lp-pv-label" style={{ color: '#DEC0F1', fontWeight: 600 }}>Weekly Plan</div>
              <div className="lp-pv-sub">67% meeting load — 3 recommendations — 8 priority items</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="lp-section" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="lp-section-inner">
          <h2>The problem is not productivity.<br />It's <span style={{ color: '#CC2936' }}>operational coherence</span>.</h2>
          <p className="lp-section-sub">
            Your calendar is full of meetings that don't move things forward. Your email has 40 threads with hidden commitments.
            Your docs contain decisions nobody remembers. Your sheets have metrics nobody checks. You're the most productive
            person in the room — and still dropping balls.
          </p>
          <div className="lp-problem-grid">
            <div className="lp-problem-item">
              <div className="lp-problem-icon" style={{ borderColor: '#CC293640' }}>!</div>
              <h4>Commitments decay silently</h4>
              <p>"I'll send that by Thursday" — nobody tracked it, Thursday passed, trust eroded.</p>
            </div>
            <div className="lp-problem-item">
              <div className="lp-problem-icon" style={{ borderColor: '#f0a03040' }}>?</div>
              <h4>Decisions vanish into docs</h4>
              <p>You decided something in a meeting. It's in a doc. Nobody remembers. You re-decide it.</p>
            </div>
            <div className="lp-problem-item">
              <div className="lp-problem-icon" style={{ borderColor: '#00A7E140' }}>~</div>
              <h4>Context is scattered</h4>
              <p>The same project shows up as an email, a meeting topic, a doc, and a row in a sheet. Good luck stitching that together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">CAPABILITIES</div>
          <h2>Not another dashboard.<br />A continuous <span className="lp-gradient-text">operational reasoning system</span>.</h2>
          <div className="lp-features-grid">
            {[
              { title: "Morning Briefing", desc: "What needs attention today. What changed overnight. Which decisions are pending. Where follow-up is overdue. Generated automatically, every morning.", color: "#00A7E1" },
              { title: "Commitment Tracking", desc: "Every promise made or received — extracted from emails, meetings, docs. Tracked with deadlines. Nudges sent when overdue. No more polite collective forgetting.", color: "#DEC0F1" },
              { title: "Decision Ledger", desc: "Every decision recorded with rationale, impact, and execution status. The agent detects when a decision was made but never executed.", color: "#4ade80" },
              { title: "Meeting Prep", desc: "Before every meeting: prior decisions, unresolved items, attendee context, relevant risks, suggested agenda. Auto-generated, workspace-scoped.", color: "#f0a030" },
              { title: "Calendar Intelligence", desc: "Time allocation analysis. Fragmentation detection. Focus time protection. Meeting optimization. Goal alignment checks.", color: "#00A7E1" },
              { title: "Risk Monitoring", desc: "Risks extracted from emails, meetings, docs. Severity scoring. Crisis detection when signals spike across multiple dimensions.", color: "#CC2936" },
              { title: "Workspace Isolation", desc: "Each workspace scopes what the agent sees. Product launch doesn't mix with hiring. Board prep doesn't leak into engineering.", color: "#DEC0F1" },
              { title: "500+ Tool Integrations", desc: "Gmail, Calendar, Drive, Docs, Sheets natively. Slack, Notion, Fireflies, WhatsApp, and 500+ more via Composio.", color: "#4ade80" },
              { title: "Autonomous Agent", desc: "Three modes: Advisory (suggests), Delegated (acts on low-risk), Autonomous (operates independently). You control the dial.", color: "#f0a030" },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-dot" style={{ background: f.color }} />
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section" id="how" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="lp-section-inner">
          <div className="lp-section-label">HOW IT WORKS</div>
          <h2>Connect. Understand. Operate.</h2>
          <div className="lp-steps">
            {[
              { step: "1", title: "Connect your workspace", desc: "Link Gmail, Calendar, Drive. Optionally connect Slack, Notion, Fireflies, WhatsApp via Composio. Takes 2 minutes." },
              { step: "2", title: "Agent builds your model", desc: "The agent reads your workspace: recurring meetings, collaborators, initiatives, trackers, decision docs. It builds a living model of your operational reality." },
              { step: "3", title: "You get an operator", desc: "Commitments tracked. Decisions recorded. Risks flagged. Meeting prep generated. Follow-ups nudged. Calendar optimized. Weekly plans proposed. All autonomous." },
            ].map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{s.step}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="lp-section" id="pricing">
        <div className="lp-section-inner">
          <div className="lp-section-label">PRICING</div>
          <h2>Simple pricing. No surprises.</h2>
          <p className="lp-section-sub">Start free. Upgrade when the agent earns its keep.</p>
          <div className="lp-pricing-grid">
            <div className="lp-price-card">
              <div className="lp-price-name">Starter</div>
              <div className="lp-price-amount">$0<span>/mo</span></div>
              <div className="lp-price-desc">For individuals getting started</div>
              <ul className="lp-price-features">
                <li>Google Workspace integration</li>
                <li>Daily executive briefing</li>
                <li>Commitment tracking (up to 50)</li>
                <li>Basic meeting prep</li>
                <li>Advisory mode only</li>
              </ul>
              <button onClick={() => navigate("/register")} className="lp-btn-price">Get Started Free</button>
            </div>
            <div className="lp-price-card featured">
              <div className="lp-price-badge">Most Popular</div>
              <div className="lp-price-name">Pro</div>
              <div className="lp-price-amount">$49<span>/mo</span></div>
              <div className="lp-price-desc">For operators who want full autonomy</div>
              <ul className="lp-price-features">
                <li>Everything in Starter</li>
                <li>Unlimited commitments & decisions</li>
                <li>Workspace context isolation</li>
                <li>Slack, Notion, Fireflies, WhatsApp</li>
                <li>Delegated + Autonomous modes</li>
                <li>Weekly planning & calendar optimization</li>
                <li>Crisis detection & risk monitoring</li>
                <li>Rich document editor with AI suggestions</li>
              </ul>
              <button onClick={() => navigate("/register")} className="lp-btn-price featured">Start 14-Day Trial</button>
            </div>
            <div className="lp-price-card">
              <div className="lp-price-name">Team</div>
              <div className="lp-price-amount">$149<span>/mo</span></div>
              <div className="lp-price-desc">For leadership teams and orgs</div>
              <ul className="lp-price-features">
                <li>Everything in Pro</li>
                <li>Up to 10 team members</li>
                <li>Shared workspaces</li>
                <li>Cross-team dependency tracking</li>
                <li>Custom integrations</li>
                <li>Priority support</li>
              </ul>
              <button onClick={() => navigate("/register")} className="lp-btn-price">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-cta noise">
        <h2>Stop managing work manually.<br />Let the agent operate.</h2>
        <p>14 days free. No credit card. Cancel anytime.</p>
        <button onClick={() => navigate("/register")} className="lp-btn-cta">Get Started Free</button>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark">CS</div>
            <span>Chief of Staff</span>
          </div>
          <p>2026 Chief of Staff OS. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .lp { min-height: 100vh; background: #020202; color: #ECE4B7; }

        /* Nav */
        .lp-nav { position: sticky; top: 0; z-index: 100; background: rgba(2,2,2,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #1a1a1a; }
        .lp-nav-inner { max-width: 1200px; margin: 0 auto; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
        .lp-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; }
        .lp-logo-mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #00A7E1, #DEC0F1); color: #020202; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
        .lp-nav-links { display: flex; gap: 32px; }
        .lp-nav-links a { color: #888; font-size: 14px; text-decoration: none; transition: color 0.2s; }
        .lp-nav-links a:hover { color: #ECE4B7; }
        .lp-nav-actions { display: flex; gap: 10px; }
        .lp-btn-ghost { padding: 8px 20px; border-radius: 8px; border: 1px solid #333; background: transparent; color: #ECE4B7; font-size: 13px; cursor: pointer; }
        .lp-btn-primary { padding: 8px 20px; border-radius: 8px; border: none; background: #fff; color: #020202; font-size: 13px; font-weight: 600; cursor: pointer; }

        /* Hero */
        .lp-hero { max-width: 900px; margin: 0 auto; padding: 80px 32px 60px; text-align: center; }
        .lp-hero-badge { display: inline-block; padding: 6px 16px; border: 1px solid #1a1a1a; border-radius: 20px; font-size: 13px; color: #888; margin-bottom: 28px; }
        .lp-hero h1 { font-size: 56px; font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin: 0 0 24px; color: #fff; }
        .lp-gradient-text { background: linear-gradient(135deg, #00A7E1, #DEC0F1, #CC2936); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-hero-sub { font-size: 18px; line-height: 1.7; color: #888; max-width: 640px; margin: 0 auto 36px; }
        .lp-hero-actions { margin-bottom: 16px; }
        .lp-btn-hero { padding: 16px 36px; border-radius: 12px; border: none; background: #fff; color: #020202; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .lp-btn-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,255,255,0.1); }
        .lp-hero-proof { color: #555; font-size: 13px; margin-top: 12px; }

        /* Preview */
        .lp-preview { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; max-width: 800px; margin: 48px auto 0; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .lp-preview-bar { padding: 14px 20px; background: #0d0d0d; border-bottom: 1px solid #1a1a1a; display: flex; align-items: center; gap: 12px; }
        .lp-dots { display: flex; gap: 6px; }
        .lp-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .lp-dots span:nth-child(1) { background: #CC2936; }
        .lp-dots span:nth-child(2) { background: #DEC0F1; }
        .lp-dots span:nth-child(3) { background: #00A7E1; }
        .lp-preview-bar span:last-child { color: #555; font-size: 13px; }
        .lp-preview-grid { padding: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .lp-pv-card { background: #080808; border: 1px solid #141414; border-radius: 10px; padding: 16px; }
        .lp-pv-wide { grid-column: 1 / -1; }
        .lp-pv-num { font-size: 28px; font-weight: 800; margin-bottom: 2px; }
        .lp-pv-label { color: #888; font-size: 12px; }
        .lp-pv-sub { color: #666; font-size: 12px; margin-top: 4px; }

        /* Sections */
        .lp-section { padding: 100px 32px; }
        .lp-section-inner { max-width: 1100px; margin: 0 auto; }
        .lp-section-label { color: #00A7E1; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .lp-section h2 { font-size: 40px; font-weight: 800; line-height: 1.15; color: #fff; margin: 0 0 20px; }
        .lp-section-sub { font-size: 17px; line-height: 1.7; color: #888; max-width: 600px; }

        /* Problem */
        .lp-problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
        .lp-problem-item { padding: 28px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; }
        .lp-problem-icon { width: 40px; height: 40px; border-radius: 10px; border: 2px solid; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #888; margin-bottom: 16px; }
        .lp-problem-item h4 { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .lp-problem-item p { font-size: 14px; line-height: 1.6; color: #888; margin: 0; }

        /* Features */
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; }
        .lp-feature-card { padding: 24px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; transition: all 0.2s; }
        .lp-feature-card:hover { border-color: #333; transform: translateY(-2px); }
        .lp-feature-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 14px; }
        .lp-feature-card h4 { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .lp-feature-card p { font-size: 13px; line-height: 1.6; color: #888; margin: 0; }

        /* How it works */
        .lp-steps { display: flex; flex-direction: column; gap: 0; margin-top: 48px; }
        .lp-step { display: flex; gap: 24px; padding: 32px 0; border-bottom: 1px solid #111; }
        .lp-step:last-child { border-bottom: none; }
        .lp-step-num { width: 48px; height: 48px; border-radius: 50%; background: #0a0a0a; border: 2px solid #00A7E1; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: #00A7E1; flex-shrink: 0; }
        .lp-step h4 { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .lp-step p { font-size: 15px; line-height: 1.6; color: #888; margin: 0; }

        /* Pricing */
        .lp-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
        .lp-price-card { padding: 32px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; position: relative; display: flex; flex-direction: column; }
        .lp-price-card.featured { border-color: #00A7E1; background: #080e14; }
        .lp-price-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; background: #00A7E1; color: #020202; font-size: 11px; font-weight: 700; border-radius: 12px; text-transform: uppercase; }
        .lp-price-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .lp-price-amount { font-size: 44px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .lp-price-amount span { font-size: 16px; font-weight: 400; color: #888; }
        .lp-price-desc { font-size: 14px; color: #888; margin-bottom: 24px; }
        .lp-price-features { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
        .lp-price-features li { padding: 8px 0; font-size: 14px; color: #aaa; border-bottom: 1px solid #111; }
        .lp-price-features li:last-child { border-bottom: none; }
        .lp-price-features li::before { content: "\\2713  "; color: #00A7E1; font-weight: 700; }
        .lp-btn-price { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #333; background: transparent; color: #ECE4B7; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .lp-btn-price:hover { background: #141414; }
        .lp-btn-price.featured { background: #00A7E1; color: #020202; border: none; }
        .lp-btn-price.featured:hover { background: #0090c5; }

        /* CTA */
        .lp-cta { text-align: center; padding: 80px 32px; margin: 0; background: linear-gradient(135deg, #00A7E1, #DEC0F1, #CC2936); }
        .lp-cta h2 { font-size: 40px; font-weight: 800; color: #020202; margin: 0 0 12px; }
        .lp-cta p { font-size: 16px; color: rgba(2,2,2,0.7); margin: 0 0 28px; }
        .lp-btn-cta { padding: 16px 40px; border-radius: 12px; border: none; background: #020202; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }
        .lp-btn-cta:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

        /* Footer */
        .lp-footer { padding: 32px; border-top: 1px solid #1a1a1a; }
        .lp-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .lp-footer p { color: #555; font-size: 13px; margin: 0; }

        /* Responsive */
        @media (max-width: 900px) {
          .lp-hero h1 { font-size: 36px; }
          .lp-section h2 { font-size: 28px; }
          .lp-features-grid, .lp-problem-grid, .lp-pricing-grid { grid-template-columns: 1fr; }
          .lp-preview-grid { grid-template-columns: 1fr; }
          .lp-nav-links { display: none; }
        }
      `}</style>
    </div>
  );
}
