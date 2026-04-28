import { useToastContext } from '../contexts/ToastContext';

export function useToast() {
  const { mostrarToast } = useToastContext();

  return {
    exito: (mensaje: string) => mostrarToast('exito', mensaje),
    error: (mensaje: string) => mostrarToast('error', mensaje),
    info: (mensaje: string) => mostrarToast('info', mensaje),
    advertencia: (mensaje: string) => mostrarToast('advertencia', mensaje),
  };
}
