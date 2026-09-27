/** Forma de un cliente recibido desde la API. */
export interface Cliente {
  idCliente: number;
  nombre: string;
  telefono: string | null;
  fechaRegistro: string;
  activo: boolean;
}

/** Campos editables; el identificador y la fecha los asigna el servidor. */
export interface ClienteRequest { nombre: string; telefono: string | null }
export interface RespuestaCliente { mensaje: string; cliente: Cliente }
export interface FiltrosClientes { q: string; activo: boolean | ''; page: number; size: number }
