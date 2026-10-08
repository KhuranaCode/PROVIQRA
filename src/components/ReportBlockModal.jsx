import React, { useState, useEffect } from 'react';

export default function ReportBlockModal({ user, mode = 'report', onClose, onSubmit }) {
  const [reason, setReason] = useState('Inappropriate behavior or spam');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = (e) => {
    e.preventDefault();
    onSubmit({
      userId: user.id,
      mode,
      reason,
      details
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-report-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-report-title" style={{ color: mode === 'block' ? '#EF4444' : 'var(--text-primary)' }}>
            {mode === 'block' ? `Block ${user.name}?` : `Report ${user.name}`}
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleAction}>
          <div className="modal-body">
            {mode === 'block' ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Blocking <strong>{user.name}</strong> will remove them from your matches, hide your profile from them, and immediately stop any messaging.
              </p>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Help keep the professional network safe and high-signal. Reports are reviewed promptly.
              </p>
            )}

            <div className="form-group">
              <label className="form-label">Reason</label>
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="Inappropriate behavior or spam">Inappropriate behavior or spam</option>
                <option value="Misleading profile or fake experience">Misleading profile or fake experience</option>
                <option value="Aggressive sales pitching / unsolicited ads">Aggressive sales pitching / unsolicited ads</option>
                <option value="Other violation of community guidelines">Other violation of community guidelines</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                placeholder="Please describe what happened..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${mode === 'block' ? 'btn-danger' : 'btn-primary'}`}
            >
              {mode === 'block' ? 'Confirm Block' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
