import { useState, useEffect } from 'react';
import { Plus, MapPin, User, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface Trabajador { id: number; nombres: string; apellidos: string; rut: string; }
interface Instalacion { id: number; nombre: string; }
interface Asignacion {
  id: number; trabajadorId: number; instalacionId: number;
  fechaInicio: string; fechaFin: string; esActual: boolean;
  trabajador?: { nombres: string; apellidos: string; rut: string };
  instalacion?: { nombre: string };
}

const formVacio = { trabajadorId: '', instalacionId: '', fechaInicio: '' };

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'actuales'>('actuales');
  const toast = useToast();

  async function cargar() {
    setCargando(true);
    try {
      const [rA, rT, rI] = await Promise.all([
        api.get('/asignaciones'),
        api.get('/trabajadores'),
        api.get('/instalaciones-todas'),
      ]);
      setAsignaciones(rA.data);
      setTrabajadores(rT.data);
      setInstalaciones(rI.data);
    } catch { toast.error('Error al cargar asignaciones'); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trabajadorId || !form.instalacionId || !form.fechaInicio) {
      toast.error('Trabajador, instalacion y fecha de inicio son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/asignaciones', {
        trabajadorId: parseInt(form.trabajadorId),
        instalacionId: parseInt(form.instalacionId),
        fechaInicio: form.fechaInicio,
      });
      toast.exito('Asignacion creada');
      setModal(false);
      setForm(formVacio);
      cargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al crear asignacion');
    } finally { setGuardando(false); }
  }

  async function desactivar(id: number) {
    if (!confirm('Desactivar esta asignacion?')) return;
    try {
      await api.patch(`/asignaciones/${id}/desactivar`);
      toast.exito('Asignacion desactivada');
      cargar();
    } catch { toast.error('Error al desactivar asignacion'); }
  }

  const lista = filtro === 'actuales' ? asignaciones.filter(a => a.esActual) : asignaciones;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Asignaciones"
        descripcion="Trabajadores asignados a cada instalacion"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Personal' }, { nombre: 'Asignaciones' }]}
        acciones={
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nueva asignacion
          </button>
        }
      />

      <div className="flex gap-2 mb-5">
        {(['actuales', 'todas'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {f === 'actuales' ? 'Actuales' : 'Historial completo'}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay asignaciones {filtro === 'actuales' ? 'activas' : 'registradas'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Trabajador</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Instalacion</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Desde</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Hasta</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      {a.trabajador ? `${a.trabajador.apellidos}, ${a.trabajador.nombres}` : `#${a.trabajadorId}`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{a.instalacion?.nombre || `#${a.instalacionId}`}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{a.fechaInicio}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{a.fechaFin || '—'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      texto={a.esActual ? 'Activa' : 'Finalizada'}
                      estilo={a.esActual ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {a.esActual && (
                      <button onClick={() => desactivar(a.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Desactivar">
                        <XCircle size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal titulo="Nueva asignacion" onCerrar={() => setModal(false)} ancho="sm">
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador *</label>
              <select value={form.trabajadorId} onChange={e => setForm({ ...form, trabajadorId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {trabajadores.map(t => <option key={t.id} value={t.id}>{t.apellidos}, {t.nombres} — {t.rut}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalacion *</label>
              <select value={form.instalacionId} onChange={e => setForm({ ...form, instalacionId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
              <input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
