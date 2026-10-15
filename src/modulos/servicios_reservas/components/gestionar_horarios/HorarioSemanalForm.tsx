import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '../../../../shared/components/ResponsiveTable';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import type { DiaHorario, DiaSemana, TurnoBase, VentanaAtencion } from '../../types/gestionar_horarios';
import { etiquetaDia, hhmm } from '../../utils/gestionar_horarios/horarioForm';

interface Props {
  /** Horario guardado o el sugerido desde el turno base (paso 5). */
  diasIniciales: DiaHorario[];
  /** Catálogo de turnos de CU17 (Mañana, Tarde, Completo). */
  turnos: TurnoBase[];
  /** Horario de atención de la barbería, para mostrarlo como guía. */
  atencion: VentanaAtencion[];
  /** Errores del backend por día (flujo 7b), ej. { LUNES: "Horario inválido: ..." }. */
  errores: Record<string, string>;
  guardando: boolean;
  onGuardar: (dias: DiaHorario[]) => void;
  onCancelar: () => void;
}

/**
 * CU09 paso 5: formulario de horario semanal. Cada día tiene la casilla "Trabaja", el turno y las
 * horas. Elegir un turno solo completa las horas: al backend se envían siempre las horas.
 */
export default function HorarioSemanalForm({
  diasIniciales,
  turnos,
  atencion,
  errores,
  guardando,
  onGuardar,
  onCancelar,
}: Props) {
  // Las horas se guardan como "HH:mm", que es lo que usa <input type="time">.
  const [dias, setDias] = useState<DiaHorario[]>(
    diasIniciales.map((d) => ({ ...d, horaEntrada: hhmm(d.horaEntrada), horaSalida: hhmm(d.horaSalida) })),
  );

  /** Cambia uno o varios campos de un día. */
  function cambiar(dia: DiaSemana, cambios: Partial<DiaHorario>) {
    setDias(dias.map((d) => (d.diaSemana === dia ? { ...d, ...cambios } : d)));
  }

  /** El turno no se guarda: se deduce de las horas. Si no coincide con ninguno es "Personalizado". */
  function turnoDe(d: DiaHorario) {
    const turno = turnos.find((t) => hhmm(t.horaEntrada) === d.horaEntrada && hhmm(t.horaSalida) === d.horaSalida);
    return turno ? String(turno.idTurno) : '';
  }

  function elegirTurno(dia: DiaSemana, idTurno: string) {
    const turno = turnos.find((t) => String(t.idTurno) === idTurno);
    if (turno) cambiar(dia, { horaEntrada: hhmm(turno.horaEntrada), horaSalida: hhmm(turno.horaSalida) });
  }

  function textoAtencion(dia: DiaSemana) {
    const v = atencion.find((a) => a.diaSemana === dia);
    if (!v) return '';
    return v.abierto ? `${hhmm(v.horaApertura)} – ${hhmm(v.horaCierre)}` : 'Cerrado';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onGuardar(dias);
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper>
        <TableContainer>
          <Table columns={["Día", "Trabaja", "Turno", "Entrada", "Salida", "Atención de la barbería"]} size="small" sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell>Día</TableCell>
                <TableCell>Trabaja</TableCell>
                <TableCell>Turno</TableCell>
                <TableCell>Entrada</TableCell>
                <TableCell>Salida</TableCell>
                <TableCell>Atención de la barbería</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dias.map((d) => {
                const error = errores[d.diaSemana];
                return (
                  <TableRow key={d.diaSemana}>
                    <TableCell>{etiquetaDia(d.diaSemana)}</TableCell>
                    <TableCell padding="checkbox">
                      <Checkbox
                        slotProps={{ input: { 'aria-label': `Trabaja el ${etiquetaDia(d.diaSemana)}` } }}
                        checked={d.trabaja}
                        onChange={(e) => cambiar(d.diaSemana, { trabaja: e.target.checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={turnoDe(d)}
                        onChange={(e) => elegirTurno(d.diaSemana, e.target.value)}
                        disabled={!d.trabaja}
                        sx={{ minWidth: 150 }}
                        slotProps={{ select: { displayEmpty: true } }}
                      >
                        <MenuItem value="" disabled>
                          Personalizado
                        </MenuItem>
                        {turnos.map((t) => (
                          <MenuItem key={t.idTurno} value={String(t.idTurno)}>
                            {t.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        slotProps={{ htmlInput: { 'aria-label': `Entrada del ${etiquetaDia(d.diaSemana)}` } }}
                        value={d.horaEntrada ?? ''}
                        onChange={(e) => cambiar(d.diaSemana, { horaEntrada: e.target.value })}
                        disabled={!d.trabaja}
                        error={Boolean(error)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        slotProps={{ htmlInput: { 'aria-label': `Salida del ${etiquetaDia(d.diaSemana)}` } }}
                        value={d.horaSalida ?? ''}
                        onChange={(e) => cambiar(d.diaSemana, { horaSalida: e.target.value })}
                        disabled={!d.trabaja}
                        error={Boolean(error)}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {textoAtencion(d.diaSemana)}
                      {error && (
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
        {/* 6a: descarta los cambios y vuelve al listado. */}
        <Button onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
