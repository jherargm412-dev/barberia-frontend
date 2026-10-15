import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '../../../../shared/components/ResponsiveTable';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import type { Excepcion } from '../../types/gestionar_horarios';
import { etiquetaTipo, formatearFecha, hhmm } from '../../utils/gestionar_horarios/horarioForm';

interface Props {
  excepciones: Excepcion[];
  /** 4h: la página pide confirmación y llama al backend. */
  onEliminar: (excepcion: Excepcion) => void;
}

/**
 * 4g: excepciones vigentes y futuras del barbero (el backend ya no devuelve las terminadas,
 * que tampoco se pueden eliminar).
 */
export default function ExcepcionesTabla({ excepciones, onEliminar }: Props) {
  return (
    <Paper>
      <TableContainer>
        <Table columns={["Desde", "Hasta", "Tipo", "Horas", "Motivo", "Acciones"]} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Desde</TableCell>
              <TableCell>Hasta</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {excepciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Sin excepciones vigentes ni futuras
                </TableCell>
              </TableRow>
            )}
            {excepciones.map((e) => (
              <TableRow key={e.idExcepcion} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatearFecha(e.fechaInicio)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatearFecha(e.fechaFin)}</TableCell>
                <TableCell>{etiquetaTipo(e.tipo)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {/* Solo el horario especial tiene horas; las ausencias son el día completo. */}
                  {e.horaEntrada ? `${hhmm(e.horaEntrada)} – ${hhmm(e.horaSalida)}` : 'Todo el día'}
                </TableCell>
                <TableCell>{e.motivo ?? '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar excepción">
                    <IconButton onClick={() => onEliminar(e)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
