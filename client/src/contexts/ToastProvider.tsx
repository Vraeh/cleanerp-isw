import { useState, useCallback } from 'react';
import { ToastContext, Toast } from './ToastContext';
import ToastContainer from '../components/ToastContainer';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((tipo: Toast['tipo'], mensaje: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const cerrarToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, mostrarToast, cerrarToast }}>
      {children}
      <ToastContainer toasts={toasts} onCerrar={cerrarToast} />
    </ToastContext.Provider>
  );
}
