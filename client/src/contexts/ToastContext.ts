import { createContext, useContext } from 'react';

export interface Toast {
  id: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  mensaje: string;
}

export interface ToastContextType {
  toasts: Toast[];
  mostrarToast: (tipo: Toast['tipo'], mensaje: string) => void;
  cerrarToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext debe usarse dentro de ToastProvider');
  return ctx;
}
