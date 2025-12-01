export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: { label: string; onClick: () => void };
}

// Simple toast store using module-level state
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export function showToast(
  message: string,
  type: ToastMessage['type'] = 'info',
  action?: ToastMessage['action']
) {
  const id = Date.now().toString();
  toasts = [...toasts, { id, message, type, action }];
  toastListeners.forEach((listener) => listener(toasts));

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(toasts));
  }, 3000);
}

export function subscribeToToasts(listener: (toasts: ToastMessage[]) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  toastListeners.forEach((listener) => listener(toasts));
}
