'use client';

import React, { useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

let toastCounter = 0;
const toasts: Toast[] = [];
let setToastsCallback: ((toasts: Toast[]) => void) | null = null;

export function toast(message: string, type: Toast['type'] = 'info', duration = 4000) {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, type, message, duration };
  toasts.push(newToast);
  setToastsCallback?.(toasts.slice());

  if (duration > 0) {
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        setToastsCallback?.(toasts.slice());
      }
    }, duration);
  }
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  setToastsCallback = useCallback((newToasts: Toast[]) => {
    setCurrentToasts(newToasts);
  }, []);

  const removeToast = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      setCurrentToasts(toasts.slice());
    }
  };

  const getToastClasses = (type: Toast['type']) => {
    const base = 'rounded-lg p-4 shadow-lg border max-w-sm';
    const variants = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return `${base} ${variants[type]}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div key={toast.id} className={getToastClasses(toast.type)}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-current hover:opacity-70">
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
