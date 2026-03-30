import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <Link to="/" className="legal-home">
            Chief of Staff
          </Link>
          <div className="legal-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/login">Login</Link>
          </div>
        </header>

        <main className="legal-card">
          <p className="legal-kicker">Terms of Service</p>
          <h1>Chief of Staff Terms of Service</h1>
          <p className="legal-updated">Effective date: March 30, 2026</p>

          <section>
            <h2>Use of the service</h2>
            <p>
              Chief of Staff provides operational tooling, automation, and workspace intelligence for teams
              and operators. You may use the service only in compliance with applicable law and these terms.
              You are responsible for activity that occurs under your account and for maintaining the security
              of your credentials.
            </p>
          </section>

          <section>
            <h2>Connected services</h2>
            <p>
              Certain features require access to third-party services such as Google Workspace, Slack, or
              other integrations. By connecting those services, you authorize Chief of Staff to access and
              process the data necessary to provide the functionality you enable.
            </p>
          </section>

          <section>
            <h2>Acceptable use</h2>
            <p>
              You may not use the service to violate the rights of others, interfere with system integrity or
              security, upload malicious code, attempt unauthorized access, or use the product in a way that
              breaches contracts, policies, or legal obligations.
            </p>
          </section>

          <section>
            <h2>Availability and changes</h2>
            <p>
              We may modify, suspend, or discontinue features from time to time. We do not guarantee that the
              service will be uninterrupted or error-free, but we aim to maintain reliable operation and will
              use reasonable efforts to address material incidents.
            </p>
          </section>

          <section>
            <h2>Termination</h2>
            <p>
              We may suspend or terminate access if these terms are violated or if continued access would pose
              security, legal, or operational risk. You may stop using the service at any time by disconnecting
              integrations and ceasing access.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href="mailto:krish.j@maximem.ai">krish.j@maximem.ai</a>.
            </p>
          </section>
        </main>
      </div>

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: #020202;
          color: #ece4b7;
          padding: 32px 20px 64px;
        }

        .legal-shell {
          max-width: 960px;
          margin: 0 auto;
        }

        .legal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .legal-home,
        .legal-links a,
        .legal-card a {
          color: #00a7e1;
          text-decoration: none;
        }

        .legal-links {
          display: flex;
          gap: 16px;
          font-size: 14px;
        }

        .legal-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .legal-kicker {
          margin: 0 0 8px;
          color: #00a7e1;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .legal-card h1 {
          margin: 0 0 8px;
          font-size: 40px;
          line-height: 1.1;
          color: #fff;
        }

        .legal-updated {
          margin: 0 0 32px;
          color: rgba(236, 228, 183, 0.55);
        }

        .legal-card section {
          margin-top: 28px;
        }

        .legal-card h2 {
          margin: 0 0 10px;
          font-size: 20px;
          color: #fff;
        }

        .legal-card p {
          margin: 0;
          line-height: 1.7;
          color: rgba(236, 228, 183, 0.82);
        }

        @media (max-width: 720px) {
          .legal-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .legal-card {
            padding: 28px 20px;
          }

          .legal-card h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
