import { useEffect, useState } from 'react';
import { PlusCircle, ClipboardEdit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import {
  ETIQUETAS_ESTADO_LICENCIA,
  COLORES_ESTADO_LICENCIA,
  ETIQUETAS_TIPO_LICENCIA,
} from '../../constants';

interface Trabajador {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
}

interface Licencia {
  id: number;
  trabajadorId: number;
  trabajador: Trabajador;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estado: string;
  habilitaReemplazo: boolean;
  notas: string | null;
}

const FORM_VACIO = {
  trabajadorId: '',
  tipo: 'medica',
  fechaInicio: '',
  fechaFin: '',
  dias: '',
  habilitaReemplazo: false,
  notas: '',
};

export default function LicenciasPage() {
  const toast = useToast();

  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showEstado, setShowEstado] = useState(false);
  const [editando, setEditando] = useState<Licencia | null>(null);
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<Licencia | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({ ...FORM_VACIO });

  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [rLicencias, rTrabajadores] = await Promise.all([
        api.get('/licencias'),
        api.get('/trabajadores'),
      ]);
      setLicencias(rLicencias.data);
      setTrabajadores(rTrabajadores.data);
    } catch {
      toast.error('no se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  function abrirFormCrear() {
    setEditando(null);
    setForm({ ...FORM_VACIO });
    setShowForm(true);
  }

  function abrirEstado(lic: Licencia) {
    setLicenciaSeleccionada(lic);
    setNuevoEstado(lic.estado);
    setShowEstado(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        trabajadorId: parseInt(form.trabajadorId),
        tipo: form.tipo,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        dias: parseInt(form.dias),
        habilitaReemplazo: form.habilitaReemplazo,
        notas: form.notas || null,
      };

      if (editando) {
        // no hay endpoint de edición para licencias — solo estado
        toast.advertencia('para cambiar datos use el estado');
      } else {
        await api.post('/licencias', payload);
        toast.exito('licencia registrada');
      }
      setShowForm(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function handleActualizarEstado() {
    if (!licenciaSeleccionada) return;
    setGuardando(true);
    try {
      await api.patch(`/licencias/${licenciaSeleccionada.id}/estado`, { estado: nuevoEstado });
      toast.exito(`estado actualizado a "${ETIQUETAS_ESTADO_LICENCIA[nuevoEstado as keyof typeof ETIQUETAS_ESTADO_LICENCIA] ?? nuevoEstado}"`);
      setShowEstado(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al actualizar estado');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(lic: Licencia) {
    if (!confirm(`¿Eliminar la licencia de ${lic.trabajador?.nombres} ${lic.trabajador?.apellidos}?`)) return;
    try {
      await api.delete(`/licencias/${lic.id}`);
      toast.exito('licencia eliminada');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al eliminar');
    }
  }

  const opcionesEstado = Object.entries(ETIQUETAS_ESTADO_LICENCIA).map(([k, v]) => ({ valor: k, etiqueta: v }));
  const opcionesTipo = Object.entries(ETIQUETAS_TIPO_LICENCIA).map(([k, v]) => ({ valor: k, etiqueta: v }));
  const opcionesTrabajador = trabajadores.map(t => ({
    valor: String(t.id),
    etiqueta: `${t.apellidos}, ${t.nombres}`,
  }));

  const licenciasFiltradas = licencias.filter(l => {
    if (filtroTrabajador && String(l.trabajadorId) !== filtroTrabajador) return false;
    if (filtroEstado && l.estado !== filtroEstado) return false;
    if (filtroTipo && l.tipo !== filtroTipo) return false;
    return true;
  });

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Gestión de Licencias"
        migajas={[
          { nombre: 'Dashboard', ruta: '/' },
          { nombre: 'Asistencia', ruta: '/asistencia/diario' },
          { nombre: 'Licencias' },
        ]}
        acciones={
          <button
            onClick={abrirFormCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <PlusCircle size={16} />
            Nueva Licencia
          </button>
        }
      />

      {/* filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FilterSelect
          opciones={opcionesTrabajador}
          valor={filtroTrabajador}
          onChange={setFiltroTrabajador}
          placeholder="Todos los trabajadores"
          className="min-w-[220px]"
        />
        <FilterSelect
          opciones={opcionesEstado}
          valor={filtroEstado}
          onChange={setFiltroEstado}
          placeholder="Todos los estados"
          className="min-w-[160px]"
        />
        <FilterSelect
          opciones={opcionesTipo}
          valor={filtroTipo}
          onChange={setFiltroTipo}
          placeholder="Todos los tipos"
          className="min-w-[160px]"
        />
      </div>

      {/* tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Trabajador</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Fecha Inicio</th>
                <th className="px-4 py-3 text-left">Fecha Fin</th>
                <th className="px-4 py-3 text-center">Días</th>
                <th className="px-4 py-3 text-center">Reemplazo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Notas</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    No hay licencias registradas
                  </td>
                </tr>
              ) : (
                licenciasFiltradas.map(lic => (
                  <tr key={lic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {lic.trabajador
                        ? `${lic.trabajador.apellidos}, ${lic.trabajador.nombres}`
                        : `#${lic.trabajadorId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ETIQUETAS_TIPO_LICENCIA[lic.tipo as keyof typeof ETIQUETAS_TIPO_LICENCIA] ?? lic.tipo}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lic.fechaInicio}</td>
                    <td className="px-4 py-3 text-gray-600">{lic.fechaFin}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{lic.dias}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${lic.habilitaReemplazo ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {lic.habilitaReemplazo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        texto={ETIQUETAS_ESTADO_LICENCIA[lic.estado as keyof typeof ETIQUETAS_ESTADO_LICENCIA] ?? lic.estado}
                        estilo={COLORES_ESTADO_LICENCIA[lic.estado as keyof typeof COLORES_ESTADO_LICENCIA] ?? 'bg-gray-100 text-gray-800'}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{lic.notas || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirEstado(lic)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Cambiar estado"
                        >
                          <ClipboardEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminar(lic)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal crear licencia */}
      {showForm && (
        <Modal
          titulo="Nueva Licencia"
          onCerrar={() => setShowForm(false)}
          ancho="md"
        >
          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador *</label>
              <select
                value={form.trabajadorId}
                onChange={e => setForm({ ...form, trabajadorId: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar trabajador...</option>
                {trabajadores.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.apellidos}, {t.nombres} — {t.rut}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ETIQUETAS_TIPO_LICENCIA).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días *</label>
              <input
                type="number"
                min="1"
                value={form.dias}
                onChange={e => setForm({ ...form, dias: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="habilitaReemplazo"
                checked={form.habilitaReemplazo}
                onChange={e => setForm({ ...form, habilitaReemplazo: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="habilitaReemplazo" className="text-sm text-gray-700">
                Habilita reemplazo
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                rows={3}
                placeholder="Observaciones opcionales..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* modal cambiar estado */}
      {showEstado && licenciaSeleccionada && (
        <Modal
          titulo="Cambiar Estado de Licencia"
          onCerrar={() => setShowEstado(false)}
          ancho="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Trabajador:{' '}
              <strong>
                {licenciaSeleccionada.trabajador?.apellidos}, {licenciaSeleccionada.trabajador?.nombres}
              </strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
              <select
                value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(ETIQUETAS_ESTADO_LICENCIA).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEstado(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizarEstado}
                disabled={guardando}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
