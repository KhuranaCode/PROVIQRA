import React, { useState, useMemo } from 'react';
import DashboardRadar3D from './DashboardRadar3D.jsx';
import DashboardMatchCard from './DashboardMatchCard.jsx';
import { calculateMatchScore } from '../../engines/matchingEngine.js';
import './dashboard.css';

export default function HomeScreen({
  currentUser,
  allUsers,
  connections,
  opportunities,
  onNavigateTab,
  onConnect,
  onViewProfile,
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // Compute 100-pt match scores against all other active users
  const allMatches = useMemo(() => {
    return (allUsers || [])
      .filter((u) => u.id !== currentUser.id)
      .map((candidate) => calculateMatchScore(currentUser, candidate))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  }, [allUsers, currentUser]);

  // Pending incoming requests for current user
  const pendingIncoming = connections.filter(
    (c) => c.receiverId === currentUser.id && c.status === 'pending'
  );

  // Filter matches based on user's active filter pill
  const filteredMatches = useMemo(() => {
    if (selectedFilter === 'high') {
      return allMatches.filter((m) => m.score >= 80);
    }
    if (selectedFilter === 'cofounder') {
      return allMatches.filter(
        (m) =>
          m.candidate.role === 'Founder' ||
          (m.candidate.intent?.type || '').toLowerCase().includes('co-founder')
      );
    }
    if (selectedFilter === 'tech') {
      return allMatches.filter(
        (m) => m.candidate.role === 'Developer' || m.candidate.role === 'Designer'
      );
    }
    if (selectedFilter === 'investor') {
      return allMatches.filter((m) => m.candidate.role === 'Investor');
    }
    return allMatches;
  }, [allMatches, selectedFilter]);

  // Average compatibility score
  const avgScore = useMemo(() => {
    if (!allMatches.length) return 0;
    const sum = allMatches.reduce((acc, m) => acc + m.score, 0);
    return Math.round(sum / allMatches.length);
  }, [allMatches]);

  const verifiedCount = useMemo(() => {
    return allMatches.filter((m) => m.candidate.verified).length;
  }, [allMatches]);

  return (
    <div className="dash-layout">
      {/* 3D Interactive Hero Widget */}
      <section className="dash-hero-3d">
        <div className="dash-hero-copy">
          <div className="dash-hero-badge-row">
            <span className="dash-pill-active">
              <span className="dash-pill-dot" />
              Active Intent Field
            </span>
            <span className="dash-persona-info">
              Logged in as <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>

          <h1 className="dash-hero-title">
            Who is your <em>next milestone</em> looking for?
          </h1>

          <p className="dash-hero-lead">
            Proviqra bypasses follower vanity. We map your active goals directly against verified
            talent, founders, and investors using transparent 100-point synergy scoring.
          </p>

          <div className="dash-hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateTab('ask')}
              id="dash-ask-btn"
            >
              <span>💬 Natural-Language Matcher</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigateTab('profile')}
              id="dash-intent-btn"
            >
              <span>⚙️ Tune Active Intent</span>
            </button>
          </div>
        </div>

        {/* 3D Canvas Radar Widget */}
        <DashboardRadar3D
          currentUser={currentUser}
          topMatches={allMatches}
          selectedId={selectedCandidateId}
          onSelectCandidate={(id) => setSelectedCandidateId(id)}
        />
      </section>

      {/* Pending Requests Alert (if any) */}
      {pendingIncoming.length > 0 && (
        <div className="dash-inbound-banner">
          <div className="dash-inbound-left">
            <span className="dash-inbound-beacon" />
            <div>
              <div className="dash-inbound-title">
                {pendingIncoming.length} Inbound Connection Request{pendingIncoming.length > 1 ? 's' : ''}
              </div>
              <div className="dash-inbound-sub">
                Review sender purpose and synergy in your Messages tab.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigateTab('messages')}
            id="dash-review-requests"
          >
            Review Intros →
          </button>
        </div>
      )}

      {/* Minimalist Stats Strip */}
      <section className="dash-stats-strip">
        <div className="dash-stat-card">
          <span className="dash-stat-label">Synergy Baseline</span>
          <div className="dash-stat-val-row">
            <span className="dash-stat-num">{avgScore}%</span>
            <span className="dash-stat-sub">avg match</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Network Discovered</span>
          <div className="dash-stat-val-row">
            <span className="dash-stat-num">{allMatches.length}</span>
            <span className="dash-stat-sub">active profiles</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Verified Depth</span>
          <div className="dash-stat-val-row">
            <span className="dash-stat-num">{verifiedCount}</span>
            <span className="dash-stat-sub">proof-of-work</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Pending Inbound</span>
          <div className="dash-stat-val-row">
            <span className="dash-stat-num">{pendingIncoming.length}</span>
            <span className="dash-stat-sub">intros waiting</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Title */}
      <section className="dash-filter-section">
        <div className="dash-filter-title-group">
          <h2>Curated Matches for Your Intent</h2>
          <p>Scored transparently across skills, intent, commitment, and proof of work.</p>
        </div>

        <div className="dash-filter-pills">
          <button
            type="button"
            className={`dash-filter-btn ${selectedFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('all')}
            id="filter-all"
          >
            All Matches ({allMatches.length})
          </button>
          <button
            type="button"
            className={`dash-filter-btn ${selectedFilter === 'high' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('high')}
            id="filter-high"
          >
            High Fit (80%+)
          </button>
          <button
            type="button"
            className={`dash-filter-btn ${selectedFilter === 'cofounder' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('cofounder')}
            id="filter-cofounder"
          >
            Co-founders
          </button>
          <button
            type="button"
            className={`dash-filter-btn ${selectedFilter === 'tech' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('tech')}
            id="filter-tech"
          >
            Tech & Product
          </button>
          <button
            type="button"
            className={`dash-filter-btn ${selectedFilter === 'investor' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('investor')}
            id="filter-investor"
          >
            Investors
          </button>
        </div>
      </section>

      {/* 3D Tilt Match Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="empty-state-box" style={{ margin: '20px 0' }}>
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No Profiles Match "{selectedFilter}"</h3>
          <p className="empty-state-desc">
            We couldn't find active peers matching the selected filter category with your current profile intent.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedFilter('all')}
          >
            Reset to All Synergy Matches
          </button>
        </div>
      ) : (
        <section className="dash-match-grid">
          {filteredMatches.map((match) => {
            const existingConn = connections.find(
              (c) =>
                (c.senderId === currentUser.id && c.receiverId === match.candidateId) ||
                (c.receiverId === currentUser.id && c.senderId === match.candidateId)
            );
            const isPending = existingConn?.status === 'pending';
            const isAlreadyConnected = existingConn?.status === 'accepted';
            const isSelected = selectedCandidateId === match.candidateId;

            return (
              <DashboardMatchCard
                key={match.candidateId}
                match={match}
                isAlreadyConnected={isAlreadyConnected}
                isPending={isPending}
                isSelected={isSelected}
                onConnect={onConnect}
                onViewProfile={onViewProfile}
              />
            );
          })}
        </section>
      )}

      {/* Active Opportunities Section */}
      <section style={{ marginTop: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Active Opportunities & Sprints
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Co-founder equity stakes, pre-seed rounds, and engineering sprints.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            onClick={() => onNavigateTab('discover')}
            id="dash-browse-opps"
          >
            Browse All Opportunities →
          </button>
        </div>

        <div className="dash-match-grid">
          {(opportunities || []).slice(0, 2).map((opp) => (
            <div
              key={opp.id}
              className="dash-card-tilt"
              style={{ minHeight: 'auto' }}
            >
              <div className="dash-card-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className="dash-role-pill"
                      style={{ marginBottom: '8px', display: 'inline-block' }}
                    >
                      {opp.type}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {opp.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opp.organization} • {opp.location}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {opp.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    💰 {opp.compensation}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {opp.commitment}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
