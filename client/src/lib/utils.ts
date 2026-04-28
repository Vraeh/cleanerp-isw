import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// esta función la saqué de shadcn para combinar clases tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '-';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

// Formato RUT: 12.345.678-9
export function formatearRut(rut: string): string {
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
}

export function validarRut(rut: string): boolean {
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  let suma = 0;
  let factor = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const dvCalculado = 11 - (suma % 11);
  const dvEsperado =
    dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : String(dvCalculado);

  return dvIngresado === dvEsperado;
}

export function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.startsWith('56') && limpio.length === 11) {
    return `+56 ${limpio[2]} ${limpio.slice(3, 7)} ${limpio.slice(7)}`;
  }
  if (limpio.startsWith('9') && limpio.length === 9) {
    return `+56 ${limpio[0]} ${limpio.slice(1, 5)} ${limpio.slice(5)}`;
  }
  return telefono;
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(valor);
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefono(telefono: string): boolean {
  const limpio = telefono.replace(/\D/g, '');
  return limpio.length === 9 || limpio.length === 11;
}

// TODO: ver si vale la pena mover esto a un helper de formularios después
export function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
