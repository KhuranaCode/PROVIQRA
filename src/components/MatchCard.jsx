import React from 'react';

export default function MatchCard({ 
  match, 
  onConnect, 
  onViewProfile,
  isAlreadyConnected,
  isPending
}) {
  const { candidate, score, reasons = [], gaps = [] } = match;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
      {/* Header with avatar, role, and score */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img 
            src={candidate.avatar} 
            alt={candidate.name}
            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-strong)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>{candidate.name}</h3>
              {candidate.verified && (
                <span title="Verified Identity" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>✓</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              {candidate.role} • {candidate.location}
            </div>
          </div>
        </div>

        {/* 100-pt Score badge */}
        <div className="badge badge-match" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          {score}% MATCH
        </div>
      </div>

      {/* Headline */}
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.4' }}>
        {candidate.headline}
      </p>

      {/* Score Progress Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Intent & Skill Compatibility</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text-primary)' }}>{score}/100</span>
        </div>
        <div className="score-bar-bg">
          <div className="score-bar-fill" style={{ width: `${score}%` }}></div>
        </div>
      </div>

      {/* Skills Pill list */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(candidate.skills || []).slice(0, 4).map((skill, idx) => (
          <span key={idx} className="badge badge-tag" style={{ fontSize: '0.73rem' }}>
            {skill.name} <span style={{ opacity: 0.7 }}>({skill.level})</span>
          </span>
        ))}
      </div>

      {/* Positive Match Reasons (Blueprint Page 2 & Page 7) */}
      <div style={{ 
        backgroundColor: 'var(--bg-surface-elevated)', 
        padding: '10px 12px', 
        borderRadius: 'var(--radius-md)', 
        fontSize: '0.8rem',
        borderLeft: '3px solid #10B981',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎯 Why this match:</span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {reasons.slice(0, 3).join(' • ')}
        </div>
        {gaps.length > 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
            ⚠️ {gaps[0]}
          </div>
        )}
      </div>

      {/* Proof of work indicator if available */}
      {candidate.proofOfWork && candidate.proofOfWork.length > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📦 Proof of work:</span>
          <a 
            href={candidate.proofOfWork[0].url} 
            target="_blank" 
            rel="noreferrer"
            style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontWeight: '600' }}
          >
            {candidate.proofOfWork[0].title}
          </a>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ flex: 1 }}
          onClick={() => onViewProfile(candidate)}
        >
          View Profile
        </button>

        {isAlreadyConnected ? (
          <button className="btn btn-outline" style={{ flex: 1 }} disabled>
            ✓ Connected
          </button>
        ) : isPending ? (
          <button className="btn btn-outline" style={{ flex: 1 }} disabled>
            ⏳ Request Sent
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ flex: 1 }}
            onClick={() => onConnect(candidate)}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
