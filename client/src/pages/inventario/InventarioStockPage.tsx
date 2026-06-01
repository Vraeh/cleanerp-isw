import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Check, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';

interface Instalacion {
  id: number;
  nombre: string;
  direccion: string;
}

interface Cliente {
  id: number;
  nombre: string;
  instalaciones: Instalacion[];
}

interface Producto {
  id: number;
  nombre: string;
  unidad: string;
  categoria: string;
}

interface ItemStock {
  id: number;
  productoId: number;
  instalacionId: number;
  stockActual: number;
  umbralMinimo: number;
  umbralMaximo: number;
  producto: Producto;
}

export default function InventarioStockPage() {
  const { datos: clientes } = useFetch<Cliente[]>('/clientes');
  const { datos: productos } = useFetch<Producto[]>('/productos');

  const [instalacionId, setInstalacionId] = useState<number | null>(null);
  const [stock, setStock] = useState<ItemStock[]>([]);
  const [cargandoStock, setCargandoStock] = useState(false);

  // edicion inline de cantidades
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ stockActual: 0, umbralMinimo: 0, umbralMaximo: 0 });

  // modal para agregar producto nuevo a la instalacion
  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevoStock, setNuevoStock] = useState({ productoId: '', stockActual: '0', umbralMinimo: '0', umbralMaximo: '0' });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // aplanar instalaciones de todos los clientes en una sola lista
  const instalaciones: (Instalacion & { clienteNombre: string })[] = [];
  if (clientes) {
    for (const c of clientes) {
      for (const inst of c.instalaciones) {
        instalaciones.push({ ...inst, clienteNombre: c.nombre });
      }
    }
  }

  useEffect(() => {
    if (!instalacionId) {
      setStock([]);
      return;
    }
    cargarStock(instalacionId);
  }, [instalacionId]);

  async function cargarStock(id: number) {
    setCargandoStock(true);
    try {
      const res = await api.get(`/stock/instalacion/${id}`);
      setStock(res.data);
    } catch (err: any) {
      console.error('Error al cargar stock de instalacion:', err);
    } finally {
      setCargandoStock(false);
    }
  }

  function iniciarEdicion(item: ItemStock) {
    setEditandoId(item.id);
    setEditForm({ stockActual: item.stockActual, umbralMinimo: item.umbralMinimo, umbralMaximo: item.umbralMaximo });
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(id: number) {
    try {
      await api.put(`/stock/${id}`, editForm);
      setEditandoId(null);
      if (instalacionId) cargarStock(instalacionId);
    } catch (err: any) {
      console.error('Error al guardar edicion de stock:', err);
      alert('No se pudieron guardar los cambios');
    }
  }

  async function agregarStock() {
    setErrorModal('');
    if (!nuevoStock.productoId || !instalacionId) {
      setErrorModal('Selecciona un producto');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/stock', {
        productoId: parseInt(nuevoStock.productoId),
        instalacionId,
        stockActual: parseInt(nuevoStock.stockActual) || 0,
        umbralMinimo: parseInt(nuevoStock.umbralMinimo) || 0,
        umbralMaximo: parseInt(nuevoStock.umbralMaximo) || 0,
      });
      setModalAgregar(false);
      setNuevoStock({ productoId: '', stockActual: '0', umbralMinimo: '0', umbralMaximo: '0' });
      cargarStock(instalacionId);
    } catch (err: any) {
      setErrorModal(err.response?.data?.mensaje || 'Error al agregar stock');
    } finally {
      setGuardando(false);
    }
  }

  const instalacionSeleccionada = instalaciones.find(i => i.id === instalacionId);

  // solo mostrar productos que aun no tienen stock en esta instalacion
  const productosSinStock = (productos || []).filter(p => !stock.find(s => s.productoId === p.id));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Stock por Instalacion"
        descripcion="Gestiona el inventario de productos en cada instalacion"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Inventario', ruta: '/inventario' }, { nombre: 'Stock' }]}
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Seleccionar instalacion:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:max-w-sm"
          value={instalacionId || ''}
          onChange={e => setInstalacionId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">-- Elige una instalacion --</option>
          {instalaciones.map(inst => (
            <option key={inst.id} value={inst.id}>
              {inst.nombre} ({inst.clienteNombre})
            </option>
          ))}
        </select>

        {instalacionId && (
          <button
            onClick={() => setModalAgregar(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} /> Agregar producto
          </button>
        )}
      </div>

      {!instalacionId ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecciona una instalacion para ver su stock</p>
        </div>
      ) : cargandoStock ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : stock.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay productos en {instalacionSeleccionada?.nombre}</p>
          <p className="text-xs mt-1">Usa "Agregar producto" para empezar a registrar stock</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Producto', 'Categoria', 'Stock actual', 'Minimo', 'Maximo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stock.map(item => {
                const bajo = item.umbralMinimo > 0 && item.stockActual <= item.umbralMinimo;
                const editando = editandoId === item.id;

                return (
                  <tr key={item.id} className={bajo && !editando ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-800">{item.producto.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{item.producto.categoria}</td>

                    {editando ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="number" min="0"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                            value={editForm.stockActual}
                            onChange={e => setEditForm({ ...editForm, stockActual: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number" min="0"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                            value={editForm.umbralMinimo}
                            onChange={e => setEditForm({ ...editForm, umbralMinimo: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number" min="0"
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                            value={editForm.umbralMaximo}
                            onChange={e => setEditForm({ ...editForm, umbralMaximo: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-2" />
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => guardarEdicion(item.id)} className="text-emerald-600 hover:text-emerald-800" title="Guardar">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelarEdicion} className="text-gray-400 hover:text-gray-600" title="Cancelar">
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.stockActual} {item.producto.unidad || 'u.'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.umbralMinimo}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.umbralMaximo || '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            texto={bajo ? 'Critico' : 'Normal'}
                            estilo={bajo ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => iniciarEdicion(item)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={13} /> Editar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAgregar && <Modal
        onCerrar={() => { setModalAgregar(false); setErrorModal(''); }}
        titulo="Agregar producto a instalacion"
        ancho="sm"
      >
        <div className="space-y-4">
          {errorModal && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{errorModal}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevoStock.productoId}
              onChange={e => setNuevoStock({ ...nuevoStock, productoId: e.target.value })}
            >
              <option value="">-- Selecciona un producto --</option>
              {productosSinStock.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.categoria})</option>
              ))}
            </select>
            {productosSinStock.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Todos los productos ya estan en esta instalacion</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock inicial</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nuevoStock.stockActual}
                onChange={e => setNuevoStock({ ...nuevoStock, stockActual: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min. alerta</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nuevoStock.umbralMinimo}
                onChange={e => setNuevoStock({ ...nuevoStock, umbralMinimo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max. stock</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nuevoStock.umbralMaximo}
                onChange={e => setNuevoStock({ ...nuevoStock, umbralMaximo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setModalAgregar(false); setErrorModal(''); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={agregarStock}
              disabled={guardando}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>}
    </div>
  );
}
