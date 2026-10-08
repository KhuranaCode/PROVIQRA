import React, { useState } from 'react';
import { executeNaturalLanguageSearch } from '../../engines/askEngine.js';

const EXAMPLE_PROMPTS = [
  "Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time",
  "Looking for an angel investor writing checks for fintech startups",
  "Need a senior UI/UX designer for mobile app design system sprint",
  "Find a recruiter or talent lead hiring founding engineers"
];

export default function AskScreen({ currentUser, allUsers, onConnect, onViewProfile }) {
  const [query, setQuery] = useState('Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time');
  const [searchResults, setSearchResults] = useState(() => 
    executeNaturalLanguageSearch('Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time', currentUser, allUsers)
  );

  const handleSearch = (text) => {
    const q = text !== undefined ? text : query;
    if (!q.trim()) return;
    const res = executeNaturalLanguageSearch(q, currentUser, allUsers);
    setSearchResults(res);
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    handleSearch(example);
  };

  const { parsed, results = [] } = searchResults || {};
  const { criteria = {} } = parsed || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-tag" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.72rem' }}>
            Natural-Language Ask Engine
          </span>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          "Who are you looking for?"
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Describe who you need in natural English. Proviqra parses structured constraints (Role, Skills, Commitment, Location, Intent), applies hard filters, and ranks the best candidates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Type your need: e.g. Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: '0.95rem' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Example prompt pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Try:</span>
            {EXAMPLE_PROMPTS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
                onClick={() => handleExampleClick(ex)}
              >
                {ex.length > 36 ? ex.slice(0, 36) + '...' : ex}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-primary"
            style={{ padding: '8px 24px' }}
            onClick={() => handleSearch()}
          >
            ⚡ Parse & Match
          </button>
        </div>
      </div>

      {/* Parsed Criteria Breakdown Bar */}
      {criteria && (
        <div style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            <span>🧠 Extracted Structured Constraints:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {criteria.role && (
              <span className="badge badge-match">Target Role: {criteria.role}</span>
            )}
            {criteria.skills && criteria.skills.length > 0 && (
              <span className="badge badge-match">Required Skills: {criteria.skills.map(s => s.toUpperCase()).join(', ')}</span>
            )}
            {criteria.location && (
              <span className="badge badge-tag">Location: {criteria.location.toUpperCase()}</span>
            )}
            {criteria.commitment && (
              <span className="badge badge-tag">Commitment: {criteria.commitment}</span>
            )}
            {criteria.industry && (
              <span className="badge badge-tag">Industry: {criteria.industry}</span>
            )}
            {criteria.isCoFounderIntent && (
              <span className="badge badge-warn">Intent: Co-founder / Early-stage</span>
            )}
          </div>
        </div>
      )}

      {/* Ranked Search Results */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)' }}>
          Ranked Candidates ({results.length})
        </h2>

        <div className="grid-2">
          {results.map(({ candidate, score, matchedCriteria, explanation }) => (
            <div key={candidate.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img 
                    src={candidate.avatar} 
                    alt={candidate.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                      {candidate.name} {candidate.verified && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {candidate.role} • {candidate.location}
                    </div>
                  </div>
                </div>

                <span className="badge badge-match">{score}% FIT</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {candidate.headline}
              </p>

              {/* Matched Criteria Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {matchedCriteria.map((c, idx) => (
                  <span key={idx} className="badge badge-tag" style={{ fontSize: '0.72rem' }}>
                    ✓ {c}
                  </span>
                ))}
              </div>

              {/* AI Explanation Box */}
              <div style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                borderLeft: '3px solid var(--accent-primary)',
                color: 'var(--text-secondary)'
              }}>
                <strong>Why this match:</strong> {explanation}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, fontSize: '0.82rem' }}
                  onClick={() => onViewProfile(candidate)}
                >
                  Inspect Profile
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, fontSize: '0.82rem' }}
                  onClick={() => onConnect(candidate)}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
