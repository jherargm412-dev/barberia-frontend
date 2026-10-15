import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GRILLA_TARJETAS } from '../../constants/consultar_agenda';
import type { CitaAgenda } from '../../types/consultar_agenda';
import CitaTarjeta from './CitaTarjeta';

interface Props {
  citas: CitaAgenda[];
  /** Recepción y Administrador: las citas se agrupan por barbero. El barbero ve una sola lista. */
  agrupar: boolean;
  onSeleccionar: (idReserva: number) => void;
}

interface Grupo {
  clave: number | null;
  titulo: string;
  citas: CitaAgenda[];
}

/** Agrupa en el orden que llega (el backend ya ordena por barbero y hora). */
function agruparPorBarbero(citas: CitaAgenda[]): Grupo[] {
  const grupos: Grupo[] = [];
  for (const cita of citas) {
    const clave = cita.barbero?.idEmpleado ?? null;
    const existente = grupos.find((g) => g.clave === clave);
    if (existente) {
      existente.citas.push(cita);
    } else {
      grupos.push({ clave, titulo: cita.barbero?.nombre ?? 'Sin asignar', citas: [cita] });
    }
  }
  return grupos;
}

/** Vista diaria: citas del día en tarjetas, agrupadas por barbero para recepción. */
export default function AgendaLista({ citas, agrupar, onSeleccionar }: Props) {
  const grupos: Grupo[] = agrupar ? agruparPorBarbero(citas) : [{ clave: null, titulo: '', citas }];

  return (
    <Stack spacing={3}>
      {grupos.map((grupo) => (
        <Box key={grupo.clave ?? 'sin-asignar'}>
          {agrupar && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {grupo.titulo}{' '}
              <Typography component="span" color="text.secondary">
                ({grupo.citas.length})
              </Typography>
            </Typography>
          )}
          <Box sx={GRILLA_TARJETAS}>
            {grupo.citas.map((cita) => (
              <CitaTarjeta
                key={cita.idReserva}
                cita={cita}
                mostrarBarbero={false}
                onClick={() => onSeleccionar(cita.idReserva)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
