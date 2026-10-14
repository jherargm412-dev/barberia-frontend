/** Permiso del backend que usa este caso de uso. */
export const PERMISOS_ROLES = {
  GESTIONAR: 'ROL_ASIGNAR',
};

/** Nombre del rol protegido: no se desactiva ni se le cambian los permisos. */
export const ROL_ADMINISTRADOR = 'Administrador';

/** Mensajes de CU03, los mismos que devuelve el backend. */
export const MENSAJES = {
  CAMPOS_VACIOS: 'Debe completar todos los campos obligatorios',
};

/**
 * Grupos para mostrar el catálogo de permisos ordenado por área del negocio.
 * Se agrupan por el prefijo del código (CLIENTE_CREAR → CLIENTE). Un prefijo
 * que no esté aquí cae en "Otros", así un permiso nuevo nunca se pierde.
 */
export const GRUPOS_PERMISOS: { titulo: string; prefijos: string[] }[] = [
  { titulo: 'Seguridad y usuarios', prefijos: ['USUARIO', 'ROL', 'PERFIL', 'BITACORA'] },
  { titulo: 'Clientes', prefijos: ['CLIENTE'] },
  { titulo: 'Reservas y agenda', prefijos: ['RESERVA', 'AGENDA'] },
  { titulo: 'Servicios', prefijos: ['SERVICIO'] },
  { titulo: 'Ventas y caja', prefijos: ['VENTA', 'CAJA'] },
  { titulo: 'Inventario y compras', prefijos: ['PRODUCTO', 'STOCK', 'PROVEEDOR', 'COMPRA'] },
  { titulo: 'Empleados y comisiones', prefijos: ['PAGO', 'COMISION'] },
  { titulo: 'Reportes', prefijos: ['REPORTE'] },
];
