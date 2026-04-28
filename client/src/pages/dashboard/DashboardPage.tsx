import { Users, Building2, Briefcase, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ETIQUETAS_ROL } from '../../constants';
import type { RolUsuario } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import { useFetch } from '../../hooks/useFetch';

interface Stats {
  trabajadores: number;
  clientes: number;
  proyectosActivos: number;
  alertasStock: number;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const { datos: stats, cargando } = useFetch<Stats>('/dashboard');

  if (!usuario) return null;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo={`Hola, ${usuario.nombre}`}
        descripcion={`Conectado como ${ETIQUETAS_ROL[usuario.rol as RolUsuario]}`}
        migajas={[{ nombre: 'Dashboard' }]}
      />

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            titulo="Trabajadores"
            valor={stats?.trabajadores ?? '-'}
            icono={Users}
            descripcion="Total registrados"
            colorIcono="text-blue-600"
            colorFondo="bg-blue-50"
          />
          <StatsCard
            titulo="Clientes"
            valor={stats?.clientes ?? '-'}
            icono={Building2}
            descripcion="Registrados"
            colorIcono="text-emerald-600"
            colorFondo="bg-emerald-50"
          />
          <StatsCard
            titulo="Proyectos activos"
            valor={stats?.proyectosActivos ?? '-'}
            icono={Briefcase}
            descripcion="En curso"
            colorIcono="text-amber-600"
            colorFondo="bg-amber-50"
          />
          <StatsCard
            titulo="Stock critico"
            valor={stats?.alertasStock ?? '-'}
            icono={Package}
            descripcion="Alertas pendientes"
            colorIcono="text-red-600"
            colorFondo="bg-red-50"
          />
        </div>
      )}

      {/* aviso si hay productos bajo el minimo */}
      {stats && stats.alertasStock > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <Package size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Hay {stats.alertasStock} {stats.alertasStock === 1 ? 'producto' : 'productos'} con stock bajo el minimo
            </p>
            <p className="text-xs text-red-600 mt-0.5">Revisa la seccion de Inventario para ver el detalle</p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-700 font-medium text-sm">Bienvenido a CleanERP</p>
        <p className="text-gray-500 text-sm mt-1">
          Usa el menu lateral para navegar entre los modulos del sistema.
        </p>
      </div>
    </div>
  );
}
