import { useEffect, useState } from 'react';
import { PlusCircle, ArrowRightLeft, Trash2, Wrench } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { ETIQUETAS_ESTADO_EQUIPAMIENTO } from '../../constants';

interface Producto { id: number; nombre: string; }
interface Instalacion { id: number; nombre: string; }
interface Equipo {
  id: number;
  productoId: number;
  producto: Producto;
  numeroSerie: string;
  estado: string;
  fechaCompra: string | null;
  fechaUltimoMantenimiento: string | null;
  instalacionId: number | null;
  instalacion: Instalacion | null;
}
interface Transferencia {
  id: number;
  equipamientoId: number;
  equipamiento: { id: number; numeroSerie: string; producto: Producto };
  instalacionOrigenId: number | null;
  instalacionOrigen: Instalacion | null;
  instalacionDestino: Instalacion;
  responsable: { id: number; nombre: string };
  motivo: string | null;
  fecha: string;
}

const COLORES_ESTADO_EQUIPO = {
  operativo: 'bg-emerald-100 text-emerald-800',
  mantenimiento: 'bg-amber-100 text-amber-800',
  baja: 'bg-red-100 text-red-800',
};

const FORM_EQUIPO_VACIO = {
  productoId: '',
  numeroSerie: '',
  instalacionId: '',
  estado: 'operativo',
  fechaCompra: '',
  fechaUltimoMantenimiento: '',
};

