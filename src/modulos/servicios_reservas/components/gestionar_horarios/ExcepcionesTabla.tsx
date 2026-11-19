import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EmptyState from '../../../../shared/components/EmptyState';
import type { Excepcion, TipoExcepcion } from '../../types/gestionar_horarios';
import { etiquetaTipo, formatearFecha, hhmm } from '../../utils/gestionar_horarios/horarioForm';

interface Props {
  excepciones: Excepcion[];
  /** 4h: la página pide confirmación y llama al backend. */
  onEliminar: (excepcion: Excepcion) => void;
}

/** Color de cada tipo: las ausencias en azul/gris, el horario especial en ámbar (el barbero sí atiende). */
const COLOR: Record<TipoExcepcion, 'info' | 'default' | 'secondary' | 'warning'> = {
  VACACIONES: 'info',
  PERMISO: 'secondary',
  DIA_LIBRE: 'default',
  HORARIO_ESPECIAL: 'warning',
};

/**
 * 4g: excepciones vigentes y futuras del barbero como fichas (el backend ya no devuelve las terminadas,
 * que tampoco se pueden eliminar).
 */
export default function ExcepcionesTabla({ excepciones, onEliminar }: Props) {
  if (excepciones.length === 0) {
    return (
      <Paper sx={{ py: 1 }}>
        <EmptyState icon={<EventAvailableIcon />} title="Sin excepciones vigentes ni futuras"
          description="Vacaciones, permisos, días libres y horarios especiales aparecerán aquí." />
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {excepciones.map((e) => {
        const mismoDia = e.fechaInicio === e.fechaFin;
        return (
          <Paper key={e.idExcepcion} component="article" sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', p: 2, borderRadius: 3 }}>
            <Chip size="small" color={COLOR[e.tipo]} variant="outlined" label={etiquetaTipo(e.tipo)} />
            <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {mismoDia ? formatearFecha(e.fechaInicio) : `${formatearFecha(e.fechaInicio)} – ${formatearFecha(e.fechaFin)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flex: '1 1 200px', minWidth: 0, overflowWrap: 'anywhere' }}>
              {/* Solo el horario especial tiene horas; las ausencias son el día completo. */}
              {e.horaEntrada ? `Atiende de ${hhmm(e.horaEntrada)} a ${hhmm(e.horaSalida)}` : 'Todo el día'}
              {e.motivo && ` · ${e.motivo}`}
            </Typography>
            <Tooltip title="Eliminar excepción">
              <IconButton aria-label={`Eliminar ${etiquetaTipo(e.tipo)} del ${formatearFecha(e.fechaInicio)}`} onClick={() => onEliminar(e)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        );
      })}
    </Box>
  );
}
