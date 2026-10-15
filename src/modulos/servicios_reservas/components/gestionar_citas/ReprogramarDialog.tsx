import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarBarberos, reprogramarCita } from '../../api/gestionar_citas/citasApi';
import { MENSAJES } from '../../constants/gestionar_citas';
import type { BarberoDisponible, Cita } from '../../types/gestionar_citas';
import {
  formatearMonto,
  hoy,
  minutosEntre,
  sumarMinutos,
  validarHorario,
} from '../../utils/gestionar_citas/citaForm';

interface Props {
  /** La página monta el diálogo solo mientras está abierto. */
  cita: Cita;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

/** CU11 paso 2: nueva fecha, horas y barbero. El anticipo cobrado y el estado se conservan. */
export default function ReprogramarDialog({ cita, onCerrar, onGuardado }: Props) {
  const [barberos, setBarberos] = useState<BarberoDisponible[]>([]);
  const [empleadoId, setEmpleadoId] = useState(cita.barbero ? String(cita.barbero.idEmpleado) : '');
  const [fecha, setFecha] = useState(cita.fecha);
  const [horaInicio, setHoraInicio] = useState(cita.horaInicio);
  const [horaFin, setHoraFin] = useState(cita.horaFin);
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Solo barberos habilitados para el servicio de la cita.
  useEffect(() => {
    listarBarberos(cita.servicio.idServicio)
      .then(setBarberos)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [cita.servicio.idServicio]);

  /** Mantiene la misma duración de la cita al mover la hora de inicio. */
  function cambiarHoraInicio(nueva: string) {
    setHoraInicio(nueva);
    setErrores((e) => ({ ...e, horaInicio: undefined, horaFin: undefined }));
    const duracion = minutosEntre(horaInicio, horaFin);
    if (nueva && duracion > 0) setHoraFin(sumarMinutos(nueva, duracion));
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError('');
    const { errores: horario, hayVacios } = validarHorario(fecha, horaInicio, horaFin);
    const locales: Record<string, string | undefined> = { ...horario };
    if (!empleadoId) locales.empleadoId = 'Obligatorio';
    setErrores(locales);
    const mensajes = Object.values(locales).filter(Boolean);
    if (mensajes.length > 0) {
      setError(hayVacios || !empleadoId ? MENSAJES.CAMPOS_VACIOS : (mensajes[0] as string));
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await reprogramarCita(cita.idReserva, {
        empleadoId: Number(empleadoId),
        fecha,
        horaInicio,
        horaFin,
      });
      onGuardado(respuesta.mensaje);
    } catch (err) {
      const { mensaje, campos } = obtenerError(err);
      setError(mensaje);
      setErrores(campos);
    } finally {
      setGuardando(false);
    }
  }

  const barbero = barberos.find((b) => String(b.idEmpleado) === empleadoId);

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <form onSubmit={guardar} noValidate>
        <DialogTitle>Reprogramar cita</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {cita.cliente.nombre} · {cita.servicio.nombre}. Se conservan el estado y el anticipo (
            {formatearMonto(cita.montoAnticipo)}).
          </DialogContentText>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              select
              label="Barbero"
              required
              value={empleadoId}
              onChange={(e) => {
                setEmpleadoId(e.target.value);
                setErrores((x) => ({ ...x, empleadoId: undefined }));
              }}
              error={!!errores.empleadoId}
              helperText={
                errores.empleadoId ??
                (barbero?.turno ? `Turno ${barbero.turno}: ${barbero.horaEntrada}–${barbero.horaSalida}` : ' ')
              }
            >
              {barberos.map((b) => (
                <MenuItem key={b.idEmpleado} value={String(b.idEmpleado)}>
                  {b.nombre}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Fecha"
                required
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setErrores((x) => ({ ...x, fecha: undefined }));
                }}
                error={!!errores.fecha}
                helperText={errores.fecha ?? ' '}
                sx={{ flex: 1 }}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: hoy() } }}
              />
              <TextField
                type="time"
                label="Inicio"
                required
                value={horaInicio}
                onChange={(e) => cambiarHoraInicio(e.target.value)}
                error={!!errores.horaInicio}
                helperText={errores.horaInicio ?? ' '}
                sx={{ flex: 1 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="time"
                label="Fin"
                required
                value={horaFin}
                onChange={(e) => {
                  setHoraFin(e.target.value);
                  setErrores((x) => ({ ...x, horaFin: undefined }));
                }}
                error={!!errores.horaFin}
                helperText={errores.horaFin ?? ' '}
                sx={{ flex: 1 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Reprogramar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