export default function InventarioEquipamientoPage() {
  const toast = useToast();

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const [vista, setVista] = useState<'equipos' | 'transferencias'>('equipos');
  const [showFormEquipo, setShowFormEquipo] = useState(false);
  const [showFormTransfer, setShowFormTransfer] = useState(false);
  const [showFormEstado, setShowFormEstado] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [formEquipo, setFormEquipo] = useState({ ...FORM_EQUIPO_VACIO });
  const [formTransfer, setFormTransfer] = useState({ equipamientoId: '', instalacionDestinoId: '', motivo: '' });
  const [nuevoEstadoEquipo, setNuevoEstadoEquipo] = useState('operativo');
  const [fechaMantenimiento, setFechaMantenimiento] = useState('');

  const [filtroInstalacion, setFiltroInstalacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [rEquipos, rTransf, rInst, rProd] = await Promise.all([
        api.get('/equipamiento'),
        api.get('/transferencias'),
        api.get('/instalaciones-todas'),
        api.get('/productos'),
      ]);
      setEquipos(rEquipos.data);
      setTransferencias(rTransf.data);
      setInstalaciones(rInst.data);
      setProductos(rProd.data);
    } catch {
      toast.error('no se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  async function handleCrearEquipo(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.post('/equipamiento', {
        productoId: parseInt(formEquipo.productoId),
        numeroSerie: formEquipo.numeroSerie,
        instalacionId: formEquipo.instalacionId ? parseInt(formEquipo.instalacionId) : null,
        estado: formEquipo.estado,
        fechaCompra: formEquipo.fechaCompra || null,
        fechaUltimoMantenimiento: formEquipo.fechaUltimoMantenimiento || null,
      });
      toast.exito('equipo registrado');
      setShowFormEquipo(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al crear equipo');
    } finally {
      setGuardando(false);
    }
  }

  function abrirCambiarEstado(equipo: Equipo) {
    setEquipoSeleccionado(equipo);
    setNuevoEstadoEquipo(equipo.estado);
    setFechaMantenimiento(equipo.fechaUltimoMantenimiento || '');
    setShowFormEstado(true);
  }

  async function handleActualizarEstado() {
    if (!equipoSeleccionado) return;
    setGuardando(true);
    try {
      await api.patch(`/equipamiento/${equipoSeleccionado.id}`, {
        estado: nuevoEstadoEquipo,
        fechaUltimoMantenimiento: fechaMantenimiento || null,
      });
      toast.exito('equipo actualizado');
      setShowFormEstado(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al actualizar');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminarEquipo(equipo: Equipo) {
    if (!confirm(`¿Eliminar equipo N/S ${equipo.numeroSerie}?`)) return;
    try {
      await api.delete(`/equipamiento/${equipo.id}`);
      toast.exito('equipo eliminado');
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al eliminar');
    }
  }

  async function handleCrearTransferencia(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.post('/transferencias', {
        equipamientoId: parseInt(formTransfer.equipamientoId),
        instalacionDestinoId: parseInt(formTransfer.instalacionDestinoId),
        motivo: formTransfer.motivo || null,
      });
      toast.exito('transferencia registrada');
      setShowFormTransfer(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'error al registrar transferencia');
    } finally {
      setGuardando(false);
    }
  }

  const opcionesInstalacion = instalaciones.map(i => ({ valor: String(i.id), etiqueta: i.nombre }));
  const opcionesEstado = Object.entries(ETIQUETAS_ESTADO_EQUIPAMIENTO).map(([k, v]) => ({ valor: k, etiqueta: v }));

  const equiposFiltrados = equipos.filter(eq => {
    if (filtroInstalacion && String(eq.instalacionId) !== filtroInstalacion) return false;
    if (filtroEstado && eq.estado !== filtroEstado) return false;
    return true;
  });

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Gestión de Equipamiento"
        migajas={[
          { nombre: 'Dashboard', ruta: '/' },
          { nombre: 'Inventario', ruta: '/inventario/resumen' },
          { nombre: 'Equipamiento' },
        ]}
        acciones={
          <div className="flex gap-2">
            <button
              onClick={() => { setShowFormTransfer(true); setFormTransfer({ equipamientoId: '', instalacionDestinoId: '', motivo: '' }); }}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              <ArrowRightLeft size={16} />
              Transferir
            </button>
            <button
              onClick={() => { setFormEquipo({ ...FORM_EQUIPO_VACIO }); setShowFormEquipo(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <PlusCircle size={16} />
              Nuevo Equipo
            </button>
          </div>
        }
      />

      {/* tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {(['equipos', 'transferencias'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setVista(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
              vista === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'equipos' ? 'Equipos' : 'Historial de Transferencias'}
          </button>
        ))}
      </div>

      {vista === 'equipos' && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <FilterSelect opciones={opcionesInstalacion} valor={filtroInstalacion} onChange={setFiltroInstalacion} placeholder="Todas las instalaciones" className="min-w-[200px]" />
            <FilterSelect opciones={opcionesEstado} valor={filtroEstado} onChange={setFiltroEstado} placeholder="Todos los estados" className="min-w-[160px]" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">N/S</th>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Instalación</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Fecha Compra</th>
                    <th className="px-4 py-3 text-left">Últ. Mantención</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {equiposFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No hay equipos registrados</td>
                    </tr>
                  ) : (
                    equiposFiltrados.map(eq => (
                      <tr key={eq.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-800 text-xs">{eq.numeroSerie}</td>
                        <td className="px-4 py-3 text-gray-700">{eq.producto?.nombre ?? `#${eq.productoId}`}</td>
                        <td className="px-4 py-3 text-gray-600">{eq.instalacion?.nombre ?? <span className="text-gray-300">Sin asignar</span>}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            texto={ETIQUETAS_ESTADO_EQUIPAMIENTO[eq.estado as keyof typeof ETIQUETAS_ESTADO_EQUIPAMIENTO] ?? eq.estado}
                            estilo={COLORES_ESTADO_EQUIPO[eq.estado as keyof typeof COLORES_ESTADO_EQUIPO] ?? 'bg-gray-100 text-gray-800'}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{eq.fechaCompra ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{eq.fechaUltimoMantenimiento ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => abrirCambiarEstado(eq)} className="text-amber-500 hover:text-amber-700" title="Editar estado">
                              <Wrench size={16} />
                            </button>
                            <button onClick={() => handleEliminarEquipo(eq)} className="text-red-400 hover:text-red-600" title="Eliminar">
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
        </>
      )}

      {vista === 'transferencias' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Equipo (N/S)</th>
                  <th className="px-4 py-3 text-left">Origen</th>
                  <th className="px-4 py-3 text-left">Destino</th>
                  <th className="px-4 py-3 text-left">Responsable</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transferencias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No hay transferencias registradas</td>
                  </tr>
                ) : (
                  transferencias.map(tr => (
                    <tr key={tr.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{new Date(tr.fecha).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-800">{tr.equipamiento?.numeroSerie}</span>
                        <p className="text-xs text-gray-400">{tr.equipamiento?.producto?.nombre}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{tr.instalacionOrigen?.nombre ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{tr.instalacionDestino?.nombre}</td>
                      <td className="px-4 py-3 text-gray-500">{tr.responsable?.nombre}</td>
                      <td className="px-4 py-3 text-gray-500">{tr.motivo ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* modal nuevo equipo */}
      {showFormEquipo && (
        <Modal titulo="Registrar Nuevo Equipo" onCerrar={() => setShowFormEquipo(false)} ancho="md">
          <form onSubmit={handleCrearEquipo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto *</label>
              <select value={formEquipo.productoId} onChange={e => setFormEquipo({...formEquipo, productoId: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie *</label>
              <input type="text" value={formEquipo.numeroSerie} onChange={e => setFormEquipo({...formEquipo, numeroSerie: e.target.value})} required
                placeholder="Ej: SN-2024-001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalación</label>
              <select value={formEquipo.instalacionId} onChange={e => setFormEquipo({...formEquipo, instalacionId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin asignar</option>
                {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={formEquipo.estado} onChange={e => setFormEquipo({...formEquipo, estado: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(ETIQUETAS_ESTADO_EQUIPAMIENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Compra</label>
                <input type="date" value={formEquipo.fechaCompra} onChange={e => setFormEquipo({...formEquipo, fechaCompra: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Últ. Mantención</label>
                <input type="date" value={formEquipo.fechaUltimoMantenimiento} onChange={e => setFormEquipo({...formEquipo, fechaUltimoMantenimiento: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowFormEquipo(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* modal transferencia */}
      {showFormTransfer && (
        <Modal titulo="Transferir Equipo" onCerrar={() => setShowFormTransfer(false)} ancho="sm">
          <form onSubmit={handleCrearTransferencia} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo *</label>
              <select value={formTransfer.equipamientoId} onChange={e => setFormTransfer({...formTransfer, equipamientoId: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar equipo...</option>
                {equipos.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.producto?.nombre} — {eq.numeroSerie} ({eq.instalacion?.nombre ?? 'Sin asignar'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalación Destino *</label>
              <select value={formTransfer.instalacionDestinoId} onChange={e => setFormTransfer({...formTransfer, instalacionDestinoId: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar destino...</option>
                {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input type="text" value={formTransfer.motivo} onChange={e => setFormTransfer({...formTransfer, motivo: e.target.value})}
                placeholder="Ej: Cierre de instalación, mantenimiento..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowFormTransfer(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Transfiriendo...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* modal cambiar estado equipo */}
      {showFormEstado && equipoSeleccionado && (
        <Modal titulo="Actualizar Estado del Equipo" onCerrar={() => setShowFormEstado(false)} ancho="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              N/S: <strong className="font-mono">{equipoSeleccionado.numeroSerie}</strong>
              {' — '}{equipoSeleccionado.producto?.nombre}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={nuevoEstadoEquipo} onChange={e => setNuevoEstadoEquipo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(ETIQUETAS_ESTADO_EQUIPAMIENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Última Mantención</label>
              <input type="date" value={fechaMantenimiento} onChange={e => setFechaMantenimiento(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowFormEstado(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleActualizarEstado} disabled={guardando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
