import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import type { CitaAgenda } from '../../types/consultar_agenda';
import { ETIQUETAS_CANAL } from '../../constants/consultar_agenda';
import EstadoAgendaChip from './EstadoAgendaChip';

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

/** Citas en tarjetas: una columna en celular, dos en tablet y tres en computadora. */
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
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {grupo.citas.map((cita) => (
              <CitaTarjeta key={cita.idReserva} cita={cita} onClick={() => onSeleccionar(cita.idReserva)} />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function CitaTarjeta({ cita, onClick }: { cita: CitaAgenda; onClick: () => void }) {
  function alTeclear(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={alTeclear}
      aria-label={`Ver cita de ${cita.cliente.nombre} a las ${cita.horaInicio}`}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        '&:hover, &:focus-visible': { borderColor: 'primary.main', outline: 'none', boxShadow: 1 },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography sx={{ fontWeight: 600 }}>
          {cita.horaInicio} – {cita.horaFin}
        </Typography>
        <EstadoAgendaChip estado={cita.estado} />
      </Stack>
      <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{cita.cliente.nombre}</Typography>
      <Typography variant="body2" color="text.secondary">
        {cita.servicio.nombre} · {ETIQUETAS_CANAL[cita.canal]}
      </Typography>
    </Paper>
  );
}
