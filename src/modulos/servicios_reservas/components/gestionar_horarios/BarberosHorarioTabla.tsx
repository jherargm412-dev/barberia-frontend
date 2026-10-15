import InboxIcon from '@mui/icons-material/InboxOutlined';
import EmptyState from '../../../../shared/components/EmptyState';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '../../../../shared/components/ResponsiveTable';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import type { BarberoHorarioResumen } from '../../types/gestionar_horarios';
import { hhmm } from '../../utils/gestionar_horarios/horarioForm';
import EstadoHorarioChip from './EstadoHorarioChip';

interface Props {
  mostrarVacio?: boolean;
  barberos: BarberoHorarioResumen[];
  /** 4b: la página abre el diálogo de registrar excepción. */
  onRegistrarExcepcion: (barbero: BarberoHorarioResumen) => void;
}

/**
 * CU09 paso 3: barberos activos con el estado de su horario y las opciones del CU.
 * "Eliminar excepción" (4h) está en "Ver horario", porque primero hay que elegir cuál.
 */
export default function BarberosHorarioTabla({ barberos, onRegistrarExcepcion, mostrarVacio = true }: Props) {
  const navigate = useNavigate();

  return (
    <Paper>
      <TableContainer>
        <Table columns={["Barbero", "Turno base", "Horario", "Acciones"]} sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Barbero</TableCell>
              <TableCell>Turno base</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mostrarVacio && barberos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center"><EmptyState icon={<InboxIcon />} title="No se encontraron barberos activos" description="Prueba con otros filtros o vuelve a consultar más tarde." /></TableCell>
              </TableRow>
            )}
            {barberos.map((b) => {
              const asignado = b.estadoHorario === 'ASIGNADO';
              return (
                <TableRow key={b.idEmpleado} hover>
                  <TableCell>{b.nombre}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {b.turnoBase
                      ? `${b.turnoBase.nombre} (${hhmm(b.turnoBase.horaEntrada)} – ${hhmm(b.turnoBase.horaSalida)})`
                      : 'Sin turno'}
                  </TableCell>
                  <TableCell>
                    <EstadoHorarioChip estado={b.estadoHorario} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {/* Paso 4 (asignar) o 4a (modificar): el mismo formulario. */}
                    <Tooltip title={asignado ? 'Modificar horario' : 'Asignar horario'}>
                      <IconButton
                        color={asignado ? 'default' : 'primary'}
                        onClick={() => navigate(`/horarios/${b.idEmpleado}/editar`)}
                      >
                        <EditCalendarIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver horario">
                      <IconButton onClick={() => navigate(`/horarios/${b.idEmpleado}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Registrar excepción">
                      <IconButton onClick={() => onRegistrarExcepcion(b)}>
                        <EventBusyIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
