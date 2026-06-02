import { useEffect, useState } from 'react';
import { PlusCircle, ChevronDown, ChevronRight, Trash2, ClipboardEdit } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { ETIQUETAS_ESTADO_SOLICITUD, COLORES_ESTADO_SOLICITUD } from '../../constants';

interface Producto { id: number; nombre: string; categoria: string; unidad: string; }
interface Instalacion { id: number; nombre: string; }
interface ItemSol { id: number; productoId: number; producto: Producto; cantidad: number; }
interface Solicitud {
  id: number;
  instalacionId: number;
  instalacion: Instalacion;
  solicitadoPorId: number;
  solicitadoPor: { id: number; nombre: string };
  revisadoPor: { id: number; nombre: string } | null;
  estado: string;
  notas: string | null;
  creadoEn: string;
  actualizadoEn: string;
  items: ItemSol[];
}

interface ItemForm { productoId: string; cantidad: string; }

export default function InventarioSolicitudesPage() {
  const toast = useToast();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showEstado, setShowEstado] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());
  const [guardando, setGuardando] = useState(false);

  // form nueva solicitud
  const [formInstalacion, setFormInstalacion] = useState('');
  const [formNotas, setFormNotas] = useState('');
  const [formItems, setFormItems] = useState<ItemForm[]>([{ productoId: '', cantidad: '' }]);

  // form estado
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [notasEstado, setNotasEstado] = useState('');

  const [filtroInstalacion, setFiltroInstalacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [rSol, rInst, rProd] = await Promise.all([
        api.get('/solicitudes'),
        api.get('/instalaciones-todas'),
        api.get('/productos'),
      ]);
      setSolicitudes(rSol.data);
      setInstalaciones(rInst.data);
      setProductos(rProd.data);
    } catch {
      toast.error('no se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  function toggleExpanir(id: number) {
    setExpandidas(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function abrirFormCrear() {
    setFormInstalacion('');
    setFormNotas('');
    setFormItems([{ productoId: '', cantidad: '' }]);
    setShowForm(true);
  }

  function agregarItem() {
    setFormItems(prev => [...prev, { productoId: '', cantidad: '' }]);
  }

  function quitarItem(idx: number) {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  }

  function editarItem(idx: number, campo: keyof ItemForm, valor: string) {
    setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: valor } : it));
  }

  async function handleCrearSolicitud(e: React.FormEvent) {
    e.preventDefault();
    const itemsValidos = formItems.filter(it => it.productoId && it.cantidad);
    if (itemsValidos.length === 0) {
      toast.advertencia('agrega al menos un producto a la solicitud');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/solicitudes', {
        instalacionId: parseInt(formInstalacion),
        notas: formNotas || null,
        items: itemsValidos.map(it => ({ productoId: parseInt(it.productoId), cantidad: parseInt(it.cantidad) })),
      });
      toast.exito('solicitud creada correctamente');
      setShowForm(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al crear solicitud');
    } finally {
      setGuardando(false);
    }
  }

  function abrirCambiarEstado(sol: Solicitud) {
    setSolicitudSeleccionada(sol);
    setNuevoEstado('aprobada');
    setNotasEstado('');
    setShowEstado(true);
  }

  async function handleCambiarEstado() {
    if (!solicitudSeleccionada) return;
    setGuardando(true);
    try {
      await api.patch(`/solicitudes/${solicitudSeleccionada.id}/estado`, {
        estado: nuevoEstado,
        notas: notasEstado || undefined,
      });
      toast.exito(`estado actualizado a "${ETIQUETAS_ESTADO_SOLICITUD[nuevoEstado as keyof typeof ETIQUETAS_ESTADO_SOLICITUD] ?? nuevoEstado}"`);
      setShowEstado(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al cambiar estado');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(sol: Solicitud) {
    if (!confirm(`¿Eliminar solicitud #${sol.id}?`)) return;
    try {
      await api.delete(`/solicitudes/${sol.id}`);
      toast.exito('solicitud eliminada');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'no se puede eliminar — solo solicitudes pendientes');
    }
  }

  const opcionesInstalacion = instalaciones.map(i => ({ valor: String(i.id), etiqueta: i.nombre }));
  const opcionesEstado = Object.entries(ETIQUETAS_ESTADO_SOLICITUD).map(([k, v]) => ({ valor: k, etiqueta: v }));
  const estadosCambiables = ['aprobada', 'en_proceso', 'entregada', 'rechazada'];

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroInstalacion && String(s.instalacionId) !== filtroInstalacion) return false;
    if (filtroEstado && s.estado !== filtroEstado) return false;
    return true;
  });

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Solicitudes de Reabastecimiento"
        migajas={[
          { nombre: 'Dashboard', ruta: '/' },
          { nombre: 'Inventario', ruta: '/inventario/resumen' },
          { nombre: 'Solicitudes' },
        ]}
        acciones={
          <button
            onClick={abrirFormCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <PlusCircle size={16} />
            Nueva Solicitud
          </button>
        }
      />

      {/* filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FilterSelect
          opciones={opcionesInstalacion}
          valor={filtroInstalacion}
          onChange={setFiltroInstalacion}
          placeholder="Todas las instalaciones"
          className="min-w-[200px]"
        />
        <FilterSelect
          opciones={opcionesEstado}
          valor={filtroEstado}
          onChange={setFiltroEstado}
          placeholder="Todos los estados"
          className="min-w-[160px]"
        />
      </div>

      {/* lista de solicitudes */}
      <div className="space-y-3">
        {solicitudesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400">
            No hay solicitudes registradas
          </div>
        ) : (
          solicitudesFiltradas.map(sol => (
            <div key={sol.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* header de la tarjeta */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleExpanir(sol.id)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  {expandidas.has(sol.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-gray-900">
                      Solicitud #{sol.id} — {sol.instalacion?.nombre ?? `Inst. #${sol.instalacionId}`}
                    </span>
                    <StatusBadge
                      texto={ETIQUETAS_ESTADO_SOLICITUD[sol.estado as keyof typeof ETIQUETAS_ESTADO_SOLICITUD] ?? sol.estado}
                      estilo={COLORES_ESTADO_SOLICITUD[sol.estado as keyof typeof COLORES_ESTADO_SOLICITUD] ?? 'bg-gray-100 text-gray-800'}
                    />
                    <span className="text-xs text-gray-400">
                      {sol.items?.length ?? 0} producto(s)
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Creada por {sol.solicitadoPor?.nombre ?? `#${sol.solicitadoPorId}`}
                    {' · '}{new Date(sol.creadoEn).toLocaleDateString('es-CL')}
                    {sol.revisadoPor && ` · Revisada por ${sol.revisadoPor.nombre}`}
                  </div>
                  {sol.notas && <p className="text-xs text-gray-500 mt-1 truncate">{sol.notas}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {sol.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => abrirCambiarEstado(sol)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Cambiar estado"
                      >
                        <ClipboardEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(sol)}
                        className="text-red-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {sol.estado !== 'pendiente' && sol.estado !== 'entregada' && (
                    <button
                      onClick={() => abrirCambiarEstado(sol)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Avanzar estado"
                    >
                      <ClipboardEdit size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* items expandidos */}
              {expandidas.has(sol.id) && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Productos solicitados</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400">
                        <th className="text-left pb-1">Producto</th>
                        <th className="text-left pb-1">Categoría</th>
                        <th className="text-left pb-1">Unidad</th>
                        <th className="text-right pb-1">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(sol.items ?? []).map(item => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-gray-700">{item.producto?.nombre ?? `#${item.productoId}`}</td>
                          <td className="py-1.5 text-gray-500">{item.producto?.categoria ?? '—'}</td>
                          <td className="py-1.5 text-gray-500">{item.producto?.unidad ?? '—'}</td>
                          <td className="py-1.5 text-right font-medium text-gray-800">{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* modal nueva solicitud */}
      {showForm && (
        <Modal titulo="Nueva Solicitud de Reabastecimiento" onCerrar={() => setShowForm(false)} ancho="lg">
          <form onSubmit={handleCrearSolicitud} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalación *</label>
              <select
                value={formInstalacion}
                onChange={e => setFormInstalacion(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar instalación...</option>
                {instalaciones.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>

            {/* items dinámicos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Productos *</label>
                <button
                  type="button"
                  onClick={agregarItem}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Agregar producto
                </button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <select
                      value={item.productoId}
                      onChange={e => editarItem(idx, 'productoId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      value={item.cantidad}
                      onChange={e => editarItem(idx, 'cantidad', e.target.value)}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarItem(idx)}
                        className="text-red-400 hover:text-red-600 mt-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formNotas}
                onChange={e => setFormNotas(e.target.value)}
                rows={2}
                placeholder="Observaciones opcionales..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Enviando...' : 'Crear Solicitud'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* modal cambiar estado */}
      {showEstado && solicitudSeleccionada && (
        <Modal titulo="Cambiar Estado de Solicitud" onCerrar={() => setShowEstado(false)} ancho="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Solicitud <strong>#{solicitudSeleccionada.id}</strong> —{' '}
              {solicitudSeleccionada.instalacion?.nombre}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
              <select
                value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {estadosCambiables.map(est => (
                  <option key={est} value={est}>
                    {ETIQUETAS_ESTADO_SOLICITUD[est as keyof typeof ETIQUETAS_ESTADO_SOLICITUD]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea
                value={notasEstado}
                onChange={e => setNotasEstado(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowEstado(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleCambiarEstado} disabled={guardando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
