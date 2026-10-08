import React, { useState, useEffect } from 'react';
import { OUTCOME_TYPES } from '../core/types.js';

export default function OutcomeModal({ partner, onClose, onLogOutcome }) {
  const [selectedType, setSelectedType] = useState(OUTCOME_TYPES[0].id);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const outcomeObj = OUTCOME_TYPES.find(o => o.id === selectedType);
    onLogOutcome({
      outcomeType: selectedType,
      title: outcomeObj.label,
      points: outcomeObj.points,
      partnerId: partner.id,
      partnerName: partner.name,
      notes,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-outcome-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-outcome-title">Record Professional Outcome</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Did connecting with <strong>{partner.name}</strong> lead to a real-world result? 
              Recording outcomes trains the matching ranking and feeds our North Star metric.
            </p>

            <div className="form-group">
              <label className="form-label">What happened?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {OUTCOME_TYPES.map((type) => (
                  <label 
                    key={type.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${selectedType === type.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                      backgroundColor: selectedType === type.id ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="outcomeType"
                      checked={selectedType === type.id}
                      onChange={() => setSelectedType(type.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {type.label}
                      </div>
                    </div>
                    <span className="badge badge-match">+{type.points} pts</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Brief Notes (Optional)</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Scheduled demo call for Friday 3 PM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Successful Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
