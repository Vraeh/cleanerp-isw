export type RolUsuario = 'admin' | 'supervisor' | 'prevencion';

export interface UsuarioAutenticado {
  id: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioAutenticado;
}

// estados que se usan en varias partes del sistema
export type EstadoProyecto = 'activo' | 'finalizado' | 'suspendido';
export type EstadoContrato = 'activo' | 'terminado' | 'suspendido';
export type TipoContrato = 'plazo_fijo' | 'indefinido' | 'obra_faena';
export type EstadoToken = 'vigente' | 'utilizado' | 'expirado';
export type EstadoValidacionAsistencia = 'aprobado' | 'token_invalido' | 'token_expirado' | 'ausente' | 'licencia';
export type EstadoLicencia = 'pendiente' | 'devuelta' | 'rechazada';
export type TipoLicencia = 'medica' | 'mutual' | 'maternidad' | 'paternidad' | 'administrativa';
export type TipoEvento = 'amonestacion' | 'felicitacion' | 'observacion_cliente' | 'denuncia_ley_karin';
export type CategoriaProducto = 'consumible' | 'equipamiento';
export type CompatibilidadProducto = 'clinico' | 'estandar' | 'universal';
export type TipoMovimiento = 'entrada' | 'salida' | 'transferencia';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'en_proceso' | 'entregada' | 'rechazada';
export type EstadoEquipamiento = 'operativo' | 'mantenimiento' | 'baja';

export interface RespuestaApi<T> {
  datos?: T;
  mensaje?: string;
}

export interface Paginacion {
  pagina: number;
  limite: number;
  total: number;
}
