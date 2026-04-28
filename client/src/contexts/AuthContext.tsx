import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import type { UsuarioAutenticado } from '../types';

interface AuthContextType {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // recuperar sesión guardada en localStorage al montar
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('cleanerp_token');
    const usuarioGuardado = localStorage.getItem('cleanerp_usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        // si el JSON está corrupto limpiamos todo
        localStorage.removeItem('cleanerp_token');
        localStorage.removeItem('cleanerp_usuario');
      }
    }
    setCargando(false);
  }, []);

  async function iniciarSesion(email: string, password: string) {
    const respuesta = await api.post('/auth/login', { email, password });
    const { token: nuevoToken, usuario: nuevoUsuario } = respuesta.data;

    localStorage.setItem('cleanerp_token', nuevoToken);
    localStorage.setItem('cleanerp_usuario', JSON.stringify(nuevoUsuario));

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  function cerrarSesion() {
    localStorage.removeItem('cleanerp_token');
    localStorage.removeItem('cleanerp_usuario');
    setToken(null);
    setUsuario(null);
    // TODO: redirigir al login de forma más limpia sin recargar la página
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
