import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarServiciosHabilitados } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import { listarBarberosDelServicio } from '../../api/solicitar_cita/solicitudesApi';
import { DURACION_DEFECTO } from '../../constants/consultar_disponibilidad';
import { MENSAJES_SOLICITUD } from '../../constants/solicitar_cita';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';
import type { BarberoDisponible } from '../../types/gestionar_citas';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';
import { useDisponibilidad } from '../../utils/consultar_disponibilidad/useDisponibilidad';
import { calcularAnticipo, formatearMonto, hoy } from '../../utils/gestionar_citas/citaForm';
import {
  aPedido,
  validarSolicitud,
  valoresInicialesSolicitud,
  type ErroresSolicitud,
  type SolicitudValores,
} from '../../utils/solicitar_cita/solicitudForm';
import HorasLibresGrid from '../consultar_disponibilidad/HorasLibresGrid';

interface Props {
  /** Envía la solicitud al backend. Si lanza un error, el formulario lo muestra y conserva lo escrito. */
  onGuardar: (datos: SolicitarCitaRequest) => Promise<void>;
  onCancelar: () => void;
}

/**
 * CU12: el cliente elige servicio, barbero y fecha, y después una de las horas libres del barbero (CU10).
 * No escribe horas a mano: así solo puede pedir horarios que de verdad están disponibles.
 */
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
    elegirHora('', '');
    setBarberos(null);
    if (!servicioId) return;
    listarBarberosDelServicio(Number(servicioId))
      .then(setBarberos)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }

  /** La hora sale de la grilla de horas libres; al cambiar barbero o fecha se vuelve a elegir. */
  function elegirHora(horaInicio: string, horaFin: string) {
    cambiar('horaInicio', horaInicio);
    cambiar('horaFin', horaFin);
  }

  // CU10: horas libres del barbero ese día para una cita de 30 minutos.
  const {
    disponibilidad,
    error: errorDisponibilidad,
    cargando: buscandoHoras,
  } = useDisponibilidad(
    valores.servicioId && valores.empleadoId && valores.fecha && valores.fecha >= hoy()
      ? {
          servicioId: Number(valores.servicioId),
          empleadoId: Number(valores.empleadoId),
          fecha: valores.fecha,
          duracion: DURACION_DEFECTO,
        }
      : null,
  );
  const agendaBarbero = disponibilidad?.barberos[0];

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

  let ayudaBarbero = 'Primero elija el servicio';
  if (barberos && barberos.length === 0) ayudaBarbero = MENSAJES_SOLICITUD.SIN_BARBEROS;
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
            onChange={(e) => {
              cambiar('empleadoId', e.target.value);
              elegirHora('', '');
            }}
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

        <TextField
          type="date"
          label="Fecha"
          required
          value={valores.fecha}
          onChange={(e) => {
            cambiar('fecha', e.target.value);
            elegirHora('', '');
          }}
          error={!!errores.fecha}
          helperText={errores.fecha ?? ' '}
          sx={{ maxWidth: 240 }}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: hoy() } }}
        />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Horas libres ({DURACION_DEFECTO} min)
          </Typography>
          {!agendaBarbero && !buscandoHoras && !errorDisponibilidad && (
            <Typography variant="body2" color="text.secondary">
              Elija servicio, barbero y fecha para ver las horas libres
            </Typography>
          )}
          {buscandoHoras && <Typography variant="body2">Buscando horas libres...</Typography>}
          {errorDisponibilidad && <Alert severity="warning">{errorDisponibilidad}</Alert>}
          {agendaBarbero && !agendaBarbero.motivo && (
            <HorasLibresGrid
              horas={agendaBarbero.horasLibres}
              seleccionada={valores.horaInicio}
              textoVacio="El barbero no tiene horas libres este día. Pruebe otra fecha"
              onSeleccionar={(h) => elegirHora(h.horaInicio, h.horaFin)}
            />
          )}
          {agendaBarbero?.motivo && (
            <Typography variant="body2" color="text.secondary">
              {agendaBarbero.motivo}
            </Typography>
          )}
          {(errores.horaInicio || errores.horaFin) && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errores.horaInicio ?? errores.horaFin}
            </Typography>
          )}
          {valores.horaInicio && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Hora elegida: <strong>{valores.horaInicio}–{valores.horaFin}</strong>
            </Typography>
          )}
        </Box>

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