import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarDisponibilidad } from '../../api/consultar_disponibilidad/disponibilidadApi';
import type { ConsultaDisponibilidad, Disponibilidad } from '../../types/consultar_disponibilidad';

interface Resultado {
  clave: string;
  datos: Disponibilidad | null;
  error: string;
}

/**
 * Pide la disponibilidad (CU10) cada vez que cambia la consulta. Con {@code consulta} null no consulta
 * (faltan datos). Las respuestas de una consulta anterior se descartan, así no "parpadea" una vieja.
 */
export function useDisponibilidad(
  consulta: ConsultaDisponibilidad | null,
  // El invitado sin cuenta usa la ruta pública; el resto, la de CU10 con sesión.
  consultar: (c: ConsultaDisponibilidad) => Promise<Disponibilidad> = consultarDisponibilidad,
) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  // La consulta como texto: el efecto solo vuelve a correr si de verdad cambió algún dato.
  const clave = consulta ? JSON.stringify(consulta) : '';

  useEffect(() => {
    if (!clave) return;
    let vigente = true;
    consultar(JSON.parse(clave) as ConsultaDisponibilidad)
      .then((datos) => vigente && setResultado({ clave, datos, error: '' }))
      .catch((err) => vigente && setResultado({ clave, datos: null, error: obtenerError(err).mensaje }));
    return () => {
      vigente = false;
    };
    // "consultar" es fija para cada pantalla: solo se vuelve a pedir si cambia la consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const actual = resultado?.clave === clave ? resultado : null;
  return {
    disponibilidad: actual?.datos ?? null,
    error: actual?.error ?? '',
    cargando: !!clave && !actual,
  };
}
