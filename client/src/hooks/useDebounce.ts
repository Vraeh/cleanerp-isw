import { useState, useEffect } from 'react';

export function useDebounce<T>(valor: T, espera: number = 300): T {
  const [valorDebounced, setValorDebounced] = useState<T>(valor);

  useEffect(() => {
    const timer = setTimeout(() => setValorDebounced(valor), espera);
    return () => clearTimeout(timer);
  }, [valor, espera]);

  return valorDebounced;
}
