import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor ingresa tu email y contraseña');
      return;
    }
    setCargando(true);
    try {
      await iniciarSesion(email, password);
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje;
      toast.error(msg || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  }

  function rellenarDemo(rol: 'admin' | 'supervisor' | 'prevencion') {
    const cuentas = {
      admin: 'admin@cleanerp.cl',
      supervisor: 'supervisor@cleanerp.cl',
      prevencion: 'prevencion@cleanerp.cl',
    };
    setEmail(cuentas[rol]);
    setPassword('demo1234');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1F4E79' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CleanERP</h1>
          <p className="text-gray-500 text-sm mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@cleanerp.cl"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={cargando}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1F4E79' }}
          >
            {cargando && <Loader2 size={16} className="animate-spin" />}
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* botones de acceso rápido para probar - sacar antes de entregar */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">Acceso rápido (demo)</p>
          <div className="flex gap-2">
            <button
              onClick={() => rellenarDemo('admin')}
              className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => rellenarDemo('supervisor')}
              className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              Supervisor
            </button>
            <button
              onClick={() => rellenarDemo('prevencion')}
              className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              Prevención
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
