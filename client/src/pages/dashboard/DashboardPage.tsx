import { Users, Building2, Briefcase, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ETIQUETAS_ROL } from '../../constants';
import type { RolUsuario } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';

export default function DashboardPage() {
  const { usuario } = useAuth();

  if (!usuario) return null;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo={`Hola, ${usuario.nombre}`}
        descripcion={`Estás conectado como ${ETIQUETAS_ROL[usuario.rol as RolUsuario]}`}
        migajas={[{ nombre: 'Dashboard' }]}
      />

      {/* TODO: conectar estos valores a la API en la entrega 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          titulo="Trabajadores"
          valor="-"
          icono={Users}
          descripcion="Total activos"
          colorIcono="text-blue-600"
          colorFondo="bg-blue-50"
        />
        <StatsCard
          titulo="Clientes"
          valor="-"
          icono={Building2}
          descripcion="Registrados"
          colorIcono="text-emerald-600"
          colorFondo="bg-emerald-50"
        />
        <StatsCard
          titulo="Proyectos activos"
          valor="-"
          icono={Briefcase}
          descripcion="En curso"
          colorIcono="text-amber-600"
          colorFondo="bg-amber-50"
        />
        <StatsCard
          titulo="Stock crítico"
          valor="-"
          icono={Package}
          descripcion="Alertas pendientes"
          colorIcono="text-red-600"
          colorFondo="bg-red-50"
        />
      </div>

      {/* aviso temporal mientras no hay datos reales */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">Sistema en construcción</p>
        <p className="text-blue-600 text-sm mt-1">
          Estamos trabajando para usted :)
        </p>
      </div>
    </div>
  );
}
