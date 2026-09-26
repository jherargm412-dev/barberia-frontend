// Tipos de CU08 Gestionar Catálogo de Servicios (copiados de los DTOs del backend).

/** En la BD es `activo` (true/false); la API lo expone con el vocabulario del CU. */
export type EstadoServicio = 'HABILITADO' | 'INHABILITADO';

/** Servicio completo, solo para el administrador (ServicioResponse.java). */
export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  porcentajeComision: number;
  estado: EstadoServicio;
}

/** Servicio habilitado para reservas y ventas, sin comisión (ServicioResumen.java). */
export interface ServicioResumen {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
}

/** Body de POST /servicios y PUT /servicios/{id} (ServicioRequest.java). El estado no va aquí. */
export interface ServicioRequest {
  nombre: string;
  descripcion: string | null;
  precio: number;
  porcentajeComision: number;
}

/** Respuesta de POST, PUT y PATCH: "Servicio guardado correctamente" + el servicio. */
export interface RespuestaServicio {
  mensaje: string;
  servicio: Servicio;
}

export interface FiltrosServicios {
  q: string;
  estado: EstadoServicio | '';
  page: number;
  size: number;
}
