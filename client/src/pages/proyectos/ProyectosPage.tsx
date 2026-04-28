import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import FilterSelect from '../../components/FilterSelect';
import { useToast } from '../../hooks/useToast';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { formatearFecha, formatearMoneda } from '../../lib/utils';
import { ETIQUETAS_ESTADO_PROYECTO, COLORES_ESTADO_PROYECTO } from '../../constants';
import type { EstadoProyecto } from '../../types';

interface Cliente { id: number; nombre: string; rut: string; }
interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  presupuesto: number;
  estandarLimpieza: string;
  estado: string;
  clienteId: number;
  cliente: Cliente;
}

const formVacio = {
  nombre: '', descripcion: '', fechaInicio: '', fechaFin: '',
  presupuesto: '', estandarLimpieza: '', clienteId: '', estado: 'activo',
};

export default function ProyectosPage() {
  const { datos, cargando, recargar } = useFetch<Proyecto[]>('/proyectos');
  const { datos: clientes } = useFetch<Cliente[]>('/clientes');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Proyecto | null>(null);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const proyectos = datos || [];
  const filtrados = proyectos.filter(p => !filtroEstado || p.estado === filtroEstado);

  function abrirCrear() {
    setEditando(null);
    setForm(formVacio);
    setModal(true);
  }

  function abrirEditar(p: Proyecto) {
    setEditando(p);
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || '',
      fechaInicio: p.fechaInicio, fechaFin: p.fechaFin || '',
      presupuesto: p.presupuesto ? String(p.presupuesto) : '',
      estandarLimpieza: p.estandarLimpieza || '',
      clienteId: String(p.clienteId), estado: p.estado,
    });
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.fechaInicio || !form.clienteId) {
      toast.error('Nombre, fecha de inicio y cliente son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const datos = { ...form, clienteId: parseInt(form.clienteId), presupuesto: form.presupuesto ? parseFloat(form.presupuesto) : null };
      if (editando) {
        await api.put(`/proyectos/${editando.id}`, datos);
        toast.exito('Proyecto actualizado');
      } else {
        await api.post('/proyectos', datos);
        toast.exito('Proyecto creado');
      }
      setModal(false);
      recargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      toast.exito('Proyecto eliminado');
      recargar();
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Proyectos"
        descripcion="Contratos de servicio por cliente"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Proyectos' }]}
        acciones={
          <button onClick={abrirCrear} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nuevo proyecto
          </button>
        }
      />

      <div className="mb-4">
        <FilterSelect
          valor={filtroEstado}
          onChange={setFiltroEstado}
          placeholder="Todos los estados"
          opciones={[
            { valor: 'activo', etiqueta: 'Activo' },
            { valor: 'finalizado', etiqueta: 'Finalizado' },
            { valor: 'suspendido', etiqueta: 'Suspendido' },
          ]}
        />
      </div>

      {filtrados.length === 0 && !cargando ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay proyectos para mostrar</p>
        </div>
      ) : (
        <DataTable
          cargando={cargando}
          clavePrimaria="id"
          datos={filtrados}
          columnas={[
            { clave: 'nombre', titulo: 'Proyecto', ordenable: true },
            { clave: 'cliente', titulo: 'Cliente', render: p => p.cliente?.nombre || '-', ordenable: false },
            { clave: 'fechaInicio', titulo: 'Inicio', render: p => formatearFecha(p.fechaInicio) },
            { clave: 'fechaFin', titulo: 'Termino', render: p => p.fechaFin ? formatearFecha(p.fechaFin) : 'Indefinido' },
            { clave: 'presupuesto', titulo: 'Presupuesto', render: p => p.presupuesto ? formatearMoneda(p.presupuesto) : '-' },
            { clave: 'estado', titulo: 'Estado', render: p => (
              <StatusBadge texto={ETIQUETAS_ESTADO_PROYECTO[p.estado as EstadoProyecto] || p.estado} estilo={COLORES_ESTADO_PROYECTO[p.estado as EstadoProyecto] || 'bg-gray-100 text-gray-800'} />
            )},
            { clave: 'acciones', titulo: '', render: p => (
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(p)} className="text-xs text-blue-600 hover:underline">Editar</button>
                <button onClick={() => eliminar(p.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
            )},
          ]}
        />
      )}

      {modal && (
        <Modal titulo={editando ? 'Editar proyecto' : 'Nuevo proyecto'} onCerrar={() => setModal(false)} ancho="lg">
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  {(clientes || []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="activo">Activo</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                <input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha termino</label>
                <input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto en pesos chilenos</label>
                <input type="number" value={form.presupuesto} onChange={e => setForm({ ...form, presupuesto: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estandar de limpieza</label>
                <input value={form.estandarLimpieza} onChange={e => setForm({ ...form, estandarLimpieza: e.target.value })}
                  placeholder="Ej: ISO 14644, NNSS" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
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
