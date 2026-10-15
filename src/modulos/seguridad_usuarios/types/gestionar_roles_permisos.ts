// Tipos de CU03 Gestionar Roles y Permisos (copiados de los DTOs del backend).

/** Rol completo (RolResponse.java). */
export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  /** Rol de la semilla (Administrador, Recepcionista, Barbero, Cliente): no se puede renombrar. */
  sistema: boolean;
  /** Códigos de permiso otorgados, ordenados. */
  permisos: string[];
  cantidadUsuarios: number;
}

/** Fila del catálogo de permisos (PermisoResponse.java). */
export interface Permiso {
  idPermiso: number;
  accion: string;
  descripcion: string | null;
  activo: boolean;
}

/** Body de POST /roles y PUT /roles/{id} (RolRequest.java). La lista de permisos reemplaza a la anterior. */
export interface RolRequest {
  nombre: string;
  descripcion: string | null;
  permisos: string[];
}

/** Respuesta de POST, PUT y PATCH: "Rol guardado correctamente" + el rol. */
export interface RespuestaRol {
  mensaje: string;
  rol: Rol;
}
