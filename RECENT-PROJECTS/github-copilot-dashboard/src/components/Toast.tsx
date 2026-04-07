import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboard';

interface Toast {
    id: string;
    type: 'info' | 'error' | 'success';
    message: string;
}

let _addToast: (t: Omit<Toast, 'id'>) => void = () => { };
export const toast = {
    info: (message: string) => _addToast({ type: 'info', message }),
    error: (message: string) => _addToast({ type: 'error', message }),
    success: (message: string) => _addToast({ type: 'success', message }),
};

export function ToastProvider() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const { error } = useDashboardStore();

    _addToast = (t) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...t, id }]);
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
    };

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    if (!toasts.length) return null;

    return (
        <div className="toast-container" role="alert" aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.type === 'error' ? '⚠️' : t.type === 'success' ? '✓' : 'ℹ'}</span>
                    <span>{t.message}</span>
                    <button
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14 }}
                        onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                        aria-label="Dismiss notification"
                    >×</button>
                </div>
            ))}
        </div>
    );
}
