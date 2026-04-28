import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, MapPin, Building2, Briefcase,
  ClipboardList, Key, UserCheck, BarChart2, Package, Boxes, Tag,
  ArrowLeftRight, ShoppingCart, Wrench, TrendingDown, X, Stethoscope,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SECCIONES_NAV } from '../constants';

// devuelve el icono correspondiente al string que viene del constants
function getIcono(nombre: string): LucideIcon {
  const iconos: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    FileText,
    MapPin,
    Building2,
    Briefcase,
    ClipboardList,
    Key,
    UserCheck,
    BarChart2,
    Package,
    Boxes,
    Tag,
    ArrowLeftRight,
    ShoppingCart,
    Wrench,
    TrendingDown,
    Stethoscope,
  };
  return iconos[nombre] ?? LayoutDashboard;
}

interface Props {
  onCerrar: () => void;
}

export default function Sidebar({ onCerrar }: Props) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return null;

  const seccionesFiltradas = SECCIONES_NAV
    .map((seccion) => ({
      ...seccion,
      items: seccion.items.filter((item) => item.roles.includes(usuario.rol)),
    }))
    .filter((seccion) => seccion.items.length > 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1F4E79' }}>
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">CleanERP</h1>
          <p className="text-blue-200 text-xs mt-0.5">Sistema de Gestión</p>
        </div>
        <button onClick={onCerrar} className="md:hidden text-blue-200 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {seccionesFiltradas.map((seccion) => (
          <div key={seccion.titulo} className="mb-5">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
              {seccion.titulo}
            </p>
            <ul className="space-y-0.5">
              {seccion.items.map((item) => {
                const Icono = getIcono(item.icono);
                const activo =
                  item.ruta === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.ruta);

                return (
                  <li key={item.ruta}>
                    <Link
                      to={item.ruta}
                      onClick={onCerrar}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activo
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icono size={16} />
                      {item.nombre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-white/10">
        <p className="text-blue-300 text-xs">v0.1.0</p>
      </div>
    </div>
  );
}
