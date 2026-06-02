import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../hooks/useToast';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { formatearRut, validarRut } from '../../lib/utils';

interface Trabajador {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  afp: string;
  salud: string;
  tipoJornada: string;
  horarioColacion: string;
  cargo: string;
  cuentaRut: string;
}

const formVacio = {
  rut: '', nombres: '', apellidos: '', email: '', telefono: '', direccion: '',
  fechaNacimiento: '', afp: '', salud: '', tipoJornada: '', horarioColacion: '',
  cargo: '', cuentaRut: '',
};

export default function TrabajadoresPage() {
  const { datos, cargando, recargar } = useFetch<Trabajador[]>('/trabajadores');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Trabajador | null>(null);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const trabajadores = datos || [];
  const filtrados = trabajadores.filter(t =>
    `${t.nombres} ${t.apellidos} ${t.rut}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirCrear() {
    setEditando(null);
    setForm(formVacio);
    setModal(true);
  }

  function abrirEditar(t: Trabajador) {
    setEditando(t);
    setForm({
      rut: t.rut, nombres: t.nombres, apellidos: t.apellidos,
      email: t.email || '', telefono: t.telefono || '', direccion: t.direccion || '',
      fechaNacimiento: t.fechaNacimiento || '', afp: t.afp || '', salud: t.salud || '',
      tipoJornada: t.tipoJornada || '', horarioColacion: t.horarioColacion || '',
      cargo: t.cargo || '', cuentaRut: t.cuentaRut || '',
    });
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rut || !form.nombres || !form.apellidos) {
      toast.error('RUT, nombres y apellidos son obligatorios');
      return;
    }
    if (!editando && !validarRut(form.rut)) {
      toast.error('El RUT ingresado no es válido');
      return;
    }
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/trabajadores/${editando.id}`, form);
        toast.exito('Trabajador actualizado');
      } else {
        await api.post('/trabajadores', form);
        toast.exito('Trabajador creado');
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
    if (!confirm('¿Eliminar este trabajador?')) return;
    try {
      await api.delete(`/trabajadores/${id}`);
      toast.exito('Trabajador eliminado');
      recargar();
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  const campo = (label: string, key: keyof typeof formVacio, tipo = 'text', disabled = false) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type={tipo} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
    </div>
  );

  const select = (label: string, key: keyof typeof formVacio, opciones: { v: string; l: string }[]) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Sin especificar</option>
        {opciones.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Trabajadores"
        descripcion="Ficha de cada trabajador de la empresa"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Personal', ruta: '/personal' }, { nombre: 'Trabajadores' }]}
        acciones={
          <button onClick={abrirCrear} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Nuevo trabajador
          </button>
        }
      />

      <div className="mb-4">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o RUT..."
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {filtrados.length === 0 && !cargando ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>{busqueda ? 'Sin resultados para esa busqueda' : 'No hay trabajadores registrados'}</p>
        </div>
      ) : (
        <DataTable
          cargando={cargando}
          clavePrimaria="id"
          datos={filtrados}
          columnas={[
            { clave: 'rut', titulo: 'RUT', render: t => formatearRut(t.rut), ordenable: true },
            { clave: 'apellidos', titulo: 'Apellidos', ordenable: true },
            { clave: 'nombres', titulo: 'Nombres', ordenable: true },
            { clave: 'cargo', titulo: 'Cargo', render: t => t.cargo || '-' },
            { clave: 'tipoJornada', titulo: 'Jornada', render: t => t.tipoJornada || '-' },
            { clave: 'acciones', titulo: '', render: t => (
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(t)} className="text-xs text-blue-600 hover:underline">Editar</button>
                <button onClick={() => eliminar(t.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
            )},
          ]}
        />
      )}

      {modal && (
        <Modal titulo={editando ? 'Editar trabajador' : 'Nuevo trabajador'} onCerrar={() => setModal(false)} ancho="lg">
          <form onSubmit={guardar} className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos personales</p>
              <div className="grid grid-cols-3 gap-3">
                {campo('RUT *', 'rut', 'text', !!editando)}
                {campo('Nombres *', 'nombres')}
                {campo('Apellidos *', 'apellidos')}
                {campo('Fecha de nacimiento', 'fechaNacimiento', 'date')}
                {campo('Email', 'email', 'email')}
                {campo('Telefono', 'telefono')}
                {campo('Direccion', 'direccion')}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prevision y contrato</p>
              <div className="grid grid-cols-3 gap-3">
                {select('AFP', 'afp', [
                  { v: 'capital', l: 'Capital' }, { v: 'cuprum', l: 'Cuprum' },
                  { v: 'habitat', l: 'Habitat' }, { v: 'planvital', l: 'PlanVital' },
                  { v: 'provida', l: 'ProVida' }, { v: 'uno', l: 'Uno' },
                ])}
                {campo('Salud', 'salud')}
                {select('Tipo de jornada', 'tipoJornada', [
                  { v: 'completa', l: 'Completa' }, { v: 'parcial', l: 'Parcial' }, { v: 'turno', l: 'Turno' },
                ])}
                {campo('Horario colacion', 'horarioColacion')}
                {campo('Cargo', 'cargo')}
                {campo('Cuenta RUT', 'cuentaRut')}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
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
