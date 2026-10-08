import React, { useState } from 'react';
import { ROLES, INTENT_TYPES, COMMITMENT_OPTIONS, REMOTE_OPTIONS } from '../../core/types.js';

export default function ProfileScreen({ currentUser, allUsers, onUpdateProfile, onSwitchUser }) {
  const [isEditingIntent, setIsEditingIntent] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);

  // Intent form state
  const [intentType, setIntentType] = useState(currentUser.intent?.type || INTENT_TYPES.FIND_COFOUNDER);
  const [roleNeeded, setRoleNeeded] = useState(currentUser.intent?.roleNeeded || '');
  const [industry, setIndustry] = useState(currentUser.intent?.industry || '');
  const [commitment, setCommitment] = useState(currentUser.intent?.commitment || 'Part-time');
  const [remote, setRemote] = useState(currentUser.intent?.remote || 'Remote only');
  const [compensation, setCompensation] = useState(currentUser.intent?.compensation || '');
  const [description, setDescription] = useState(currentUser.intent?.description || '');

  // Identity form state
  const [headline, setHeadline] = useState(currentUser.headline || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [experienceYears, setExperienceYears] = useState(currentUser.experienceYears || 0);

  const handleSaveIntent = (e) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      intent: {
        ...currentUser.intent,
        type: intentType,
        roleNeeded,
        industry,
        commitment,
        remote,
        compensation,
        description
      }
    });
    setIsEditingIntent(false);
  };

  const handleSaveIdentity = (e) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      headline,
      bio,
      location,
      experienceYears: Number(experienceYears)
    });
    setIsEditingIdentity(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      {/* Persona Switcher Quick Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1))',
        border: '1.5px solid var(--accent-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            ⚡ Interactive Persona Switcher
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Switch accounts instantly to experience both sides of the matchmaking loop (e.g. test sending, receiving, and accepting requests).
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {allUsers.map(u => (
            <button
              key={u.id}
              className={`btn ${u.id === currentUser.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              onClick={() => onSwitchUser(u.id)}
            >
              {u.name.split(' ')[0]} ({u.role})
            </button>
          ))}
        </div>
      </div>

      {/* Identity Card (Engine 1) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-strong)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </h2>
                {currentUser.verified && <span className="badge badge-match">✓ Verified</span>}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {currentUser.role} • {currentUser.location}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '2px' }}>
                {currentUser.collegeCompany}
              </div>
            </div>
          </div>

          <button 
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
            onClick={() => setIsEditingIdentity(!isEditingIdentity)}
          >
            {isEditingIdentity ? 'Cancel' : 'Edit Identity'}
          </button>
        </div>

        {isEditingIdentity ? (
          <form onSubmit={handleSaveIdentity} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input 
                type="text" 
                className="form-input" 
                value={headline} 
                onChange={(e) => setHeadline(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                type="text" 
                className="form-input" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input 
                type="number" 
                className="form-input" 
                value={experienceYears} 
                onChange={(e) => setExperienceYears(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              Save Identity Changes
            </button>
          </form>
        ) : (
          <>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.4' }}>
              {currentUser.headline}
            </p>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {currentUser.bio}
            </p>
          </>
        )}

        {/* Skills List */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Verified Skills & Proficiency
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(currentUser.skills || []).map((skill, idx) => (
              <span key={idx} className="badge badge-tag" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <strong>{skill.name}</strong> • {skill.level} ({skill.years} yrs)
              </span>
            ))}
          </div>
        </div>

        {/* Proof of Work Showcase */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Proof of Work (GitHub / Products / Research)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(currentUser.proofOfWork || []).map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-match">{item.type}</span>
                  <span style={{ fontWeight: '600' }}>{item.title}</span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontWeight: '600', fontSize: '0.8rem' }}
                >
                  View Link ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Intent Engine Card (Engine 2) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-tag" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.72rem' }}>
                Intent Engine
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>
              Current Active Professional Intent
            </h3>
          </div>

          <button 
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
            onClick={() => setIsEditingIntent(!isEditingIntent)}
          >
            {isEditingIntent ? 'Cancel' : 'Edit Intent'}
          </button>
        </div>

        {isEditingIntent ? (
          <form onSubmit={handleSaveIntent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Current Intent Type</label>
              <select className="form-select" value={intentType} onChange={(e) => setIntentType(e.target.value)}>
                {Object.values(INTENT_TYPES).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Role Needed</label>
              <input 
                type="text" 
                className="form-input" 
                value={roleNeeded} 
                onChange={(e) => setRoleNeeded(e.target.value)} 
                placeholder="e.g. Flutter & Backend Developer"
                required 
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)} 
                  placeholder="e.g. Fintech / Payments"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Commitment</label>
                <select className="form-select" value={commitment} onChange={(e) => setCommitment(e.target.value)}>
                  {COMMITMENT_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Remote Preference</label>
                <select className="form-select" value={remote} onChange={(e) => setRemote(e.target.value)}>
                  {REMOTE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Compensation / Equity Structure</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={compensation} 
                  onChange={(e) => setCompensation(e.target.value)} 
                  placeholder="e.g. Equity (10-25%) + Stipend" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Intent Description / Pitch</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              Update Active Intent
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span className="badge badge-match">{currentUser.intent?.type}</span>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '6px', color: 'var(--text-primary)' }}>
                  Seeking: {currentUser.intent?.roleNeeded}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>Industry: <strong>{currentUser.intent?.industry}</strong></div>
                <div>Commitment: <strong>{currentUser.intent?.commitment}</strong></div>
                <div>Remote: <strong>{currentUser.intent?.remote}</strong></div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              "{currentUser.intent?.description}"
            </p>

            {currentUser.intent?.compensation && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                💰 Compensation / Terms: <strong>{currentUser.intent.compensation}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
