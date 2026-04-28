import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
}

export default function Modal({ titulo, onCerrar, children, ancho = 'md' }: Props) {
  // cerrar con Escape
  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [onCerrar]);

  const anchos = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />

      {/* contenido */}
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${anchos[ancho]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
