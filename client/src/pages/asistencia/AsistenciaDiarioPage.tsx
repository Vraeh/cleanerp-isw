import { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface Instalacion { id: number; nombre: string; }
interface Registro {
  id: number; fecha: string; horaEntrada: string; horaSalida: string;
  estadoValidacion: string;
  trabajador?: { nombres: string; apellidos: string; rut: string };
}

export default function AsistenciaDiarioPage() {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [instalacionSel, setInstalacionSel] = useState<number | ''>('');
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(false);
  const toast = useToast();

  const hoy = new Date().toISOString().split('T')[0];
  const aprobados = registros.filter(r => r.estadoValidacion === 'aprobado').length;
  const rechazados = registros.filter(r => r.estadoValidacion !== 'aprobado').length;

  async function cargarInstalaciones() {
    try {
      const res = await api.get('/instalaciones-todas');
      setInstalaciones(res.data);
    } catch { toast.error('Error al cargar instalaciones'); }
  }

  async function cargarRegistros(id: number) {
    setCargando(true);
    try {
      const res = await api.get(`/asistencia/registros/${id}`);
      const deHoy = res.data.filter((r: Registro) => r.fecha === hoy);
      setRegistros(deHoy);
    } catch { toast.error('Error al cargar registros'); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargarInstalaciones(); }, []);
  useEffect(() => { if (instalacionSel) cargarRegistros(instalacionSel as number); }, [instalacionSel]);

  const colorEstado: Record<string, string> = {
    aprobado: 'bg-green-100 text-green-800',
    token_invalido: 'bg-orange-100 text-orange-800',
    token_expirado: 'bg-red-100 text-red-800',
    ausente: 'bg-gray-100 text-gray-500',
    licencia: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Asistencia del Dia"
        descripcion={`Registros de hoy: ${new Date().toLocaleDateString('es-CL')}`}
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Asistencia' }, { nombre: 'Diario' }]}
      />

      <div className="mb-6 flex items-center gap-4">
        <select value={instalacionSel} onChange={e => setInstalacionSel(e.target.value ? parseInt(e.target.value) : '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar instalacion...</option>
          {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>
        {instalacionSel && (
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1 text-green-700"><CheckCircle size={14} /> {aprobados} aprobados</span>
            <span className="flex items-center gap-1 text-red-600"><AlertTriangle size={14} /> {rechazados} con problemas</span>
          </div>
        )}
      </div>

      {!instalacionSel ? (
        <div className="text-center py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>Selecciona una instalacion para ver la asistencia del dia</p>
        </div>
      ) : cargando ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : registros.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Sin registros de asistencia hoy en esta instalacion</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Trabajador</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Entrada</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Salida</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registros.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    {r.trabajador ? `${r.trabajador.apellidos}, ${r.trabajador.nombres}` : `#${r.id}`}
                    {r.trabajador && <span className="ml-2 text-xs text-gray-400">{r.trabajador.rut}</span>}
                  </td>
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
      )}
    </div>
  );
}
