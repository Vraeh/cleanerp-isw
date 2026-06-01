import { useEffect, useState, useMemo } from 'react';
import { TrendingDown, AlertTriangle, ArrowDown, ArrowUp, ArrowLeftRight, BarChart2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FilterSelect from '../../components/FilterSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';

interface Producto { id: number; nombre: string; unidad: string; stockActual: number; umbralMinimo: number; }
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
interface StockItem {
  id: number;
  productoId: number;
  instalacionId: number;
  stockActual: number;
  producto: Producto;
  instalacion: Instalacion;
}

const fmt = (n: number) => n.toLocaleString('es-CL');
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

function KpiCard({
  label, valor, sub, colorClass, icon,
}: { label: string; valor: string | number; sub?: string; colorClass: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3">
      <div className={`p-2 rounded-md ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{typeof valor === 'number' ? fmt(valor) : valor}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const hoy = () => new Date().toISOString().slice(0, 10);
const hace30 = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

const OPCIONES_TIPO = [
  { valor: '', etiqueta: 'Todos los tipos' },
  { valor: 'entrada', etiqueta: 'Entrada' },
  { valor: 'salida', etiqueta: 'Salida' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
];

const COLORES_TIPO: Record<string, string> = {
  entrada: 'bg-emerald-100 text-emerald-800',
  salida: 'bg-red-100 text-red-800',
  transferencia: 'bg-blue-100 text-blue-800',
};

export default function InventarioReportesPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [fechaDesde, setFechaDesde] = useState(hace30());
  const [fechaHasta, setFechaHasta] = useState(hoy());
  const [filtroInstalacion, setFiltroInstalacion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [rMov, rStock, rInst] = await Promise.all([
        api.get('/movimientos'),
        api.get('/stock'),
        api.get('/instalaciones-todas'),
      ]);
      setMovimientos(rMov.data);
      setStock(rStock.data);
      setInstalaciones(rInst.data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  const opcionesInstalacion = useMemo(() => [
    { valor: '', etiqueta: 'Todas las instalaciones' },
    ...instalaciones.map((i) => ({ valor: String(i.id), etiqueta: i.nombre })),
  ], [instalaciones]);

  const movFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const fechaMov = m.fecha.slice(0, 10);
      if (fechaDesde && fechaMov < fechaDesde) return false;
      if (fechaHasta && fechaMov > fechaHasta) return false;
      if (filtroTipo && m.tipo !== filtroTipo) return false;
      if (filtroInstalacion) {
        const id = Number(filtroInstalacion);
        const enOrigen = m.instalacionOrigenId === id;
        const enDestino = m.instalacionDestinoId === id;
        if (!enOrigen && !enDestino) return false;
      }
      return true;
    });
  }, [movimientos, fechaDesde, fechaHasta, filtroInstalacion, filtroTipo]);

  const kpis = useMemo(() => {
    let entradas = 0, unidadesEntrada = 0;
    let salidas = 0, unidadesSalida = 0;
    let transferencias = 0;

    movFiltrados.forEach((m) => {
      if (m.tipo === 'entrada') { entradas++; unidadesEntrada += m.cantidad; }
      else if (m.tipo === 'salida') { salidas++; unidadesSalida += m.cantidad; }
      else if (m.tipo === 'transferencia') transferencias++;
    });

    return { total: movFiltrados.length, entradas, unidadesEntrada, salidas, unidadesSalida, transferencias };
  }, [movFiltrados]);

  const topProductos = useMemo(() => {
    const mapa: Record<number, { nombre: string; unidad: string; entrada: number; salida: number; transferencia: number; total: number }> = {};
    movFiltrados.forEach((m) => {
      if (!mapa[m.productoId]) {
        mapa[m.productoId] = { nombre: m.producto?.nombre ?? '—', unidad: m.producto?.unidad ?? '', entrada: 0, salida: 0, transferencia: 0, total: 0 };
      }
      mapa[m.productoId][m.tipo as 'entrada' | 'salida' | 'transferencia'] += m.cantidad;
      mapa[m.productoId].total += m.cantidad;
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [movFiltrados]);

  const alertasStock = useMemo(() => {
    return stock.filter(
      (s) => s.producto?.umbralMinimo > 0 && s.stockActual <= s.producto.umbralMinimo
    );
  }, [stock]);

  const movParaMostrar = movFiltrados.slice(0, 100);
  const hayMas = movFiltrados.length > 100;

  function limpiarFiltros() {
    setFechaDesde(hace30());
    setFechaHasta(hoy());
    setFiltroInstalacion('');
    setFiltroTipo('');
  }

  if (cargando) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        titulo="Reportes de Consumo"
        descripcion="Análisis de movimientos de inventario por período"
      />

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Filtros del período</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <FilterSelect valor={filtroInstalacion} onChange={setFiltroInstalacion} opciones={opcionesInstalacion} />
          <FilterSelect valor={filtroTipo} onChange={setFiltroTipo} opciones={OPCIONES_TIPO} />
          <button
            onClick={limpiarFiltros}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Total movimientos"
          valor={kpis.total}
          colorClass="bg-gray-100 text-gray-600"
          icon={<BarChart2 size={18} />}
        />
        <KpiCard
          label="Entradas"
          valor={kpis.entradas}
          sub={`${fmt(kpis.unidadesEntrada)} unidades`}
          colorClass="bg-emerald-100 text-emerald-600"
          icon={<ArrowDown size={18} />}
        />
        <KpiCard
          label="Salidas"
          valor={kpis.salidas}
          sub={`${fmt(kpis.unidadesSalida)} unidades`}
          colorClass="bg-red-100 text-red-600"
          icon={<ArrowUp size={18} />}
        />
        <KpiCard
          label="Transferencias"
          valor={kpis.transferencias}
          colorClass="bg-blue-100 text-blue-600"
          icon={<ArrowLeftRight size={18} />}
        />
        <KpiCard
          label="Alertas de stock"
          valor={alertasStock.length}
          colorClass={alertasStock.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}
          icon={<AlertTriangle size={18} />}
        />
        <KpiCard
          label="Productos activos"
          valor={stock.length > 0 ? new Set(stock.map((s) => s.productoId)).size : 0}
          colorClass="bg-indigo-100 text-indigo-600"
          icon={<TrendingDown size={18} />}
        />
      </div>

      {/* Top productos + Alertas stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 10 productos más movidos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <BarChart2 size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Top 10 productos más movidos</h2>
          </div>
          {topProductos.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">Sin datos para el período seleccionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <th className="px-3 py-2 text-left w-6">#</th>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right text-emerald-600">E</th>
                    <th className="px-3 py-2 text-right text-red-500">S</th>
                    <th className="px-3 py-2 text-right text-blue-500">T</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProductos.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-800">{p.nombre}</span>
                        <span className="text-xs text-gray-400 ml-1">({p.unidad})</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-emerald-700">{fmt(p.entrada)}</td>
                      <td className="px-3 py-2 text-right font-mono text-red-600">{fmt(p.salida)}</td>
                      <td className="px-3 py-2 text-right font-mono text-blue-600">{fmt(p.transferencia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertas de stock crítico */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className={alertasStock.length > 0 ? 'text-amber-500' : 'text-gray-400'} />
            <h2 className="text-sm font-semibold text-gray-700">
              Alertas de stock crítico
              {alertasStock.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {alertasStock.length}
                </span>
              )}
            </h2>
          </div>
          {alertasStock.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">Sin alertas de stock — todos los productos están sobre el umbral mínimo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-left">Instalación</th>
                    <th className="px-3 py-2 text-right">Actual</th>
                    <th className="px-3 py-2 text-right">Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alertasStock.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{s.producto?.nombre ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{s.instalacion?.nombre ?? '—'}</td>
                      <td className="px-3 py-2 text-right font-mono text-red-600 font-semibold">{fmt(s.stockActual)}</td>
                      <td className="px-3 py-2 text-right font-mono text-gray-500">{fmt(s.producto?.umbralMinimo ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de movimientos del período */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Movimientos del período
            <span className="ml-2 text-xs font-normal text-gray-400">({fmt(movFiltrados.length)} registros)</span>
          </h2>
          {hayMas && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Mostrando primeros 100 de {fmt(movFiltrados.length)}
            </span>
          )}
        </div>
        {movParaMostrar.length === 0 ? (
          <p className="text-sm text-gray-400 p-4">Sin movimientos para el período y filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Producto</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                  <th className="px-3 py-2 text-left">Origen</th>
                  <th className="px-3 py-2 text-left">Destino</th>
                  <th className="px-3 py-2 text-left">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movParaMostrar.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtFecha(m.fecha)}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-800">{m.producto?.nombre ?? '—'}</span>
                      <span className="text-xs text-gray-400 ml-1">({m.producto?.unidad ?? ''})</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLORES_TIPO[m.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-medium">{fmt(m.cantidad)}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{m.instalacionOrigen?.nombre ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{m.instalacionDestino?.nombre ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{m.responsable?.nombre ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
