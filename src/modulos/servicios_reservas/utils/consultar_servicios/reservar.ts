import { PERMISOS as PERMISOS_CITAS } from '../../constants/gestionar_citas';
import { PERMISOS_SOLICITUD } from '../../constants/solicitar_cita';

/**
 * CU13 paso 3: a dónde lleva "Reservar" según quién está logueado. El cliente va a Solicitar cita (CU12) y la
 * recepción a Nueva cita (CU11), con el servicio ya elegido. Null si el usuario no puede agendar (p. ej. un barbero).
 */
export function rutaParaReservar(idServicio: number, tienePermiso: (permiso: string) => boolean): string | null {
  if (tienePermiso(PERMISOS_SOLICITUD.SOLICITAR)) return `/solicitar-cita?servicio=${idServicio}`;
  if (tienePermiso(PERMISOS_CITAS.CREAR)) return `/citas/nueva?servicio=${idServicio}`;
  return null;
}
