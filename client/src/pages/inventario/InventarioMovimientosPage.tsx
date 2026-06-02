import { useEffect, useState } from 'react';
import { PlusCircle, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { ETIQUETAS_TIPO_MOVIMIENTO } from '../../constants';

interface Producto { id: number; nombre: string; unidad: string; }
interface Instalacion { id: number; nombre: string; }
interface Movimiento {
  id: number;
  productoId: number;
  producto: Producto;
  tipo: string;
  cantidad: number;
  instalacionOrigenId: number | null;
  instalacionOrigen: Instalacion | null;
  instalacionDestinoId: number | null;
  instalacionDestino: Instalacion | null;
  responsable: { id: number; nombre: string };
  notas: string | null;
  fecha: string;
}

const COLORES_TIPO_MOV = {
  entrada: 'bg-emerald-100 text-emerald-800',
  salida: 'bg-red-100 text-red-800',
  transferencia: 'bg-blue-100 text-blue-800',
};

const ICONOS_TIPO: Record<string, React.ReactNode> = {
  entrada: <ArrowDown size={14} className="text-emerald-600" />,
  salida: <ArrowUp size={14} className="text-red-500" />,
  transferencia: <ArrowLeftRight size={14} className="text-blue-500" />,
};

const FORM_VACIO = {
  productoId: '',
  tipo: 'entrada',
  cantidad: '',
  instalacionOrigenId: '',
  instalacionDestinoId: '',
  notas: '',
};

export default function InventarioMovimientosPage() {
  const toast = useToast();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [guardando, setGuardando] = useState(false);

  const [filtroInstalacion, setFiltroInstalacion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [rMov, rInst, rProd] = await Promise.all([
        api.get('/movimientos'),
        api.get('/instalaciones-todas'),
        api.get('/productos'),
      ]);
      setMovimientos(rMov.data);
      setInstalaciones(rInst.data);
      setProductos(rProd.data);
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  function abrirFormCrear() {
    setForm({ ...FORM_VACIO });
    setShowForm(true);
  }

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload: Record<string, any> = {
        productoId: parseInt(form.productoId),
        tipo: form.tipo,
        cantidad: parseInt(form.cantidad),
        notas: form.notas || null,
      };

      if (form.tipo === 'entrada') {
        payload.instalacionDestinoId = parseInt(form.instalacionDestinoId);
      } else if (form.tipo === 'salida') {
        payload.instalacionOrigenId = parseInt(form.instalacionOrigenId);
      } else {
        // transferencia
        payload.instalacionOrigenId = parseInt(form.instalacionOrigenId);
        payload.instalacionDestinoId = parseInt(form.instalacionDestinoId);
      }

      await api.post('/movimientos', payload);
      toast.exito('Movimiento registrado correctamente');
      setShowForm(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar movimiento');
    } finally {
      setGuardando(false);
    }
  }

  const opcionesInstalacion = instalaciones.map(i => ({ valor: String(i.id), etiqueta: i.nombre }));
  const opcionesTipo = Object.entries(ETIQUETAS_TIPO_MOVIMIENTO).map(([k, v]) => ({ valor: k, etiqueta: v }));
  const opcionesProducto = productos.map(p => ({ valor: String(p.id), etiqueta: p.nombre }));

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    if (filtroProducto && String(m.productoId) !== filtroProducto) return false;
    if (filtroInstalacion) {
      const id = filtroInstalacion;
      const enOrigen = String(m.instalacionOrigenId) === id;
      const enDestino = String(m.instalacionDestinoId) === id;
      if (!enOrigen && !enDestino) return false;
    }
    return true;
  });

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Movimientos de Inventario"
        migajas={[
          { nombre: 'Dashboard', ruta: '/' },
          { nombre: 'Inventario', ruta: '/inventario/resumen' },
          { nombre: 'Movimientos' },
        ]}
        acciones={
          <button
            onClick={abrirFormCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <PlusCircle size={16} />
            Registrar Movimiento
          </button>
        }
      />

      {/* filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FilterSelect
          opciones={opcionesTipo}
          valor={filtroTipo}
          onChange={setFiltroTipo}
          placeholder="Todos los tipos"
          className="min-w-[160px]"
        />
        <FilterSelect
          opciones={opcionesProducto}
          valor={filtroProducto}
          onChange={setFiltroProducto}
          placeholder="Todos los productos"
          className="min-w-[200px]"
        />
        <FilterSelect
          opciones={opcionesInstalacion}
          valor={filtroInstalacion}
          onChange={setFiltroInstalacion}
          placeholder="Todas las instalaciones"
          className="min-w-[200px]"
        />
      </div>

      {/* tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-left">Origen</th>
                <th className="px-4 py-3 text-left">Destino</th>
                <th className="px-4 py-3 text-left">Responsable</th>
                <th className="px-4 py-3 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(m.fecha).toLocaleDateString('es-CL')}{' '}
                      <span className="text-xs text-gray-400">
                        {new Date(m.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {ICONOS_TIPO[m.tipo]}
                        <StatusBadge
                          texto={ETIQUETAS_TIPO_MOVIMIENTO[m.tipo as keyof typeof ETIQUETAS_TIPO_MOVIMIENTO] ?? m.tipo}
                          estilo={COLORES_TIPO_MOV[m.tipo as keyof typeof COLORES_TIPO_MOV] ?? 'bg-gray-100 text-gray-800'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {m.producto?.nombre ?? `#${m.productoId}`}
                      {m.producto?.unidad && (
                        <span className="text-xs text-gray-400 ml-1">({m.producto.unidad})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{m.cantidad}</td>
                    <td className="px-4 py-3 text-gray-500">{m.instalacionOrigen?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.instalacionDestino?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.responsable?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{m.notas ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal registrar movimiento */}
      {showForm && (
        <Modal titulo="Registrar Movimiento de Inventario" onCerrar={() => setShowForm(false)} ancho="md">
          <form onSubmit={handleRegistrar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento *</label>
              <div className="flex gap-2">
                {(['entrada', 'salida', 'transferencia'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: t, instalacionOrigenId: '', instalacionDestinoId: '' })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      form.tipo === t
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {ETIQUETAS_TIPO_MOVIMIENTO[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
              <select
                value={form.productoId}
                onChange={e => setForm({ ...form, productoId: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* campos según tipo */}
            {(form.tipo === 'salida' || form.tipo === 'transferencia') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instalación Origen *</label>
                <select
                  value={form.instalacionOrigenId}
                  onChange={e => setForm({ ...form, instalacionOrigenId: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar instalación...</option>
                  {instalaciones.map(i => (
                    <option key={i.id} value={i.id}>{i.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {(form.tipo === 'entrada' || form.tipo === 'transferencia') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instalación Destino *</label>
                <select
                  value={form.instalacionDestinoId}
                  onChange={e => setForm({ ...form, instalacionDestinoId: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar instalación...</option>
                  {instalaciones
                    .filter(i => String(i.id) !== form.instalacionOrigenId)
                    .map(i => (
                      <option key={i.id} value={i.id}>{i.nombre}</option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <input
                type="text"
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                placeholder="Observaciones del movimiento..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {guardando ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
