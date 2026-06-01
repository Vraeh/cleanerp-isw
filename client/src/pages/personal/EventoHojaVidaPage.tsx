import { useEffect, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { ETIQUETAS_TIPO_EVENTO, COLORES_TIPO_EVENTO } from '../../constants';

interface Trabajador {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
}

interface Instalacion {
  id: number;
  nombre: string;
}

interface EventoHojaVida {
  id: number;
  trabajadorId: number;
  trabajador: Trabajador;
  tipo: string;
  fecha: string;
  descripcion: string;
  registradoPorId: number;
  registradoPor: { id: number; nombre: string };
  instalacionId: number | null;
  instalacion: Instalacion | null;
}

const FORM_VACIO = {
  trabajadorId: '',
  tipo: 'felicitacion',
  fecha: '',
  descripcion: '',
  instalacionId: '',
};

export default function EventoHojaVidaPage() {
  const toast = useToast();

  const [eventos, setEventos] = useState<EventoHojaVida[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [guardando, setGuardando] = useState(false);

  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [rEventos, rTrabajadores, rInstalaciones] = await Promise.all([
        api.get('/hoja-vida'),
        api.get('/trabajadores'),
        api.get('/instalaciones-todas'),
      ]);
      setEventos(rEventos.data);
      setTrabajadores(rTrabajadores.data);
      setInstalaciones(rInstalaciones.data);
    } catch {
      toast.error('no se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  function abrirFormCrear() {
    setForm({ ...FORM_VACIO, fecha: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.post('/hoja-vida', {
        trabajadorId: parseInt(form.trabajadorId),
        tipo: form.tipo,
        fecha: form.fecha,
        descripcion: form.descripcion,
        instalacionId: form.instalacionId ? parseInt(form.instalacionId) : null,
      });
      toast.exito('evento registrado en hoja de vida');
      setShowForm(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al registrar evento');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(ev: EventoHojaVida) {
    if (!confirm(`¿Eliminar este evento de la hoja de vida de ${ev.trabajador?.nombres} ${ev.trabajador?.apellidos}?`)) return;
    try {
      await api.delete(`/hoja-vida/${ev.id}`);
      toast.exito('evento eliminado');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al eliminar');
    }
  }

  const opcionesTrabajador = trabajadores.map(t => ({
    valor: String(t.id),
    etiqueta: `${t.apellidos}, ${t.nombres}`,
  }));
  const opcionesTipo = Object.entries(ETIQUETAS_TIPO_EVENTO).map(([k, v]) => ({ valor: k, etiqueta: v }));

  const eventosFiltrados = eventos.filter(ev => {
    if (filtroTrabajador && String(ev.trabajadorId) !== filtroTrabajador) return false;
    if (filtroTipo && ev.tipo !== filtroTipo) return false;
    return true;
  });

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Hoja de Vida del Personal"
        descripcion="Registro de eventos laborales de cada trabajador"
        migajas={[
          { nombre: 'Dashboard', ruta: '/' },
          { nombre: 'Personal', ruta: '/personal/trabajadores' },
          { nombre: 'Hoja de Vida' },
        ]}
        acciones={
          <button
            onClick={abrirFormCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <PlusCircle size={16} />
            Nuevo Evento
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
          opciones={opcionesTipo}
          valor={filtroTipo}
          onChange={setFiltroTipo}
          placeholder="Todos los tipos"
          className="min-w-[200px]"
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
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Instalación</th>
                <th className="px-4 py-3 text-left">Registrado por</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No hay eventos registrados
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ev.trabajador
                        ? `${ev.trabajador.apellidos}, ${ev.trabajador.nombres}`
                        : `#${ev.trabajadorId}`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        texto={ETIQUETAS_TIPO_EVENTO[ev.tipo as keyof typeof ETIQUETAS_TIPO_EVENTO] ?? ev.tipo}
                        estilo={COLORES_TIPO_EVENTO[ev.tipo as keyof typeof COLORES_TIPO_EVENTO] ?? 'bg-gray-100 text-gray-800'}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ev.fecha}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[280px]">
                      <p className="line-clamp-2">{ev.descripcion}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {ev.instalacion?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {ev.registradoPor?.nombre ?? `#${ev.registradoPorId}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEliminar(ev)}
                        className="text-red-400 hover:text-red-600"
                        title="Eliminar evento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal nuevo evento */}
      {showForm && (
        <Modal
          titulo="Registrar Evento en Hoja de Vida"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ETIQUETAS_TIPO_EVENTO).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm({ ...form, fecha: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalación asociada (opcional)</label>
              <select
                value={form.instalacionId}
                onChange={e => setForm({ ...form, instalacionId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin instalación específica</option>
                {instalaciones.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                required
                rows={4}
                placeholder="Describe el evento con detalle..."
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
                {guardando ? 'Guardando...' : 'Registrar Evento'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
