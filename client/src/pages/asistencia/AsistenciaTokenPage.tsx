import { useState, useEffect } from 'react';
import { Key, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface Instalacion { id: number; nombre: string; }
interface Token {
  id: number; codigo: string; instalacionId: number;
  fechaGeneracion: string; fechaExpiracion: string; estado: string;
  instalacion?: { nombre: string }; supervisor?: { nombre: string };
}

export default function AsistenciaTokenPage() {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [instalacionSel, setInstalacionSel] = useState<number | ''>('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [minutos, setMinutos] = useState(60);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  async function cargarInstalaciones() {
    try {
      const res = await api.get('/instalaciones-todas');
      setInstalaciones(res.data);
    } catch { toast.error('No se pudieron cargar las instalaciones'); }
  }

  async function cargarTokens(id: number) {
    setCargando(true);
    try {
      const res = await api.get(`/asistencia/tokens/${id}`);
      setTokens(res.data);
    } catch { toast.error('Error al cargar tokens'); }
    finally { setCargando(false); }
  }

  useEffect(() => { cargarInstalaciones(); }, []);
  useEffect(() => { if (instalacionSel) cargarTokens(instalacionSel as number); }, [instalacionSel]);

  async function generarToken(e: React.FormEvent) {
    e.preventDefault();
    if (!instalacionSel) { toast.error('Selecciona una instalacion'); return; }
    setGuardando(true);
    try {
      await api.post('/asistencia/tokens', { instalacionId: instalacionSel, minutosVigencia: minutos });
      toast.exito('Token generado');
      setModal(false);
      cargarTokens(instalacionSel as number);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al generar token');
    } finally { setGuardando(false); }
  }

  async function expirarToken(id: number) {
    if (!confirm('Expirar este token?')) return;
    try {
      await api.patch(`/asistencia/tokens/${id}/expirar`);
      toast.exito('Token expirado');
      if (instalacionSel) cargarTokens(instalacionSel as number);
    } catch { toast.error('Error al expirar token'); }
  }

  const colorEstado: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    utilizado: 'bg-blue-100 text-blue-800',
    expirado: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Tokens de Asistencia"
        descripcion="Genera codigos temporales para registrar asistencia en cada instalacion"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Asistencia' }, { nombre: 'Tokens' }]}
        acciones={
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Generar token
          </button>
        }
      />

      <div className="mb-6">
        <select value={instalacionSel} onChange={e => setInstalacionSel(e.target.value ? parseInt(e.target.value) : '')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar instalacion...</option>
          {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>
      </div>

      {!instalacionSel ? (
        <div className="text-center py-16 text-gray-400">
          <Key size={40} className="mx-auto mb-3 opacity-30" />
          <p>Selecciona una instalacion para ver sus tokens</p>
        </div>
      ) : cargando ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.length === 0 && <p className="text-center text-gray-400 py-8">No hay tokens generados aun</p>}
          {tokens.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                  <p className="text-2xl font-mono font-bold tracking-widest text-gray-900">{t.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={13} /> Expira: {new Date(t.fechaExpiracion).toLocaleString('es-CL')}
                  </p>
                  {t.supervisor && <p className="text-xs text-gray-400">Generado por: {t.supervisor.nombre}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge texto={t.estado} estilo={colorEstado[t.estado] || 'bg-gray-100 text-gray-600'} />
                {t.estado === 'vigente' && (
                  <button onClick={() => expirarToken(t.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <XCircle size={13} /> Expirar
                  </button>
                )}
                {t.estado === 'utilizado' && <CheckCircle size={16} className="text-blue-400" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal titulo="Generar nuevo token" onCerrar={() => setModal(false)} ancho="sm">
          <form onSubmit={generarToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instalacion *</label>
              <select value={instalacionSel} onChange={e => setInstalacionSel(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {instalaciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia (minutos) *</label>
              <input type="number" min={5} max={480} value={minutos} onChange={e => setMinutos(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {guardando ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
