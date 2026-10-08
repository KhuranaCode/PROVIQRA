import React, { useEffect } from 'react';

export default function Toast({ toasts = [], onDismiss }) {
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => {
      return setTimeout(() => {
        onDismiss?.(t.id);
      }, t.duration || 3500);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'error'
            ? '✕'
            : toast.type === 'warn'
            ? '⚠️'
            : toast.type === 'info'
            ? 'ℹ️'
            : '✓';

        return (
          <div key={toast.id} className={`toast-pill toast-${toast.type || 'success'}`}>
            <span className="toast-icon">{icon}</span>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss?.(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
