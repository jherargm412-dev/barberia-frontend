import { DURACION_SUGERIDA_MINUTOS, ESTADOS_FINALES, MENSAJES, TOLERANCIA_MINUTOS } from '../../constants/gestionar_citas';
import type { CanalCita, Cita, PrellenadoCita } from '../../types/gestionar_citas';

/** Valores del formulario de nueva cita tal como los maneja React (ids como texto para los selects). */
export interface CitaFormValores {
  clienteId: number | null;
  servicioId: string;
  empleadoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canal: CanalCita;
}

export type ErroresCita = Partial<Record<keyof CitaFormValores, string>>;

/** Fecha local de hoy como "AAAA-MM-DD" (toISOString usaría UTC y de noche daría mañana). */
export function hoy() {
  return aFechaIso(new Date());
}

export function aFechaIso(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** "2026-10-13" + n días → "2026-10-14". */
export function sumarDias(fecha: string, dias: number) {
  const [a, m, d] = fecha.split('-').map(Number);
  return aFechaIso(new Date(a, m - 1, d + dias));
}

/** "10:00" + 30 → "10:30" (sin pasar de 23:59). */
export function sumarMinutos(hora: string, minutos: number) {
  const [h, m] = hora.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutos, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** "10:00" → "10:45" = 45 (negativo si fin es antes que inicio). */
export function minutosEntre(inicio: string, fin: string) {
  const aMinutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };
  return aMinutos(fin) - aMinutos(inicio);
}

export function horaFinSugerida(horaInicio: string) {
  return sumarMinutos(horaInicio, DURACION_SUGERIDA_MINUTOS);
}

/** Formulario vacío, o con la hora elegida en CU10 (servicio, barbero, fecha y horas). */
export function valoresIniciales(prellenado?: Partial<PrellenadoCita>): CitaFormValores {
  return {
    clienteId: null,
    servicioId: prellenado?.servicioId ? String(prellenado.servicioId) : '',
    empleadoId: prellenado?.empleadoId ? String(prellenado.empleadoId) : '',
    fecha: prellenado?.fecha ?? hoy(),
    horaInicio: prellenado?.horaInicio ?? '',
    horaFin: prellenado?.horaFin ?? '',
    canal: 'PRESENCIAL',
  };
}

function enElPasado(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}`) < new Date();
}

/** Fecha, horas coherentes y en el futuro; lo comparten "nueva cita" y "reprogramar". */
export function validarHorario(fecha: string, horaInicio: string, horaFin: string) {
  const errores: { fecha?: string; horaInicio?: string; horaFin?: string } = {};
  if (!fecha) errores.fecha = 'Obligatorio';
  if (!horaInicio) errores.horaInicio = 'Obligatorio';
  if (!horaFin) errores.horaFin = 'Obligatorio';
  const hayVacios = Object.keys(errores).length > 0;
  if (!hayVacios) {
    if (horaFin <= horaInicio) errores.horaFin = MENSAJES.HORAS;
    else if (enElPasado(fecha, horaInicio)) errores.fecha = MENSAJES.PASADO;
  }
  return { errores, hayVacios };
}

/**
 * Mismas reglas que el backend (ReservaService): primero campos vacíos y después horas inválidas.
 * Traslapes, turno del barbero y estado del cliente solo los puede saber el backend.
 */
export function validarCita(v: CitaFormValores): { mensaje: string; errores: ErroresCita } {
  const { errores: horario, hayVacios: horarioVacio } = validarHorario(v.fecha, v.horaInicio, v.horaFin);
  const errores: ErroresCita = { ...horario };
  let hayVacios = horarioVacio;
  if (v.clienteId === null) {
    errores.clienteId = 'Seleccione o registre un cliente';
    hayVacios = true;
  }
  if (!v.servicioId) {
    errores.servicioId = 'Obligatorio';
    hayVacios = true;
  }
  if (!v.empleadoId) {
    errores.empleadoId = 'Obligatorio';
    hayVacios = true;
  }
  let mensaje = '';
  if (hayVacios) mensaje = MENSAJES.CAMPOS_VACIOS;
  else if (Object.keys(errores).length > 0) mensaje = Object.values(errores)[0] ?? '';
  return { mensaje, errores };
}

export function esFinal(cita: Cita) {
  return ESTADOS_FINALES.includes(cita.estado);
}

function inicioDe(cita: Cita) {
  return new Date(`${cita.fecha}T${cita.horaInicio}`);
}

/** "Atendida" solo cuando la cita ya comenzó (el backend lo vuelve a validar). */
export function puedeAtender(cita: Cita) {
  return !esFinal(cita) && inicioDe(cita) <= new Date();
}

/** "No asistió" solo pasados los minutos de tolerancia. */
export function puedeMarcarNoAsistio(cita: Cita) {
  return !esFinal(cita) && inicioDe(cita).getTime() + TOLERANCIA_MINUTOS * 60_000 <= Date.now();
}

/** "2026-10-13" → "13/10/2026" */
export function formatearFecha(fecha: string) {
  const [a, m, d] = fecha.split('-');
  return `${d}/${m}/${a}`;
}

/** "2026-10-13" → "martes, 13 de octubre de 2026" */
export function formatearFechaLarga(fecha: string) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** 6 → "Bs 6.00" */
export function formatearMonto(monto: number) {
  return `Bs ${monto.toFixed(2)}`;
}

/** Anticipo del 20 % (CU12), igual que lo calcula el backend. */
export function calcularAnticipo(precio: number) {
  return Math.round(precio * 0.2 * 100) / 100;
}

/**
 * Enlace wa.me con el recordatorio de la cita (funcionalidad extra de CU11). Un celular boliviano
 * de 8 dígitos se completa con el código de país 591. Null si el cliente no tiene teléfono.
 */
export function enlaceWhatsApp(cita: Cita): string | null {
  const digitos = (cita.cliente.telefono ?? '').replace(/\D/g, '');
  if (digitos.length < 7) return null;
  const numero = digitos.length === 8 ? `591${digitos}` : digitos;
  const barbero = cita.barbero ? ` con ${cita.barbero.nombre}` : '';
  const texto =
    `Hola ${cita.cliente.nombre}, te recordamos tu cita en House of Cut el ${formatearFecha(cita.fecha)} ` +
    `a las ${cita.horaInicio} para ${cita.servicio.nombre}${barbero}. ¡Te esperamos!`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
