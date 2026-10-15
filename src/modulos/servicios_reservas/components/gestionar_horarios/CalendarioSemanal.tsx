import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { DiaHorario } from '../../types/gestionar_horarios';
import { etiquetaDia, hhmm } from '../../utils/gestionar_horarios/horarioForm';

/** Paso 8 y 4g: calendario semanal (solo lectura) con los 7 días. */
export default function CalendarioSemanal({ dias }: { dias: DiaHorario[] }) {
  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Día</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Salida</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dias.map((d) => (
              <TableRow key={d.diaSemana}>
                <TableCell>{etiquetaDia(d.diaSemana)}</TableCell>
                {d.trabaja ? (
                  <>
                    <TableCell>{hhmm(d.horaEntrada)}</TableCell>
                    <TableCell>{hhmm(d.horaSalida)}</TableCell>
                  </>
                ) : (
                  <TableCell colSpan={2}>
                    <Chip label="No trabaja" size="small" variant="outlined" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
