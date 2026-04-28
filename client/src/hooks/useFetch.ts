import { useState, useEffect } from 'react';
import api from '../lib/api';

interface EstadoFetch<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

// hook genérico para GET - se reutiliza en varios componentes
export function useFetch<T>(url: string): EstadoFetch<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contador, setContador] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    api.get<T>(url)
      .then((res) => {
        if (!cancelado) setDatos(res.data);
      })
      .catch((err: any) => {
        if (!cancelado) {
          setError(err.response?.data?.mensaje || 'Error al cargar los datos');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [url, contador]);

  const recargar = () => setContador((c) => c + 1);

  return { datos, cargando, error, recargar };
}
