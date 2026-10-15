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
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarBarberos, reprogramarCita } from '../../api/gestionar_citas/citasApi';
import { DURACION_DEFECTO } from '../../constants/consultar_disponibilidad';
import { MENSAJES } from '../../constants/gestionar_citas';
import type { BarberoDisponible, Cita } from '../../types/gestionar_citas';
import { useDisponibilidad } from '../../utils/consultar_disponibilidad/useDisponibilidad';
import {
  formatearMonto,
  hoy,
  minutosEntre,
  sumarMinutos,
  validarHorario,
} from '../../utils/gestionar_citas/citaForm';
import HorasLibresGrid from '../consultar_disponibilidad/HorasLibresGrid';

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

  // CU10: horas libres del barbero ese día con la duración original de la cita; la propia cita no cuenta.
  const duracionCita = minutosEntre(cita.horaInicio, cita.horaFin);
  const duracion =
    duracionCita >= 15 && duracionCita <= 240 && duracionCita % 5 === 0 ? duracionCita : DURACION_DEFECTO;
  const { disponibilidad, error: errorDisponibilidad, cargando: buscandoHoras } = useDisponibilidad(
    empleadoId && fecha && fecha >= hoy()
      ? {
          servicioId: cita.servicio.idServicio,
          empleadoId: Number(empleadoId),
          fecha,
          duracion,
          excluirReserva: cita.idReserva,
        }
      : null,
  );
  const agenda = disponibilidad?.barberos[0];

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
                (agenda?.motivo ?? (agenda ? `Atiende ${agenda.jornadaInicio}–${agenda.jornadaFin} este día` : ' '))
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
            {empleadoId && (
              <div>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Horas libres ({duracion} min)
                </Typography>
                {buscandoHoras && <Typography variant="body2">Buscando horas libres...</Typography>}
                {errorDisponibilidad && <Alert severity="warning">{errorDisponibilidad}</Alert>}
                {agenda && !agenda.motivo && (
                  <HorasLibresGrid
                    horas={agenda.horasLibres}
                    seleccionada={horaInicio}
                    textoVacio="El barbero no tiene horas libres este día"
                    onSeleccionar={(h) => {
                      setHoraInicio(h.horaInicio);
                      setHoraFin(h.horaFin);
                      setErrores((x) => ({ ...x, horaInicio: undefined, horaFin: undefined }));
                    }}
                  />
                )}
              </div>
            )}
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
