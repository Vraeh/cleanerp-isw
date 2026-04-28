import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '../contexts/ToastContext';

const ICONOS = {
  exito: CheckCircle,
  error: XCircle,
  info: Info,
  advertencia: AlertTriangle,
};

const ESTILOS = {
  exito: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  advertencia: 'bg-amber-50 border-amber-200 text-amber-800',
};

interface Props {
  toasts: Toast[];
  onCerrar: (id: string) => void;
}

export default function ToastContainer({ toasts, onCerrar }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 animate-slideInRight">
      {toasts.map((toast) => {
        const Icono = ICONOS[toast.tipo];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-md min-w-64 max-w-sm ${ESTILOS[toast.tipo]}`}
          >
            <Icono size={18} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm flex-1">{toast.mensaje}</p>
            <button onClick={() => onCerrar(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
