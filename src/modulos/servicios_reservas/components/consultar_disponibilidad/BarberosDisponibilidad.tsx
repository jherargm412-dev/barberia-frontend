import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { DisponibilidadBarbero, HoraLibre } from '../../types/consultar_disponibilidad';
import HorasLibresGrid from './HorasLibresGrid';

interface Props {
  barberos: DisponibilidadBarbero[];
  onSeleccionar?: (barbero: DisponibilidadBarbero, hora: HoraLibre) => void;
}

/** CU10: agenda libre de cada barbero ese día, con su jornada o el motivo por el que no atiende. */
export default function BarberosDisponibilidad({ barberos, onSeleccionar }: Props) {
  if (barberos.length === 0) {
    return (
      <Typography color="text.secondary">Ningún barbero activo presta este servicio.</Typography>
    );
  }
  return (
    <Stack spacing={2}>
      {barberos.map((b) => (
        <Paper key={b.idEmpleado} variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mb: 1.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {b.nombre}
            </Typography>
            {b.motivo ? (
              <Chip label={b.motivo} size="small" color="default" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Atiende {b.jornadaInicio}–{b.jornadaFin} · {b.horasLibres.length}{' '}
                {b.horasLibres.length === 1 ? 'hora libre' : 'horas libres'}
              </Typography>
            )}
          </Stack>
          {!b.motivo && (
            <HorasLibresGrid
              horas={b.horasLibres}
              textoVacio="Agenda llena este día"
              onSeleccionar={onSeleccionar ? (h) => onSeleccionar(b, h) : undefined}
            />
          )}
        </Paper>
      ))}
    </Stack>
  );
}
