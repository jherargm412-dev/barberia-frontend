import PageHeader from '../../../../shared/components/PageHeader';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { eliminarExcepcion, obtenerHorario } from '../../api/gestionar_horarios/horariosApi';
import CalendarioSemanal from '../../components/gestionar_horarios/CalendarioSemanal';
import EstadoHorarioChip from '../../components/gestionar_horarios/EstadoHorarioChip';
import ExcepcionesTabla from '../../components/gestionar_horarios/ExcepcionesTabla';
import RegistrarExcepcionDialog from '../../components/gestionar_horarios/RegistrarExcepcionDialog';
import type { Excepcion, HorarioBarberoDetalle } from '../../types/gestionar_horarios';
import { etiquetaTipo, formatearFecha, hhmm } from '../../utils/gestionar_horarios/horarioForm';

/**
 * CU09 4g (ver horario): calendario semanal y excepciones vigentes y futuras.
 * Desde aquí también se registra (4b) y se elimina (4h) una excepción. Tras guardar el horario
 * (paso 8) se llega aquí con el mensaje de éxito y el calendario actualizado.
 */
export default function HorarioDetallePage() {
  const { id } = useParams(); // viene de la ruta /horarios/:id
  const idEmpleado = Number(id);
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [horario, setHorario] = useState<HorarioBarberoDetalle | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Cambiar este número hace que el useEffect vuelva a pedir el horario.
  const [recargar, setRecargar] = useState(0);
  const [registrando, setRegistrando] = useState(false);
  const [porEliminar, setPorEliminar] = useState<Excepcion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    obtenerHorario(idEmpleado)
      .then(setHorario)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idEmpleado, recargar]);

  // 4h: confirmación → elimina → mensaje → se ve la lista actualizada.
  async function confirmarEliminar() {
    if (!porEliminar) return;
    setEliminando(true);
    setError('');
    setMensaje('');
    try {
      const respuesta = await eliminarExcepcion(idEmpleado, porEliminar.idExcepcion);
      setMensaje(respuesta.mensaje);
      setRecargar(recargar + 1);
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setEliminando(false);
      setPorEliminar(null);
    }
  }

  if (!horario) return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;

  const asignado = horario.estadoHorario === 'ASIGNADO';

  return (
    <>
      <PageHeader title={`Horario de ${horario.nombre}`} action={<EstadoHorarioChip estado={horario.estadoHorario} />} />
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Turno base:{' '}
        {horario.turnoBase
          ? `${horario.turnoBase.nombre} (${hhmm(horario.turnoBase.horaEntrada)} – ${hhmm(horario.turnoBase.horaSalida)})`
          : 'sin turno'}
      </Typography>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>
          {mensaje}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<EditCalendarIcon />}
          onClick={() => navigate(`/horarios/${idEmpleado}/editar`)}
        >
          {asignado ? 'Modificar horario' : 'Asignar horario'}
        </Button>
        <Button variant="outlined" startIcon={<EventBusyIcon />} onClick={() => setRegistrando(true)}>
          Registrar excepción
        </Button>
        <Button onClick={() => navigate('/horarios')}>Volver al listado</Button>
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Horario semanal
      </Typography>
      {/* Si no tiene horario, los días del backend son solo una sugerencia: no se muestran como reales. */}
      {asignado ? (
        <CalendarioSemanal dias={horario.dias} />
      ) : (
        <Alert severity="info">Este barbero todavía no tiene horario asignado.</Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Excepciones vigentes y futuras
        </Typography>
        <ExcepcionesTabla excepciones={horario.excepciones} onEliminar={setPorEliminar} />
      </Box>

      {registrando && (
        <RegistrarExcepcionDialog
          idEmpleado={idEmpleado}
          nombre={horario.nombre}
          onCerrar={() => setRegistrando(false)}
          onGuardado={(texto) => {
            setRegistrando(false);
            setMensaje(texto);
            setRecargar(recargar + 1);
          }}
        />
      )}

      <ConfirmDialog
        abierto={porEliminar !== null}
        titulo="Eliminar excepción"
        mensaje={
          porEliminar
            ? `Se eliminará "${etiquetaTipo(porEliminar.tipo)}" del ${formatearFecha(porEliminar.fechaInicio)} al ${formatearFecha(porEliminar.fechaFin)}. El barbero volverá a estar disponible según su horario semanal.`
            : ''
        }
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
