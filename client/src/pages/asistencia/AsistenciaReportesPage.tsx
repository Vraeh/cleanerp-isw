import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface Instalacion { id: number; nombre: string; }
interface Registro {
  id: number; fecha: string; horaEntrada: string; horaSalida: string;
  estadoValidacion: string;
  trabajador?: { nombres: string; apellidos: string };
  instalacion?: { nombre: string };
}
interface Reporte { total: number; aprobados: number; rechazados: number; registros: Registro[]; }

export default function AsistenciaReportesPage() {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [filtros, setFiltros] = useState({ instalacionId: '', desde: '', hasta: '' });
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/instalaciones-todas').then(r => setInstalaciones(r.data)).catch(() => {});
  }, []);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.instalacionId) params.set('instalacionId', filtros.instalacionId);
      if (filtros.desde) params.set('desde', filtros.desde);
      if (filtros.hasta) params.set('hasta', filtros.hasta);
      const res = await api.get(`/asistencia/reportes?${params.toString()}`);
      setReporte(res.data);
    } catch { toast.error('Error al generar reporte'); }
    finally { setCargando(false); }
  }

  const colorEstado: Record<string, string> = {
    aprobado: 'bg-green-100 text-green-800',
    token_invalido: 'bg-orange-100 text-orange-800',
    token_expirado: 'bg-red-100 text-red-800',
    ausente: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Reportes de Asistencia"
        descripcion="Consulta el historial de asistencia con filtros de fecha e instalacion"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Asistencia' }, { nombre: 'Reportes' }]}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <form onSubmit={buscar} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Instalacion</label>
            <select value={filtros.instalacionId} onChange={e => setFiltros({ ...filtros, instalacionId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas</option>
              {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={cargando}
            className="py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
            <BarChart3 size={15} /> {cargando ? 'Generando...' : 'Generar reporte'}
          </button>
        </form>
      </div>

      {reporte && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{reporte.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total registros</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{reporte.aprobados}</p>
              <p className="text-xs text-gray-500 mt-1">Aprobados</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{reporte.rechazados}</p>
              <p className="text-xs text-gray-500 mt-1">Con problemas</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Trabajador</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Instalacion</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Entrada</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Salida</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporte.registros.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-600">{r.fecha}</td>
                    <td className="px-5 py-3">{r.trabajador ? `${r.trabajador.apellidos}, ${r.trabajador.nombres}` : '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{r.instalacion?.nombre || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{r.horaEntrada || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{r.horaSalida || '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge texto={r.estadoValidacion.replace('_', ' ')} estilo={colorEstado[r.estadoValidacion] || 'bg-gray-100 text-gray-500'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
