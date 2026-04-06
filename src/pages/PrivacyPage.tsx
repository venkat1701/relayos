import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <Link to="/" className="legal-home">
            RelayOS
          </Link>
          <div className="legal-links">
            <Link to="/terms">Terms</Link>
            <Link to="/login">Login</Link>
          </div>
        </header>

        <main className="legal-card">
          <p className="legal-kicker">Privacy Policy</p>
          <h1>RelayOS Privacy Policy</h1>
          <p className="legal-updated">Effective date: March 30, 2026</p>

          <section>
            <h2>What we collect</h2>
            <p>
              We collect account information you provide directly, such as your name, email address,
              workspace details, and authentication data. When you connect integrations, we may also
              process metadata and content from services you authorize, including email, calendar,
              documents, spreadsheets, and messaging systems.
            </p>
          </section>

          <section>
            <h2>How we use information</h2>
            <p>
              We use your information to operate the RelayOS product, authenticate users,
              synchronize connected services, generate briefings and recommendations, improve product
              reliability, monitor abuse, and communicate service updates or security notices.
            </p>
          </section>

          <section>
            <h2>Connected accounts and OAuth data</h2>
            <p>
              When you connect third-party services through OAuth, we store the minimum credentials and
              metadata required to maintain that connection and perform the actions you authorize. Access
              tokens are used only to provide the features you enable for your workspace and may be revoked
              by disconnecting the integration.
            </p>
          </section>

          <section>
            <h2>Sharing</h2>
            <p>
              We do not sell personal information. We may share data with subprocessors and infrastructure
              providers that help us host, secure, and operate the product, or when required by law,
              regulation, or a valid legal request.
            </p>
          </section>

          <section>
            <h2>Security and retention</h2>
            <p>
              We apply reasonable administrative, technical, and organizational safeguards to protect
              workspace data. Information is retained for as long as needed to operate the service, comply
              with legal obligations, resolve disputes, and enforce agreements.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              For privacy questions or requests, contact{" "}
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
