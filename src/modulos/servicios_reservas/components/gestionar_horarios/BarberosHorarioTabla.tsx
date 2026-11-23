import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../../shared/components/EmptyState';
import type { BarberoHorarioResumen } from '../../types/gestionar_horarios';
import { hhmm } from '../../utils/gestionar_horarios/horarioForm';
import EstadoHorarioChip from './EstadoHorarioChip';

interface Props {
  mostrarVacio?: boolean;
  barberos: BarberoHorarioResumen[];
  /** 4b: la página abre el diálogo de registrar excepción. */
  onRegistrarExcepcion: (barbero: BarberoHorarioResumen) => void;
}

const iniciales = (nombre: string) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/**
 * CU09 paso 3: barberos activos en tarjetas, con su turno base, el estado de su horario y las opciones del CU.
 * "Eliminar excepción" (4h) está en "Ver horario", porque primero hay que elegir cuál.
 */
export default function BarberosHorarioTabla({ barberos, onRegistrarExcepcion, mostrarVacio = true }: Props) {
  const navigate = useNavigate();

  if (mostrarVacio && barberos.length === 0) {
    return (
      <Paper sx={{ py: 2 }}>
        <EmptyState icon={<InboxIcon />} title="No se encontraron barberos activos" description="Prueba con otros filtros o vuelve a consultar más tarde." />
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
      {barberos.map((b) => {
        const asignado = b.estadoHorario === 'ASIGNADO';
        return (
          <Card key={b.idEmpleado} component="article" sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2,
            border: 1, borderColor: asignado ? 'divider' : 'warning.main', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'action.selected', color: 'primary.main', fontWeight: 600,
                fontSize: 14, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {iniciales(b.nombre)}
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{b.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {b.turnoBase
                    ? `${b.turnoBase.nombre} · ${hhmm(b.turnoBase.horaEntrada)} – ${hhmm(b.turnoBase.horaSalida)}`
                    : 'Sin turno base'}
                </Typography>
              </Box>
              <EstadoHorarioChip estado={b.estadoHorario} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 'auto' }}>
              <Button variant={asignado ? 'outlined' : 'contained'} sx={{ borderRadius: 999, flexGrow: 1 }}
                onClick={() => navigate(asignado ? `/horarios/${b.idEmpleado}` : `/horarios/${b.idEmpleado}/editar`)}>
                {asignado ? 'Ver horario' : 'Asignar horario'}
              </Button>
              {/* Paso 4a: modificar (asignar va en el botón principal cuando no tiene horario). */}
              {asignado && (
                <Tooltip title="Modificar horario">
                  <IconButton aria-label={`Modificar horario de ${b.nombre}`} onClick={() => navigate(`/horarios/${b.idEmpleado}/editar`)}
                    sx={{ border: 1, borderColor: 'divider' }}>
                    <EditCalendarIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Registrar excepción">
                <IconButton aria-label={`Registrar excepción de ${b.nombre}`} onClick={() => onRegistrarExcepcion(b)}
                  sx={{ border: 1, borderColor: 'divider' }}>
                  <EventBusyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
