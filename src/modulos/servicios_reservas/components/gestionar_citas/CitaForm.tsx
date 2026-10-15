import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import type { Cliente } from '../../../gestion_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarBarberos } from '../../api/gestionar_citas/citasApi';
import { listarServiciosHabilitados } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import { CANALES_RECEPCION } from '../../constants/gestionar_citas';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';
import type { BarberoDisponible, CanalCita, CitaRequest } from '../../types/gestionar_citas';
import {
  calcularAnticipo,
  formatearMonto,
  hoy,
  horaFinSugerida,
  validarCita,
  valoresIniciales,
  type CitaFormValores,
  type ErroresCita,
} from '../../utils/gestionar_citas/citaForm';
import ClienteSelector from './ClienteSelector';

interface Props {
  puedeRegistrarCliente: boolean;
  onGuardar: (datos: CitaRequest) => Promise<void>;
  onCancelar: () => void;
}

/** CU11 paso 1: cliente (o walk-in), servicio, barbero que lo presta, fecha, horas, canal y anticipo. */
export default function CitaForm({ puedeRegistrarCliente, onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<CitaFormValores>(valoresIniciales);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [servicios, setServicios] = useState<ServicioResumen[]>([]);
  const [barberos, setBarberos] = useState<BarberoDisponible[] | null>(null);
  const [errores, setErrores] = useState<ErroresCita>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarServiciosHabilitados()
      .then(setServicios)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }, []);

  function cambiar<K extends keyof CitaFormValores>(campo: K, valor: CitaFormValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function cambiarCliente(nuevo: Cliente | null) {
    setCliente(nuevo);
    cambiar('clienteId', nuevo?.idCliente ?? null);
  }

  /** Al cambiar de servicio solo se ofrecen los barberos habilitados para él (CU17). */
  function cambiarServicio(servicioId: string) {
    cambiar('servicioId', servicioId);
    cambiar('empleadoId', '');
    setBarberos(null);
    if (!servicioId) return;
    listarBarberos(Number(servicioId))
      .then(setBarberos)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }

  /** Sugiere la hora de fin (inicio + 30 min) mientras la recepción no la haya cambiado a mano. */
  function cambiarHoraInicio(horaInicio: string) {
    const finEraSugerido = !valores.horaFin || valores.horaFin === horaFinSugerida(valores.horaInicio || '00:00');
    cambiar('horaInicio', horaInicio);
    if (horaInicio && finEraSugerido) cambiar('horaFin', horaFinSugerida(horaInicio));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');
    const { mensaje, errores: erroresLocales } = validarCita(valores);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }
    setEnviando(true);
    try {
      await onGuardar({
        clienteId: valores.clienteId as number,
        servicioId: Number(valores.servicioId),
        empleadoId: Number(valores.empleadoId),
        fecha: valores.fecha,
        horaInicio: valores.horaInicio,
        horaFin: valores.horaFin,
        canal: valores.canal,
        estado: valores.anticipoPagado ? 'CONFIRMADA' : 'PENDIENTE',
      });
    } catch (err) {
      // Ej.: "El barbero ya tiene una cita en ese horario" o fuera de turno. Se conserva lo escrito.
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(campos as ErroresCita);
    } finally {
      setEnviando(false);
    }
  }

  const servicio = servicios.find((s) => String(s.idServicio) === valores.servicioId);
  const barbero = barberos?.find((b) => String(b.idEmpleado) === valores.empleadoId);

  let ayudaBarbero = 'Primero elija el servicio';
  if (barberos && barberos.length === 0) ayudaBarbero = 'Ningún barbero activo presta este servicio';
  else if (barbero?.turno) ayudaBarbero = `Turno ${barbero.turno}: ${barbero.horaEntrada}–${barbero.horaSalida}`;
  else if (barberos) ayudaBarbero = '';

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 }, maxWidth: 820 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <ClienteSelector
          valor={cliente}
          onCambiar={cambiarCliente}
          error={errores.clienteId}
          puedeRegistrar={puedeRegistrarCliente}
        />

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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          <TextField
            select
            label="Canal"
            required
            value={valores.canal}
            onChange={(e) => cambiar('canal', e.target.value as CanalCita)}
            error={!!errores.canal}
            helperText={errores.canal}
            sx={{ minWidth: 200 }}
          >
            {CANALES_RECEPCION.map((c) => (
              <MenuItem key={c.valor} value={c.valor}>
                {c.etiqueta}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={valores.anticipoPagado}
                onChange={(e) => cambiar('anticipoPagado', e.target.checked)}
              />
            }
            label="El cliente pagó el anticipo ahora (la cita queda Confirmada)"
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={enviando}>
            {enviando ? 'Guardando...' : 'Agendar cita'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
