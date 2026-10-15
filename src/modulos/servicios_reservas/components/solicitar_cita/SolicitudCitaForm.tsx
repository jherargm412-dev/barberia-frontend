import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarServiciosHabilitados } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import { listarBarberosDelServicio } from '../../api/solicitar_cita/solicitudesApi';
import { MENSAJES_SOLICITUD } from '../../constants/solicitar_cita';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';
import type { BarberoDisponible } from '../../types/gestionar_citas';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';
import { calcularAnticipo, formatearMonto, horaFinSugerida, hoy } from '../../utils/gestionar_citas/citaForm';
import {
  aPedido,
  validarSolicitud,
  valoresInicialesSolicitud,
  type ErroresSolicitud,
  type SolicitudValores,
} from '../../utils/solicitar_cita/solicitudForm';

interface Props {
  /** Envía la solicitud al backend. Si lanza un error, el formulario lo muestra y conserva lo escrito. */
  onGuardar: (datos: SolicitarCitaRequest) => Promise<void>;
  onCancelar: () => void;
}

/** CU12: formulario con el que el cliente elige servicio, barbero, fecha y hora de su cita. */
export default function SolicitudCitaForm({ onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<SolicitudValores>(valoresInicialesSolicitud);
  const [servicios, setServicios] = useState<ServicioResumen[]>([]);
  // null = todavía no se eligió servicio (o se están cargando); [] = ningún barbero lo presta.
  const [barberos, setBarberos] = useState<BarberoDisponible[] | null>(null);
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarServiciosHabilitados()
      .then(setServicios)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }, []);

  function cambiar<K extends keyof SolicitudValores>(campo: K, valor: SolicitudValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  /** Al cambiar de servicio solo se ofrecen los barberos habilitados para él (CU17). */
  function cambiarServicio(servicioId: string) {
    cambiar('servicioId', servicioId);
    cambiar('empleadoId', '');
    setBarberos(null);
    if (!servicioId) return;
    listarBarberosDelServicio(Number(servicioId))
      .then(setBarberos)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }

  /** Propone la hora de fin (inicio + 30 min) mientras el cliente no la haya cambiado a mano. */
  function cambiarHoraInicio(horaInicio: string) {
    const finEraSugerido = !valores.horaFin || valores.horaFin === horaFinSugerida(valores.horaInicio || '00:00');
    cambiar('horaInicio', horaInicio);
    if (horaInicio && finEraSugerido) cambiar('horaFin', horaFinSugerida(horaInicio));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');
    const { mensaje, errores: erroresLocales } = validarSolicitud(valores);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }
    setEnviando(true);
    try {
      await onGuardar(aPedido(valores));
    } catch (err) {
      // Ej.: "El barbero ya tiene una cita en ese horario" o fuera de su turno. Se conserva lo escrito.
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(campos as ErroresSolicitud);
    } finally {
      setEnviando(false);
    }
  }

  const servicio = servicios.find((s) => String(s.idServicio) === valores.servicioId);
  const barbero = barberos?.find((b) => String(b.idEmpleado) === valores.empleadoId);

  let ayudaBarbero = 'Primero elija el servicio';
  if (barberos && barberos.length === 0) ayudaBarbero = MENSAJES_SOLICITUD.SIN_BARBEROS;
  else if (barbero?.turno) ayudaBarbero = `Turno ${barbero.turno}: ${barbero.horaEntrada}–${barbero.horaSalida}`;
  else if (barberos) ayudaBarbero = '';

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3, maxWidth: 720 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Servicio"
            required
            value={valores.servicioId}
            onChange={(e) => cambiarServicio(e.target.value)}
            error={!!errores.servicioId}
            helperText={
              errores.servicioId ??
              (servicio
                ? `Precio ${formatearMonto(servicio.precio)} · anticipo 20 %: ${formatearMonto(calcularAnticipo(servicio.precio))}`
                : ' ')
            }
            sx={{ flex: 1 }}
          >
            {servicios.map((s) => (
              <MenuItem key={s.idServicio} value={String(s.idServicio)}>
                {s.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Barbero"
            required
            value={valores.empleadoId}
            onChange={(e) => cambiar('empleadoId', e.target.value)}
            disabled={!barberos || barberos.length === 0}
            error={!!errores.empleadoId}
            helperText={errores.empleadoId ?? (ayudaBarbero || ' ')}
            sx={{ flex: 1 }}
          >
            {(barberos ?? []).map((b) => (
              <MenuItem key={b.idEmpleado} value={String(b.idEmpleado)}>
                {b.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="date"
            label="Fecha"
            required
            value={valores.fecha}
            onChange={(e) => cambiar('fecha', e.target.value)}
            error={!!errores.fecha}
            helperText={errores.fecha ?? ' '}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: hoy() } }}
          />
          <TextField
            type="time"
            label="Hora de inicio"
            required
            value={valores.horaInicio}
            onChange={(e) => cambiarHoraInicio(e.target.value)}
            error={!!errores.horaInicio}
            helperText={errores.horaInicio ?? ' '}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="time"
            label="Hora de fin"
            required
            value={valores.horaFin}
            onChange={(e) => cambiar('horaFin', e.target.value)}
            error={!!errores.horaFin}
            helperText={errores.horaFin ?? ' '}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>

        <Alert severity="info">{MENSAJES_SOLICITUD.ANTICIPO}</Alert>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Solicitar cita'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}