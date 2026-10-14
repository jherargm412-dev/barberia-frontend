import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { CitaAfectada } from '../../types/gestionar_horarios';
import { formatearFecha, hhmm } from '../../utils/gestionar_horarios/horarioForm';

interface Props {
  mensaje: string;
  citas: CitaAfectada[];
}

/**
 * Flujos 7c y 4f: el sistema no guarda y muestra las citas que hay que reprogramar primero.
 * Solo se muestran: este caso de uso no modifica reservas.
 */
export default function CitasAfectadasAlert({ mensaje, citas }: Props) {
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle>{mensaje}</AlertTitle>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Servicio</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {citas.map((c) => (
            <TableRow key={c.idReserva}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatearFecha(c.fecha)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {hhmm(c.horaInicio)} – {hhmm(c.horaFin)}
              </TableCell>
              <TableCell>{c.cliente}</TableCell>
              <TableCell>{c.servicio}</TableCell>
              <TableCell>{c.estado === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Alert>
  );
}
