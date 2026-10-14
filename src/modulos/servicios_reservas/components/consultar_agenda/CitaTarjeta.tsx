import PhoneIcon from '@mui/icons-material/Phone';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import { ETIQUETAS_CANAL, MENSAJES_AGENDA } from '../../constants/consultar_agenda';
import type { CitaAgenda } from '../../types/consultar_agenda';
import { formatearMonto } from '../../utils/consultar_agenda/agendaFormato';
import EstadoAgendaChip from './EstadoAgendaChip';

interface Props {
  cita: CitaAgenda;
  /** En la vista semanal las citas no van agrupadas por barbero: el nombre va en la tarjeta. */
  mostrarBarbero: boolean;
  onClick: () => void;
}

/**
 * Una cita: horario, estado, cliente con teléfono, servicio y anticipo. Sin CU14 no hay registro de
 * pagos, así que se muestra el monto y se aclara que el estado del pago no está disponible.
 */
export default function CitaTarjeta({ cita, mostrarBarbero, onClick }: Props) {
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
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
        <PhoneIcon sx={{ fontSize: 16 }} aria-hidden />
        <Typography variant="body2">{cita.cliente.telefono ?? 'Sin teléfono'}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {cita.servicio.nombre} · {ETIQUETAS_CANAL[cita.canal]}
      </Typography>
      {mostrarBarbero && (
        <Typography variant="body2" color="text.secondary">
          Barbero: {cita.barbero?.nombre ?? 'Sin asignar'}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Anticipo {formatearMonto(cita.montoAnticipo)} · {MENSAJES_AGENDA.PAGO_NO_DISPONIBLE}
      </Typography>
    </Paper>
  );
}
