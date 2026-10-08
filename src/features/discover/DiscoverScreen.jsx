import React, { useState } from 'react';
import { ROLES, OPPORTUNITY_TYPES } from '../../core/types.js';

export default function DiscoverScreen({ 
  allUsers = [], 
  opportunities = [], 
  currentUser,
  onConnect,
  onViewProfile 
}) {
  const [activeView, setActiveView] = useState('people'); // 'people' or 'opportunities'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Filter People
  const filteredUsers = allUsers.filter(u => {
    if (u.id === currentUser.id) return false;
    
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchHeadline = u.headline.toLowerCase().includes(q);
      const matchSkills = (u.skills || []).some(s => s.name.toLowerCase().includes(q));
      if (!matchName && !matchRole && !matchHeadline && !matchSkills) return false;
    }

    // Role filter
    if (selectedRole !== 'All' && u.role !== selectedRole) return false;

    // Commitment filter
    if (selectedCommitment !== 'All' && u.intent?.commitment !== selectedCommitment) return false;

    // Remote only
    if (remoteOnly && !u.remotePreference?.toLowerCase().includes('remote') && u.remotePreference !== 'Any') {
      return false;
    }

    return true;
  });

  // Filter Opportunities
  const filteredOpps = opportunities.filter(opp => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchOrg = opp.organization.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Discover Directory
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Explore verified professionals, founders, investors, and opportunities
          </p>
        </div>

        {/* View Switcher pills */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
          <button
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeView === 'people' ? 'var(--accent-primary)' : 'transparent',
              color: activeView === 'people' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveView('people')}
          >
            People ({filteredUsers.length})
          </button>
          <button
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              background: activeView === 'opportunities' ? 'var(--accent-primary)' : 'transparent',
              color: activeView === 'opportunities' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveView('opportunities')}
          >
            Opportunities ({filteredOpps.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search by skill, role, company or name (e.g. Flutter, Fintech, Investor)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeView === 'people' && (
            <>
              <select 
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                {Object.values(ROLES).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select 
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedCommitment}
                onChange={(e) => setSelectedCommitment(e.target.value)}
              >
                <option value="All">All Commitments</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Project-based">Project-based</option>
                <option value="Flexible / Advisory">Flexible / Advisory</option>
              </select>

              <button 
                type="button"
                className={`btn ${remoteOnly ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem' }}
                onClick={() => setRemoteOnly(!remoteOnly)}
              >
                🌍 Remote Only
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Section */}
      {activeView === 'people' ? (
        filteredUsers.length === 0 ? (
          <div className="empty-state-box" style={{ margin: '20px 0' }}>
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">No Profiles Match Your Filters</h3>
            <p className="empty-state-desc">
              We couldn't find professionals matching "{searchTerm || selectedRole}". Try clearing your search query or role filter.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('All');
                setSelectedCommitment('All');
                setRemoteOnly(false);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-strong)' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {user.name} {user.verified && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {user.role} • {user.location}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {user.headline}
                </p>

                {/* Intent summary */}
                {user.intent && (
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--bg-surface-elevated)', 
                    fontSize: '0.78rem',
                    borderLeft: '3px solid var(--accent-primary)'
                  }}>
                    <strong>Active Intent:</strong> {user.intent.type} • Seeking: {user.intent.roleNeeded} ({user.intent.commitment})
                  </div>
                )}

                {/* Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(user.skills || []).map((s, idx) => (
                    <span key={idx} className="badge badge-tag" style={{ fontSize: '0.72rem' }}>
                      {s.name}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => onViewProfile(user)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => onConnect(user)}
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Opportunities View */
        filteredOpps.length === 0 ? (
          <div className="empty-state-box" style={{ margin: '20px 0' }}>
            <div className="empty-state-icon">💼</div>
            <h3 className="empty-state-title">No Opportunities Found</h3>
            <p className="empty-state-desc">
              No active listings match your search keyword "{searchTerm}".
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filteredOpps.map((opp) => (
              <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-tag">{opp.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opp.createdAt}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {opp.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {opp.organization} • {opp.location}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {opp.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(opp.skills || []).map((skill, idx) => (
                    <span key={idx} className="badge badge-tag" style={{ fontSize: '0.72rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compensation</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{opp.compensation}</div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ fontSize: '0.82rem' }}
                    onClick={() => {
                      const creator = allUsers.find(u => u.id === opp.createdBy);
                      if (creator) onConnect(creator);
                    }}
                  >
                    Apply / Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
