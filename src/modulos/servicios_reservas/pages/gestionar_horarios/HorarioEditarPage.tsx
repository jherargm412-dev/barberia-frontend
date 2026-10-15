import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listarTurnos } from '../../../gestion_empleados';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { guardarHorario, obtenerHorario, obtenerHorarioAtencion } from '../../api/gestionar_horarios/horariosApi';
import CitasAfectadasAlert from '../../components/gestionar_horarios/CitasAfectadasAlert';
import HorarioSemanalForm from '../../components/gestionar_horarios/HorarioSemanalForm';
import type {
  CitaAfectada,
  DiaHorario,
  HorarioBarberoDetalle,
  TurnoBase,
  VentanaAtencion,
} from '../../types/gestionar_horarios';
import { construirGuardar, hhmm, obtenerCitasAfectadas } from '../../utils/gestionar_horarios/horarioForm';

/** Lo que necesita el formulario; se pide todo junto al entrar. */
interface DatosFormulario {
  horario: HorarioBarberoDetalle;
  turnos: TurnoBase[];
  atencion: VentanaAtencion[];
}

/**
 * CU09 pasos 4–9 (asignar horario) y 4a (modificar horario). Es la misma pantalla: si el barbero
 * no tiene horario, el formulario viene precargado desde su turno base de CU17.
 */
export default function HorarioEditarPage() {
  const { id } = useParams(); // viene de la ruta /horarios/:id/editar
  const idEmpleado = Number(id);
  const navigate = useNavigate();

  const [datos, setDatos] = useState<DatosFormulario | null>(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState('');
  const [erroresDias, setErroresDias] = useState<Record<string, string>>({});
  const [citas, setCitas] = useState<CitaAfectada[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Promise.all espera las tres peticiones a la vez.
    Promise.all([obtenerHorario(idEmpleado), listarTurnos(), obtenerHorarioAtencion()])
      .then(([horario, turnos, atencion]) => setDatos({ horario, turnos, atencion }))
      .catch((err) => setErrorCarga(obtenerError(err).mensaje));
  }, [idEmpleado]);

  async function guardar(dias: DiaHorario[]) {
    setGuardando(true);
    setError('');
    setErroresDias({});
    setCitas([]);
    try {
      const respuesta = await guardarHorario(idEmpleado, construirGuardar(dias));
      // Paso 8: mensaje + calendario semanal actualizado (en la pantalla de "Ver horario").
      navigate(`/horarios/${idEmpleado}`, { state: { mensaje: respuesta.mensaje } });
    } catch (err) {
      // 7a, 7b, 7c, 8a: se queda en el formulario con el mensaje del backend.
      const { mensaje, campos } = obtenerError(err);
      setError(mensaje);
      setErroresDias(campos);
      setCitas(obtenerCitasAfectadas(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  }

  if (errorCarga) return <Alert severity="error">{errorCarga}</Alert>;
  if (!datos) return <CircularProgress />;

  const { horario, turnos, atencion } = datos;
  const turnoBase = horario.turnoBase;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {horario.estadoHorario === 'ASIGNADO' ? 'Modificar horario' : 'Asignar horario'} — {horario.nombre}
      </Typography>

      {/* Paso 5: la sugerencia del turno base no se guarda hasta presionar "Guardar". */}
      {horario.sugerido && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {turnoBase
            ? `Precargado con su turno base "${turnoBase.nombre}" (${hhmm(turnoBase.horaEntrada)} – ${hhmm(turnoBase.horaSalida)}) de lunes a sábado. Revise y presione Guardar.`
            : 'El barbero no tiene turno base: marque los días que trabaja y sus horas.'}
        </Alert>
      )}

      {citas.length > 0 ? (
        <CitasAfectadasAlert mensaje={error} citas={citas} />
      ) : (
        error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )
      )}

      <HorarioSemanalForm
        diasIniciales={horario.dias}
        turnos={turnos}
        atencion={atencion}
        errores={erroresDias}
        guardando={guardando}
        onGuardar={guardar}
        onCancelar={() => navigate('/horarios')}
      />
    </>
  );
}
