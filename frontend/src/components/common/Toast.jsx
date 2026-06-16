import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const COLORS = {
  success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info:    (msg, dur) => show(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '360px', width: 'calc(100vw - 40px)',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '14px 16px', borderRadius: '10px',
              background: c.bg, border: `1px solid ${c.border}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              animation: 'slideIn 0.25s ease',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{ICONS[t.type]}</span>
              <span style={{ fontSize: '14px', color: c.text, lineHeight: '1.5', flex: 1 }}>
                {t.message}
              </span>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: c.text, opacity: 0.6, fontSize: '16px', lineHeight: 1, padding: 0 }}
              >×</button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </ToastContext.Provider>
  );
};
