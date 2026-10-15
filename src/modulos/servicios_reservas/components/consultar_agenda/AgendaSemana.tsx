import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GRILLA_TARJETAS } from '../../constants/consultar_agenda';
import type { CitaAgenda } from '../../types/consultar_agenda';
import { capitalizar, diasDeLaSemana, formatearDiaSemana, hoy } from '../../utils/consultar_agenda/agendaFormato';
import CitaTarjeta from './CitaTarjeta';

interface Props {
  citas: CitaAgenda[];
  /** Cualquier día de la semana consultada. */
  fecha: string;
  /** Recepción y Administrador ven el barbero de cada cita (el barbero solo ve las suyas). */
  mostrarBarbero: boolean;
  onSeleccionar: (idReserva: number) => void;
}

/** Vista semanal: los siete días de lunes a domingo, cada uno con sus citas en orden de hora. */
export default function AgendaSemana({ citas, fecha, mostrarBarbero, onSeleccionar }: Props) {
  const hoyIso = hoy();

  return (
    <Stack spacing={2} divider={<Divider flexItem />}>
      {diasDeLaSemana(fecha).map((dia) => {
        // Dentro del día, orden cronológico (el backend agrupa por barbero para la vista diaria).
        const delDia = citas
          .filter((c) => c.fecha === dia)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio) || a.idReserva - b.idReserva);
        return (
          <Box key={dia} component="section" aria-label={formatearDiaSemana(dia)}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {capitalizar(formatearDiaSemana(dia))}
              </Typography>
              <Typography color="text.secondary">({delDia.length})</Typography>
              {dia === hoyIso && <Chip label="Hoy" size="small" color="primary" variant="outlined" />}
            </Stack>
            {delDia.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin citas
              </Typography>
            ) : (
              <Box sx={GRILLA_TARJETAS}>
                {delDia.map((cita) => (
                  <CitaTarjeta
                    key={cita.idReserva}
                    cita={cita}
                    mostrarBarbero={mostrarBarbero}
                    onClick={() => onSeleccionar(cita.idReserva)}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
