import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarServiciosHabilitados } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import { listarBarberos } from '../../api/gestionar_citas/citasApi';
import BarberosDisponibilidad from '../../components/consultar_disponibilidad/BarberosDisponibilidad';
import HorasLibresGrid from '../../components/consultar_disponibilidad/HorasLibresGrid';
import { DURACION_DEFECTO, DURACIONES, PERMISOS } from '../../constants/consultar_disponibilidad';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';
import type { HoraLibre, HorarioDisponible } from '../../types/consultar_disponibilidad';
import type { BarberoDisponible, PrellenadoCita } from '../../types/gestionar_citas';
import { useDisponibilidad } from '../../utils/consultar_disponibilidad/useDisponibilidad';
import {
  calcularAnticipo,
  formatearFecha,
  formatearFechaLarga,
  formatearMonto,
  hoy,
  sumarDias,
} from '../../utils/gestionar_citas/citaForm';

/**
 * CU10 Consultar Disponibilidad: servicio, fecha y opcionalmente barbero → horas libres. Elegir una
 * hora abre "Nueva cita" (CU11) con todo cargado.
 */
export default function DisponibilidadPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();

  const [servicios, setServicios] = useState<ServicioResumen[]>([]);
  const [barberos, setBarberos] = useState<BarberoDisponible[]>([]);
  const [servicioId, setServicioId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [fecha, setFecha] = useState(hoy());
  const [duracion, setDuracion] = useState(DURACION_DEFECTO);
  const [errorCatalogo, setErrorCatalogo] = useState('');
  // Hora de "cualquier barbero" con varios barberos libres: se elige quién en un menú.
  const [eleccion, setEleccion] = useState<{ hora: HorarioDisponible; ancla: HTMLElement } | null>(null);

  useEffect(() => {
    listarServiciosHabilitados()
      .then(setServicios)
      .catch((err) => setErrorCatalogo(obtenerError(err).mensaje));
  }, []);

  /** Paso 1: al elegir el servicio, el filtro de barbero ofrece solo a quienes lo prestan. */
  function cambiarServicio(id: string) {
    setServicioId(id);
    setEmpleadoId('');
    setBarberos([]);
    if (!id) return;
    listarBarberos(Number(id))
      .then(setBarberos)
      .catch((err) => setErrorCatalogo(obtenerError(err).mensaje));
  }

  const { disponibilidad, error, cargando } = useDisponibilidad(
    servicioId && fecha
      ? {
          servicioId: Number(servicioId),
          fecha,
          empleadoId: empleadoId ? Number(empleadoId) : undefined,
          duracion,
        }
      : null,
  );

  const puedeAgendar = tienePermiso(PERMISOS.AGENDAR);

  /** Abre CU11 con servicio, barbero, fecha y horas ya cargados. */
  function agendar(idEmpleado: number, hora: HoraLibre) {
    const prellenado: PrellenadoCita = {
      servicioId: Number(servicioId),
      empleadoId: idEmpleado,
      fecha,
      horaInicio: hora.horaInicio,
      horaFin: hora.horaFin,
    };
    navigate('/citas/nueva', { state: { prellenado } });
  }

  function elegirHora(hora: HorarioDisponible, ancla: HTMLElement) {
    if (hora.barberos.length === 1) agendar(hora.barberos[0].idEmpleado, hora);
    else setEleccion({ hora, ancla });
  }

  const servicio = servicios.find((s) => String(s.idServicio) === servicioId);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Consultar disponibilidad
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            select
            label="Servicio"
            size="small"
            value={servicioId}
            onChange={(e) => cambiarServicio(e.target.value)}
            sx={{ minWidth: 240, flex: 1 }}
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
            size="small"
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            disabled={!servicioId}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Cualquier barbero</MenuItem>
            {barberos.map((b) => (
              <MenuItem key={b.idEmpleado} value={String(b.idEmpleado)}>
                {b.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Duración"
            size="small"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
            sx={{ minWidth: 130 }}
          >
            {DURACIONES.map((d) => (
              <MenuItem key={d.valor} value={d.valor}>
                {d.etiqueta}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Día anterior">
              <span>
                <IconButton onClick={() => setFecha(sumarDias(fecha, -1))} disabled={fecha <= hoy()}>
                  <ChevronLeftIcon />
                </IconButton>
              </span>
            </Tooltip>
            <TextField
              type="date"
              label="Fecha"
              size="small"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: hoy() } }}
            />
            <Tooltip title="Día siguiente">
              <IconButton onClick={() => setFecha(sumarDias(fecha, 1))}>
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {errorCatalogo && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorCatalogo}
        </Alert>
      )}
      {!servicioId && <Alert severity="info">Elija un servicio para ver las horas libres.</Alert>}
      {cargando && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {disponibilidad && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {formatearFechaLarga(disponibilidad.fecha)}
            </Typography>
            <Typography color="text.secondary">
              {disponibilidad.atiende
                ? `Horario de atención ${disponibilidad.horaApertura}–${disponibilidad.horaCierre}`
                : 'La barbería no atiende este día'}
              {servicio &&
                ` · ${servicio.nombre}: ${formatearMonto(servicio.precio)} (anticipo ${formatearMonto(calcularAnticipo(servicio.precio))})`}
            </Typography>
          </Box>

          {disponibilidad.horarios.length === 0 && (
            <Alert
              severity="warning"
              action={
                disponibilidad.proximaFechaDisponible && (
                  <Button color="inherit" size="small" onClick={() => setFecha(disponibilidad.proximaFechaDisponible!)}>
                    Ver {formatearFecha(disponibilidad.proximaFechaDisponible)}
                  </Button>
                )
              }
            >
              No hay horas libres este día.
              {disponibilidad.proximaFechaDisponible
                ? ` La próxima fecha con horas libres es el ${formatearFecha(disponibilidad.proximaFechaDisponible)}.`
                : ' No se encontraron horas libres en los próximos 30 días.'}
            </Alert>
          )}

          {!empleadoId && disponibilidad.horarios.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Cualquier barbero
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {puedeAgendar
                  ? 'Elija una hora para agendar la cita. El número indica cuántos barberos están libres.'
                  : 'El número indica cuántos barberos están libres.'}
              </Typography>
              <HorasLibresGrid
                horas={disponibilidad.horarios}
                onSeleccionar={puedeAgendar ? (h, ancla) => elegirHora(h as HorarioDisponible, ancla) : undefined}
              />
            </Paper>
          )}

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Por barbero
            </Typography>
            <BarberosDisponibilidad
              barberos={disponibilidad.barberos}
              onSeleccionar={puedeAgendar ? (b, h) => agendar(b.idEmpleado, h) : undefined}
            />
          </Box>
        </Stack>
      )}

      <Menu anchorEl={eleccion?.ancla} open={eleccion !== null} onClose={() => setEleccion(null)}>
        {eleccion?.hora.barberos.map((b) => (
          <MenuItem
            key={b.idEmpleado}
            onClick={() => {
              agendar(b.idEmpleado, eleccion.hora);
              setEleccion(null);
            }}
          >
            <ListItemText primary={b.nombre} secondary={`${eleccion.hora.horaInicio}–${eleccion.hora.horaFin}`} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
