import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ETIQUETAS_ROL } from '../constants';
import type { RolUsuario } from '../types';

interface Props {
  onAbrirMenu: () => void;
}

export default function Header({ onAbrirMenu }: Props) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onAbrirMenu}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-gray-700 text-sm font-medium hidden sm:block">
          Bienvenidx a CleanERP
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {usuario && (
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-full p-1.5">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{usuario.nombre}</p>
              <p className="text-xs text-gray-500">
                {ETIQUETAS_ROL[usuario.rol as RolUsuario]}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
