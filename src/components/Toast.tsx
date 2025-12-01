import { useState, useEffect } from 'react';
import { subscribeToToasts, dismissToast, type ToastMessage } from './toastStore';
import './Toast.css';

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToToasts(setCurrentToasts);
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="toast-container">
      {currentToasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          {toast.action && (
            <button
              className="toast-action"
              onClick={() => {
                toast.action?.onClick();
                dismissToast(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
