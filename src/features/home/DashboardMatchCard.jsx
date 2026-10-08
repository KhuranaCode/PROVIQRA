import React, { useRef, useState } from 'react';

export default function DashboardMatchCard({
  match,
  isAlreadyConnected,
  isPending,
  isSelected,
  onConnect,
  onViewProfile,
}) {
  const { candidate, score, reasons = [], gaps = [], breakdown } = match;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const cardRef = useRef(null);

  const onMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const onMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={cardRef}
      className={`dash-card-tilt ${isSelected ? 'is-spotlight' : ''}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="dash-card-inner">
        {/* Card Header */}
        <div className="dash-card-header">
          <div className="dash-user-meta">
            <div className="dash-avatar-wrapper">
              <img src={candidate.avatar} alt={candidate.name} className="dash-avatar" />
              {candidate.verified && <span className="dash-verified-dot" title="Verified Intent" />}
            </div>
            <div>
              <div className="dash-name-row">
                <h3 className="dash-user-name">{candidate.name}</h3>
                <span className="dash-role-pill">{candidate.role}</span>
              </div>
              <div className="dash-subtext">
                {candidate.location} • {candidate.collegeCompany || 'Active'}
              </div>
            </div>
          </div>

          <div className="dash-score-badge">
            <div className="dash-score-ring">
              <b>{score}</b>
              <small>%</small>
            </div>
          </div>
        </div>

        {/* Headline */}
        <p className="dash-headline">{candidate.headline}</p>

        {/* Primary Synergy Callout */}
        <div className="dash-synergy-box">
          <div className="dash-synergy-title">
            <span className="dash-sparkle-icon">✦</span>
            <span>Why You Fit:</span>
          </div>
          <div className="dash-synergy-reasons">
            {reasons.slice(0, 2).map((r, i) => (
              <span key={i} className="dash-reason-pill">
                {r}
              </span>
            ))}
          </div>
          {gaps.length > 0 && <div className="dash-gap-note">Note: {gaps[0]}</div>}
        </div>

        {/* Top Skills */}
        <div className="dash-skills-row">
          {(candidate.skills || []).slice(0, 3).map((skill, idx) => (
            <span key={idx} className="dash-skill-tag">
              {skill.name}
            </span>
          ))}
          {(candidate.skills || []).length > 3 && (
            <span className="dash-skill-more">+{candidate.skills.length - 3}</span>
          )}
        </div>

        {/* Breakdown Accordion Toggle */}
        {breakdown && (
          <div className="dash-breakdown-wrapper">
            <button
              type="button"
              className="dash-breakdown-toggle"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <span>{showBreakdown ? 'Hide Algorithm Scoring' : 'View 100-pt Breakdown'}</span>
              <span className={`dash-arrow-icon ${showBreakdown ? 'is-open' : ''}`}>▾</span>
            </button>

            {showBreakdown && (
              <div className="dash-breakdown-grid">
                <div className="dash-factor-item">
                  <span>Skills</span>
                  <b>{breakdown.skills}/35</b>
                </div>
                <div className="dash-factor-item">
                  <span>Intent</span>
                  <b>{breakdown.intent}/25</b>
                </div>
                <div className="dash-factor-item">
                  <span>Commitment</span>
                  <b>{breakdown.commitment}/15</b>
                </div>
                <div className="dash-factor-item">
                  <span>Industry</span>
                  <b>{breakdown.industry}/10</b>
                </div>
                <div className="dash-factor-item">
                  <span>Location</span>
                  <b>{breakdown.location}/5</b>
                </div>
                <div className="dash-factor-item">
                  <span>Experience</span>
                  <b>{breakdown.experience}/5</b>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="dash-card-actions">
          <button
            type="button"
            className="dash-btn dash-btn-ghost"
            onClick={() => onViewProfile(candidate)}
          >
            Profile
          </button>

          {isAlreadyConnected ? (
            <button type="button" className="dash-btn dash-btn-connected" disabled>
              ✓ Connected
            </button>
          ) : isPending ? (
            <button type="button" className="dash-btn dash-btn-pending" disabled>
              ⏳ Request Sent
            </button>
          ) : (
            <button
              type="button"
              className="dash-btn dash-btn-primary"
              onClick={() => onConnect(candidate)}
            >
              Connect with Intent →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
