import type { RolUsuario } from '../types';

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  prevencion: 'Prevención',
};

export const ETIQUETAS_ESTADO_PROYECTO = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  suspendido: 'Suspendido',
} as const;

export const ETIQUETAS_ESTADO_CONTRATO = {
  activo: 'Activo',
  terminado: 'Terminado',
  suspendido: 'Suspendido',
} as const;

export const ETIQUETAS_TIPO_CONTRATO = {
  plazo_fijo: 'Plazo Fijo',
  indefinido: 'Indefinido',
  obra_faena: 'Obra o Faena',
} as const;

export const ETIQUETAS_ESTADO_ASISTENCIA = {
  aprobado: 'Presente',
  token_invalido: 'Token Inválido',
  token_expirado: 'Token Expirado',
  ausente: 'Ausente',
  licencia: 'Con Licencia',
} as const;

export const ETIQUETAS_ESTADO_LICENCIA = {
  pendiente: 'Pendiente',
  devuelta: 'Devuelta',
  rechazada: 'Rechazada',
} as const;

export const ETIQUETAS_TIPO_EVENTO = {
  amonestacion: 'Amonestación',
  felicitacion: 'Felicitación',
  observacion_cliente: 'Observación de Cliente',
  denuncia_ley_karin: 'Denuncia Ley Karin',
} as const;

export const ETIQUETAS_CATEGORIA_PRODUCTO = {
  consumible: 'Consumible',
  equipamiento: 'Equipamiento',
} as const;

export const ETIQUETAS_COMPATIBILIDAD = {
  clinico: 'Clínico',
  estandar: 'Estándar',
  universal: 'Universal',
} as const;

export const ETIQUETAS_TIPO_MOVIMIENTO = {
  entrada: 'Entrada',
  salida: 'Salida',
  transferencia: 'Transferencia',
} as const;

export const ETIQUETAS_ESTADO_SOLICITUD = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  en_proceso: 'En Proceso',
  entregada: 'Entregada',
  rechazada: 'Rechazada',
} as const;

export const ETIQUETAS_ESTADO_EQUIPAMIENTO = {
  operativo: 'Operativo',
  mantenimiento: 'En Mantenimiento',
  baja: 'De Baja',
} as const;

// colores de badges - los voy agregando según los necesito
export const COLORES_ESTADO_PROYECTO = {
  activo: 'bg-emerald-100 text-emerald-800',
  finalizado: 'bg-gray-100 text-gray-800',
  suspendido: 'bg-amber-100 text-amber-800',
} as const;

export const COLORES_ESTADO_ASISTENCIA = {
  aprobado: 'bg-emerald-100 text-emerald-800',
  token_invalido: 'bg-red-100 text-red-800',
  token_expirado: 'bg-orange-100 text-orange-800',
  ausente: 'bg-red-100 text-red-800',
  licencia: 'bg-blue-100 text-blue-800',
} as const;

export const COLORES_ESTADO_SOLICITUD = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobada: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-purple-100 text-purple-800',
  entregada: 'bg-emerald-100 text-emerald-800',
  rechazada: 'bg-red-100 text-red-800',
} as const;

// rutas del sidebar con control de roles
export const SECCIONES_NAV = [
  {
    titulo: 'General',
    items: [
      { nombre: 'Dashboard', ruta: '/', icono: 'LayoutDashboard', roles: ['admin', 'supervisor', 'prevencion'] as RolUsuario[] },
    ],
  },
  {
    titulo: 'Personal',
    items: [
      { nombre: 'Trabajadores', ruta: '/personal/trabajadores', icono: 'Users', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Contratos', ruta: '/personal/contratos', icono: 'FileText', roles: ['admin'] as RolUsuario[] },
      { nombre: 'Asignaciones', ruta: '/personal/asignaciones', icono: 'MapPin', roles: ['admin', 'supervisor'] as RolUsuario[] },
    ],
  },
  {
    titulo: 'Clientes y Proyectos',
    items: [
      { nombre: 'Clientes', ruta: '/clientes', icono: 'Building2', roles: ['admin'] as RolUsuario[] },
      { nombre: 'Proyectos', ruta: '/proyectos', icono: 'Briefcase', roles: ['admin'] as RolUsuario[] },
    ],
  },
  {
    titulo: 'Asistencia',
    items: [
      { nombre: 'Panel Diario', ruta: '/asistencia/diario', icono: 'ClipboardList', roles: ['admin', 'supervisor', 'prevencion'] as RolUsuario[] },
      { nombre: 'Generar Token', ruta: '/asistencia/token', icono: 'Key', roles: ['supervisor'] as RolUsuario[] },
      { nombre: 'Registrar Asistencia', ruta: '/asistencia/registrar', icono: 'UserCheck', roles: ['admin', 'supervisor', 'prevencion'] as RolUsuario[] },
      { nombre: 'Licencias', ruta: '/asistencia/licencias', icono: 'Stethoscope', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Reportes', ruta: '/asistencia/reportes', icono: 'BarChart2', roles: ['admin', 'supervisor'] as RolUsuario[] },
    ],
  },
  {
    titulo: 'Inventario',
    items: [
      { nombre: 'Resumen General', ruta: '/inventario/resumen', icono: 'Package', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Stock por Instalación', ruta: '/inventario/stock', icono: 'Boxes', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Catálogo de Productos', ruta: '/inventario/catalogo', icono: 'Tag', roles: ['admin'] as RolUsuario[] },
      { nombre: 'Movimientos', ruta: '/inventario/movimientos', icono: 'ArrowLeftRight', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Solicitudes', ruta: '/inventario/solicitudes', icono: 'ShoppingCart', roles: ['admin', 'supervisor'] as RolUsuario[] },
      { nombre: 'Equipamiento', ruta: '/inventario/equipamiento', icono: 'Wrench', roles: ['admin'] as RolUsuario[] },
      { nombre: 'Reportes Consumo', ruta: '/inventario/reportes', icono: 'TrendingDown', roles: ['admin'] as RolUsuario[] },
    ],
  },
];
