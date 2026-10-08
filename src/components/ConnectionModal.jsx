import React, { useState, useEffect } from 'react';
import { CONNECTION_PURPOSES } from '../core/types.js';

export default function ConnectionModal({ candidate, onClose, onSend }) {
  const [purpose, setPurpose] = useState(CONNECTION_PURPOSES[0]);
  const [message, setMessage] = useState(
    `Hi ${candidate.name}, I came across your profile and noticed our intent matches. I'd love to connect regarding ${CONNECTION_PURPOSES[0].toLowerCase()}.`
  );

  const handlePurposeChange = (e) => {
    const newPurpose = e.target.value;
    setPurpose(newPurpose);
    setMessage(`Hi ${candidate.name}, I saw our complementary intent and would love to connect for ${newPurpose.toLowerCase()}.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend({
      receiverId: candidate.id,
      purpose,
      message
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-conn-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-conn-title">Connect with {candidate.name}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <img 
                src={candidate.avatar} 
                alt={candidate.name}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{candidate.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.headline}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose of Connection (Required)</label>
              <div className="form-hint" style={{ marginBottom: '6px' }}>
                Every request must specify clear professional intent to preserve network signal.
              </div>
              <select 
                className="form-select"
                value={purpose}
                onChange={handlePurposeChange}
              >
                {CONNECTION_PURPOSES.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contextual Message</label>
              <div className="form-hint" style={{ marginBottom: '6px' }}>
                Explain why your skills or intent complement each other.
              </div>
              <textarea 
                className="form-textarea"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
              🔒 <strong>Privacy Rule:</strong> Direct chat is only unlocked once {candidate.name} mutually accepts your request.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Connection Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
