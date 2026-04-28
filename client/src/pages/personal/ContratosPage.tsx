import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../hooks/useToast';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { formatearFecha, formatearMoneda, formatearRut } from '../../lib/utils';
import { ETIQUETAS_TIPO_CONTRATO, ETIQUETAS_ESTADO_CONTRATO } from '../../constants';
import type { TipoContrato, EstadoContrato } from '../../types';

interface Trabajador { id: number; rut: string; nombres: string; apellidos: string; }
interface Proyecto { id: number; nombre: string; }
interface Contrato {
  id: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  cargo: string;
  salario: number;
  estado: string;
  trabajadorId: number;
  proyectoId: number;
  trabajador: Trabajador;
  proyecto: Proyecto;
}

const formVacio = { trabajadorId: '', proyectoId: '', tipo: '', fechaInicio: '', fechaFin: '', cargo: '', salario: '' };

export default function ContratosPage() {
  const { datos, cargando, recargar } = useFetch<Contrato[]>('/contratos');
  const { datos: trabajadores } = useFetch<Trabajador[]>('/trabajadores');
  const { datos: proyectos } = useFetch<Proyecto[]>('/proyectos');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const contratos = datos || [];

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trabajadorId || !form.proyectoId || !form.tipo || !form.fechaInicio) {
      toast.error('Trabajador, proyecto, tipo y fecha inicio son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/contratos', {
        ...form,
        trabajadorId: parseInt(form.trabajadorId),
        proyectoId: parseInt(form.proyectoId),
        salario: form.salario ? parseFloat(form.salario) : null,
      });
      toast.exito('Contrato creado');
      setModal(false);
      recargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al crear contrato');
    } finally {
      setGuardando(false);
    }
  }

  const colorEstado: Record<string, string> = {
    activo: 'bg-emerald-100 text-emerald-800',
    terminado: 'bg-gray-100 text-gray-800',
    suspendido: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Contratos Laborales"
        descripcion="Vinculo entre trabajadores y proyectos"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Personal', ruta: '/personal' }, { nombre: 'Contratos' }]}
        acciones={
          <button onClick={() => { setForm(formVacio); setModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nuevo contrato
          </button>
        }
      />

      {contratos.length === 0 && !cargando ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay contratos registrados</p>
        </div>
      ) : (
        <DataTable
          cargando={cargando}
          clavePrimaria="id"
          datos={contratos}
          columnas={[
            { clave: 'trabajador', titulo: 'Trabajador', render: c => c.trabajador ? `${c.trabajador.apellidos}, ${c.trabajador.nombres}` : '-' },
            { clave: 'rut', titulo: 'RUT', render: c => c.trabajador ? formatearRut(c.trabajador.rut) : '-' },
            { clave: 'proyecto', titulo: 'Proyecto', render: c => c.proyecto?.nombre || '-' },
            { clave: 'tipo', titulo: 'Tipo', render: c => ETIQUETAS_TIPO_CONTRATO[c.tipo as TipoContrato] || c.tipo },
            { clave: 'cargo', titulo: 'Cargo', render: c => c.cargo || '-' },
            { clave: 'fechaInicio', titulo: 'Inicio', render: c => formatearFecha(c.fechaInicio) },
            { clave: 'salario', titulo: 'Salario', render: c => c.salario ? formatearMoneda(c.salario) : '-' },
            { clave: 'estado', titulo: 'Estado', render: c => (
              <StatusBadge texto={ETIQUETAS_ESTADO_CONTRATO[c.estado as EstadoContrato] || c.estado} estilo={colorEstado[c.estado] || 'bg-gray-100 text-gray-800'} />
            )},
          ]}
        />
      )}

      {modal && (
        <Modal titulo="Nuevo contrato" onCerrar={() => setModal(false)} ancho="lg">
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador *</label>
                <select value={form.trabajadorId} onChange={e => setForm({ ...form, trabajadorId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  {(trabajadores || []).map(t => <option key={t.id} value={t.id}>{t.apellidos}, {t.nombres}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
                <select value={form.proyectoId} onChange={e => setForm({ ...form, proyectoId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  {(proyectos || []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato *</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  <option value="plazo_fijo">Plazo Fijo</option>
                  <option value="indefinido">Indefinido</option>
                  <option value="obra_faena">Obra o Faena</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Salario en pesos chilenos</label>
                <input type="number" value={form.salario} onChange={e => setForm({ ...form, salario: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {guardando ? 'Guardando...' : 'Crear contrato'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
