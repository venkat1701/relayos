/**
 * Post-Registration Onboarding Wizard
 * Multi-step flow: Welcome -> Connect Integrations -> Set Preferences -> Quick Tour
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IntegrationResponse } from "../lib/types";

interface OnboardingPageProps {
  selectedOrganizationId: string;
  integrations: IntegrationResponse[];
  token: string;
  onComplete: () => void;
  onConnectGoogle: () => void;
}

const TOTAL_STEPS = 4;

const ONBOARDING_PREFS_KEY = "relayos_onboarding_prefs";

type AgentMode = "advisory" | "delegated" | "autonomous";

interface Preferences {
  agentMode: AgentMode;
  briefTime: string;
}

function getStoredPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(ONBOARDING_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { agentMode: "delegated", briefTime: "08:00" };
}

function storePrefs(prefs: Preferences) {
  try {
    localStorage.setItem(ONBOARDING_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function OnboardingPage({
  integrations,
  onComplete,
  onConnectGoogle,
}: OnboardingPageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(getStoredPrefs);

  const googleConnected = integrations.some(
    (i) => i.provider.toLowerCase().includes("google"),
  );

  useEffect(() => {
    storePrefs(prefs);
  }, [prefs]);

  const goTo = (next: number) => {
    if (animating) return;
    setDirection(next > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 300);
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) goTo(step + 1);
  };

  const agentModes: { value: AgentMode; label: string; desc: string }[] = [
    {
      value: "advisory",
      label: "Advisory",
      desc: "I'll suggest actions, you decide",
    },
    {
      value: "delegated",
      label: "Delegated",
      desc: "I'll handle routine tasks, ask for big decisions",
    },
    {
      value: "autonomous",
      label: "Autonomous",
      desc: "I'll handle everything, notify you of results",
    },
  ];

  const tourCards = [
    {
      icon: "fi fi-rr-envelope",
      title: "Smart Inbox",
      desc: "AI triages your email, drafts responses, and handles follow-ups",
    },
    {
      icon: "fi fi-rr-calendar",
      title: "Meeting Prep",
      desc: "Get briefed before every meeting with relevant context",
    },
    {
      icon: "fi fi-rr-cube",
      title: "Agent Builder",
      desc: "Create custom agents for any workflow",
    },
    {
      icon: "fi fi-rr-balance-scale-left",
      title: "Decision Tracker",
      desc: "Never lose track of commitments and decisions",
    },
  ];

  return (
    <div className="onb-page">
      <div className="onb-card">
        {/* Step indicator */}
        <div className="onb-dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <button
              key={i}
              className={`onb-dot${i === step ? " onb-dot--active" : ""}${i < step ? " onb-dot--done" : ""}`}
              onClick={() => i < step && goTo(i)}
              aria-label={`Step ${i + 1}`}
              type="button"
            />
          ))}
        </div>

        {/* Step content with slide animation */}
        <div className="onb-viewport">
          <div
            className={`onb-slide ${animating ? (direction === "forward" ? "onb-slide--exit-left" : "onb-slide--exit-right") : "onb-slide--enter"}`}
          >
            {/* Step 1: Welcome */}
            {step === 0 && (
              <div className="onb-step">
                <div className="onb-welcome-icon">
                  <div className="onb-logo-mark">R</div>
                </div>
                <h1 className="onb-heading">Welcome to RelayOS</h1>
                <p className="onb-body">
                  Your AI operating system that handles email, calendar, tasks
                  and decisions &mdash; so you can focus on what matters.
                </p>
                <p className="onb-subtext">
                  Let's get you set up in 2 minutes
                </p>
                <button className="onb-btn-primary" onClick={next} type="button">
                  Let's Go
                </button>
              </div>
            )}

            {/* Step 2: Connect Integrations */}
            {step === 1 && (
              <div className="onb-step">
                <h1 className="onb-heading">Connect your tools</h1>
                <p className="onb-body">
                  Link your Google Workspace so RelayOS can read your email,
                  calendar, and documents.
                </p>

                <div className="onb-integration-card">
                  <div className="onb-integration-left">
                    <div className="onb-integration-icon"><i className="fi fi-brands-google" /></div>
                    <div>
                      <div className="onb-integration-name">
                        Google Workspace
                      </div>
                      <div className="onb-integration-desc">
                        Gmail, Calendar, Drive, Docs
                      </div>
                    </div>
                  </div>
                  {googleConnected ? (
                    <div className="onb-connected-badge">
                      <span className="onb-check">&#10003;</span> Connected
                    </div>
                  ) : (
                    <button
                      className="onb-btn-google"
                      onClick={onConnectGoogle}
                      type="button"
                    >
                      Connect Google
                    </button>
                  )}
                </div>

                <div className="onb-actions">
                  <button className="onb-btn-primary" onClick={next} type="button">
                    {googleConnected ? "Continue" : "Next"}
                  </button>
                  {!googleConnected && (
                    <button
                      className="onb-btn-skip"
                      onClick={next}
                      type="button"
                    >
                      Skip for now
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Set Preferences */}
            {step === 2 && (
              <div className="onb-step">
                <h1 className="onb-heading">
                  How should RelayOS work for you?
                </h1>

                <label className="onb-label">Agent mode</label>
                <div className="onb-radio-group">
                  {agentModes.map((m) => (
                    <label
                      key={m.value}
                      className={`onb-radio-card${prefs.agentMode === m.value ? " onb-radio-card--selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="agentMode"
                        value={m.value}
                        checked={prefs.agentMode === m.value}
                        onChange={() =>
                          setPrefs({ ...prefs, agentMode: m.value })
                        }
                      />
                      <div>
                        <div className="onb-radio-title">{m.label}</div>
                        <div className="onb-radio-desc">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <label className="onb-label" style={{ marginTop: 24 }}>
                  When would you like your daily brief?
                </label>
                <input
                  type="time"
                  className="onb-time-input"
                  value={prefs.briefTime}
                  onChange={(e) =>
                    setPrefs({ ...prefs, briefTime: e.target.value })
                  }
                />

                <div className="onb-actions">
                  <button className="onb-btn-primary" onClick={next} type="button">
                    Continue
                  </button>
                  <button
                    className="onb-btn-skip"
                    onClick={next}
                    type="button"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Quick Tour */}
            {step === 3 && (
              <div className="onb-step">
                <h1 className="onb-heading">Here's what you can do</h1>
                <div className="onb-tour-grid">
                  {tourCards.map((c) => (
                    <div key={c.title} className="onb-tour-card">
                      <div className="onb-tour-icon"><i className={c.icon} /></div>
                      <div className="onb-tour-title">{c.title}</div>
                      <div className="onb-tour-desc">{c.desc}</div>
                    </div>
                  ))}
                </div>
                <button className="onb-btn-primary onb-btn-go" onClick={() => { onComplete(); navigate("/command"); }} type="button">
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* ---- layout ---- */
        .onb-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020202;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
        }

        .onb-card {
          max-width: 600px;
          width: 100%;
          background: rgba(14, 14, 14, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 48px 40px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          position: relative;
        }

        /* ---- dots ---- */
        .onb-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        .onb-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(236, 228, 183, 0.25);
          background: transparent;
          padding: 0;
          cursor: default;
          transition: all 0.3s;
        }
        .onb-dot--done {
          background: rgba(0, 167, 225, 0.5);
          border-color: rgba(0, 167, 225, 0.5);
          cursor: pointer;
        }
        .onb-dot--active {
          background: #00A7E1;
          border-color: #00A7E1;
          box-shadow: 0 0 8px rgba(0, 167, 225, 0.5);
        }

        /* ---- viewport / animation ---- */
        .onb-viewport {
          position: relative;
          overflow: hidden;
        }

        .onb-slide {
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .onb-slide--enter {
          transform: translateX(0);
          opacity: 1;
        }
        .onb-slide--exit-left {
          transform: translateX(-30px);
          opacity: 0;
        }
        .onb-slide--exit-right {
          transform: translateX(30px);
          opacity: 0;
        }

        /* ---- step content ---- */
        .onb-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .onb-welcome-icon {
          margin-bottom: 24px;
        }
        .onb-logo-mark {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #00A7E1, #DEC0F1);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 32px;
        }

        .onb-heading {
          font-size: 28px;
          font-weight: 800;
          color: #ECE4B7;
          margin: 0 0 12px;
          line-height: 1.2;
        }
        .onb-body {
          font-size: 15px;
          color: rgba(236, 228, 183, 0.6);
          line-height: 1.6;
          margin: 0 0 8px;
          max-width: 440px;
        }
        .onb-subtext {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.35);
          margin: 0 0 32px;
        }
        .onb-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: rgba(236, 228, 183, 0.8);
          margin-bottom: 12px;
          text-align: left;
          width: 100%;
        }

        /* ---- buttons ---- */
        .onb-btn-primary {
          padding: 14px 40px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          color: #020202;
          cursor: pointer;
          transition: all 0.2s;
        }
        .onb-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 167, 225, 0.35);
        }

        .onb-btn-skip {
          background: none;
          border: none;
          color: rgba(236, 228, 183, 0.4);
          font-size: 14px;
          cursor: pointer;
          padding: 8px 16px;
          transition: color 0.2s;
        }
        .onb-btn-skip:hover {
          color: rgba(236, 228, 183, 0.7);
        }

        .onb-btn-google {
          padding: 10px 20px;
          background: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .onb-btn-google:hover {
          background: #f0f0f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .onb-btn-go {
          margin-top: 8px;
        }

        .onb-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
          width: 100%;
        }

        /* ---- integration card ---- */
        .onb-integration-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px 24px;
          margin-top: 24px;
          gap: 16px;
        }
        .onb-integration-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .onb-integration-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }
        .onb-integration-name {
          font-size: 15px;
          font-weight: 600;
          color: #ECE4B7;
        }
        .onb-integration-desc {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.45);
          margin-top: 2px;
        }

        .onb-connected-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #34d399;
          white-space: nowrap;
        }
        .onb-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(52, 211, 153, 0.15);
          font-size: 13px;
        }

        /* ---- radio cards (preferences) ---- */
        .onb-radio-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .onb-radio-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .onb-radio-card:hover {
          border-color: rgba(0, 167, 225, 0.3);
          background: rgba(0, 167, 225, 0.04);
        }
        .onb-radio-card--selected {
          border-color: rgba(0, 167, 225, 0.5);
          background: rgba(0, 167, 225, 0.06);
        }
        .onb-radio-card input[type="radio"] {
          margin-top: 3px;
          accent-color: #00A7E1;
        }
        .onb-radio-title {
          font-size: 15px;
          font-weight: 600;
          color: #ECE4B7;
        }
        .onb-radio-desc {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          margin-top: 2px;
        }

        /* ---- time input ---- */
        .onb-time-input {
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 15px;
          color: #ECE4B7;
          background: rgba(255, 255, 255, 0.04);
          outline: none;
          width: 160px;
          transition: border-color 0.2s;
          color-scheme: dark;
        }
        .onb-time-input:focus {
          border-color: #00A7E1;
          box-shadow: 0 0 0 3px rgba(0, 167, 225, 0.1);
        }

        /* ---- tour grid ---- */
        .onb-tour-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 100%;
          margin-top: 20px;
        }
        .onb-tour-card {
          padding: 22px 18px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.03);
          text-align: left;
          transition: all 0.2s;
        }
        .onb-tour-card:hover {
          border-color: rgba(0, 167, 225, 0.2);
          background: rgba(0, 167, 225, 0.03);
          transform: translateY(-2px);
        }
        .onb-tour-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00A7E1, #DEC0F1);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .onb-tour-title {
          font-size: 15px;
          font-weight: 700;
          color: #ECE4B7;
          margin-bottom: 4px;
        }
        .onb-tour-desc {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          line-height: 1.5;
        }

        /* ---- responsive ---- */
        @media (max-width: 600px) {
          .onb-card {
            padding: 32px 20px 28px;
            border-radius: 16px;
          }
          .onb-heading {
            font-size: 22px;
          }
          .onb-tour-grid {
            grid-template-columns: 1fr;
          }
          .onb-integration-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
