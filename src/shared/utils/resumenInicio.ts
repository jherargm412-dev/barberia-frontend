import type { CitaAgenda } from '../../modulos/servicios_reservas/types/consultar_agenda';

/** Fecha y hora de la barbería; no dependen de la zona horaria del dispositivo. */
export function relojNegocio(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ahora);
  const leer = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  return { fecha: `${leer('year')}-${leer('month')}-${leer('day')}`, hora: `${leer('hour')}:${leer('minute')}` };
}

/** Resume solo la jornada consultada; nunca convierte errores o ausencia de datos en ceros. */
export function resumirAgenda(citas: CitaAgenda[] | null, fecha: string, hora: string) {
  if (!citas) return { programadas: null, atendidos: null, pendientes: null, proximas: [] as CitaAgenda[] };
  const jornada = citas.filter((cita) => cita.fecha === fecha);
  return {
    programadas: jornada.length,
    atendidos: new Set(jornada.filter((cita) => cita.estado === 'ATENDIDA').map((cita) => cita.cliente.idCliente)).size,
    pendientes: jornada.filter((cita) => cita.estado === 'PENDIENTE').length,
    proximas: jornada.filter((cita) => ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && cita.horaInicio.slice(0, 5) >= hora)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio) || a.idReserva - b.idReserva).slice(0, 5),
  };
}
