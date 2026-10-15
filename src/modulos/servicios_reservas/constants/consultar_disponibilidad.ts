/** Permisos del backend que usa CU10. La pantalla es para quien agenda (Recepcionista, Administrador). */
export const PERMISOS = {
  CONSULTAR: 'RESERVA_CREAR',
  AGENDAR: 'RESERVA_CREAR',
};

/** Duraciones que se pueden consultar (el servicio no guarda duración). Igual que el backend: 15 a 240. */
export const DURACIONES: { valor: number; etiqueta: string }[] = [
  { valor: 15, etiqueta: '15 min' },
  { valor: 30, etiqueta: '30 min' },
  { valor: 45, etiqueta: '45 min' },
  { valor: 60, etiqueta: '1 hora' },
  { valor: 90, etiqueta: '1 h 30 min' },
  { valor: 120, etiqueta: '2 horas' },
];

export const DURACION_DEFECTO = 30;
