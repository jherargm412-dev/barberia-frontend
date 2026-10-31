export interface ProveedorRequest {
  empresa: string;
  nit: string;
  nombre: string;
  telefono: string;
  correo: string;
}

export interface Proveedor extends Omit<ProveedorRequest, 'nombre' | 'telefono' | 'correo'> {
  idProveedor: number;
  nombre: string | null;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
}

export interface RespuestaProveedor {
  mensaje: string;
  proveedor: Proveedor;
}
