import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { DURACION_DEFECTO } from '../../constants/consultar_disponibilidad';
import type {
  ConsultaDisponibilidad,
  Disponibilidad,
  DisponibilidadBarbero,
} from '../../types/consultar_disponibilidad';
import { sumarDias } from '../gestionar_citas/citaForm';

/** Un día de la fila de fechas: la disponibilidad del barbero (CU10) o el error al consultarla. */
export interface DiaDisponible {
  fecha: string;
  barbero: DisponibilidadBarbero | null;
  error: string;
}

interface Pedido {
  servicioId: number;
  empleadoId: number;
  desde: string;
  dias: number;
  /** Sube para volver a consultar (p. ej. después de que otro tomó la hora elegida). */
  version: number;
}

/**
 * Consulta CU10 para cada uno de los {@code dias} desde {@code desde}, con el mismo endpoint de una fecha,
 * para mostrar cuántas horas libres tiene el barbero cada día. Con pedido null no consulta.
 */
export function useDiasDisponibles(
  pedido: Pedido | null,
  consultar: (c: ConsultaDisponibilidad) => Promise<Disponibilidad>,
) {
  const [resultado, setResultado] = useState<{ clave: string; dias: DiaDisponible[] } | null>(null);
  const clave = pedido ? JSON.stringify(pedido) : '';

  useEffect(() => {
    if (!clave) return;
    const { servicioId, empleadoId, desde, dias } = JSON.parse(clave) as Pedido;
    let vigente = true;
    const fechas = Array.from({ length: dias }, (_, i) => sumarDias(desde, i));
    Promise.all(
      fechas.map((fecha) =>
        consultar({ servicioId, empleadoId, fecha, duracion: DURACION_DEFECTO })
          .then((d): DiaDisponible => ({ fecha, barbero: d.barberos[0] ?? null, error: '' }))
          .catch((err): DiaDisponible => ({ fecha, barbero: null, error: obtenerError(err).mensaje })),
      ),
    ).then((lista) => vigente && setResultado({ clave, dias: lista }));
    return () => {
      vigente = false;
    };
    // "consultar" es fija para cada pantalla: solo se vuelve a pedir si cambia el pedido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const actual = resultado?.clave === clave ? resultado : null;
  return { dias: actual?.dias ?? [], cargando: !!clave && !actual };
}

/** Texto bajo cada día: "12 libres", "Lleno" o "Sin horario" (no trabaja, vacaciones, etc.). */
export function resumenDia(dia: DiaDisponible): { texto: string; libres: number } {
  if (dia.error || !dia.barbero || dia.barbero.motivo) return { texto: 'Sin horario', libres: 0 };
  const libres = dia.barbero.horasLibres.length;
  return { texto: libres > 0 ? `${libres} libres` : 'Lleno', libres };
}
