import { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface Trabajador { id: number; nombres: string; apellidos: string; rut: string; }
interface Instalacion { id: number; nombre: string; }
interface Registro {
  id: number; trabajadorId: number; instalacionId: number;
  fecha: string; horaEntrada: string; horaSalida: string; estadoValidacion: string;
  trabajador?: { nombres: string; apellidos: string };
}

export default function AsistenciaRegistrarPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [registrosHoy, setRegistrosHoy] = useState<Registro[]>([]);
  const [form, setForm] = useState({ trabajadorId: '', instalacionId: '', codigo: '' });
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  async function cargar() {
    try {
      const [rT, rI, rR] = await Promise.all([
        api.get('/trabajadores'),
        api.get('/instalaciones-todas'),
        api.get('/asistencia/registros'),
      ]);
      setTrabajadores(rT.data);
      setInstalaciones(rI.data);
      const fechaHoy = new Date().toISOString().split('T')[0];
      setRegistrosHoy(rR.data.filter((r: Registro) => r.fecha === fechaHoy));
    } catch { toast.error('Error al cargar datos'); }
  }

  useEffect(() => { cargar(); }, []);

  async function registrarEntrada(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trabajadorId || !form.instalacionId || !form.codigo) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/asistencia/registros/entrada', {
        trabajadorId: parseInt(form.trabajadorId),
        instalacionId: parseInt(form.instalacionId),
        codigo: form.codigo.toUpperCase(),
      });
      toast.exito('Entrada registrada');
      setForm({ ...form, codigo: '' });
      cargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al registrar');
    } finally { setGuardando(false); }
  }

  async function registrarSalida(id: number) {
    try {
      await api.patch(`/asistencia/registros/${id}/salida`);
      toast.exito('Salida registrada');
      cargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al registrar salida');
    }
  }

  const colorValidacion: Record<string, string> = {
    aprobado: 'text-green-600',
    token_invalido: 'text-orange-500',
    token_expirado: 'text-red-500',
    ausente: 'text-gray-400',
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Registrar Asistencia"
        descripcion={`Hoy: ${hoy}`}
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Asistencia' }, { nombre: 'Registrar' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><LogIn size={18} /> Registrar entrada</h3>
          <form onSubmit={registrarEntrada} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trabajador *</label>
              <select value={form.trabajadorId} onChange={e => setForm({ ...form, trabajadorId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {trabajadores.map(t => <option key={t.id} value={t.id}>{t.apellidos}, {t.nombres}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalacion *</label>
              <select value={form.instalacionId} onChange={e => setForm({ ...form, instalacionId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codigo de token *</label>
              <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                maxLength={6} placeholder="Ej: AB3K7X"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={guardando}
              className="w-full py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              <LogIn size={16} /> {guardando ? 'Registrando...' : 'Registrar entrada'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><LogOut size={18} /> Registros de hoy</h3>
          {registrosHoy.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin registros hoy</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {registrosHoy.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {r.trabajador ? `${r.trabajador.apellidos}, ${r.trabajador.nombres}` : `Trabajador #${r.trabajadorId}`}
                    </p>
                    <p className={`text-xs ${colorValidacion[r.estadoValidacion] || 'text-gray-400'}`}>
                      {r.estadoValidacion === 'aprobado' ? <CheckCircle size={11} className="inline mr-1" /> : <AlertTriangle size={11} className="inline mr-1" />}
                      {r.estadoValidacion.replace('_', ' ')} — Entrada: {r.horaEntrada || '-'}
                      {r.horaSalida && ` / Salida: ${r.horaSalida}`}
                    </p>
                  </div>
                  {r.horaEntrada && !r.horaSalida && (
                    <button onClick={() => registrarSalida(r.id)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <LogOut size={12} /> Salida
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
