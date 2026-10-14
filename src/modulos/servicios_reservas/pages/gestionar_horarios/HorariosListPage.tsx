import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarBarberosHorario } from '../../api/gestionar_horarios/horariosApi';
import BarberosHorarioTabla from '../../components/gestionar_horarios/BarberosHorarioTabla';
import HorariosFiltros from '../../components/gestionar_horarios/HorariosFiltros';
import RegistrarExcepcionDialog from '../../components/gestionar_horarios/RegistrarExcepcionDialog';
import type { BarberoHorarioResumen, FiltrosHorarios } from '../../types/gestionar_horarios';

/** CU09 paso 3: barberos activos con el estado de su horario y las opciones del caso de uso. */
export default function HorariosListPage() {
  const ubicacion = useLocation();

  const [filtros, setFiltros] = useState<FiltrosHorarios>({ q: '', estadoHorario: '' });
  const [barberos, setBarberos] = useState<BarberoHorarioResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Barbero al que se le registra una excepción (null = diálogo cerrado).
  const [excepcionPara, setExcepcionPara] = useState<BarberoHorarioResumen | null>(null);

  // Cada vez que cambian los filtros volvemos a pedir la lista.
  useEffect(() => {
    listarBarberosHorario(filtros)
      .then(setBarberos)
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [filtros]);

  /** Siempre crea un objeto nuevo, así el useEffect se vuelve a ejecutar (también sirve para recargar). */
  function cambiarFiltros(nuevos: Partial<FiltrosHorarios>) {
    setFiltros({ ...filtros, ...nuevos });
    setCargando(true);
    setError('');
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Horarios de disponibilidad
      </Typography>

      <HorariosFiltros onBuscar={(f) => cambiarFiltros(f)} />

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
      {cargando && <LinearProgress />}

      <BarberosHorarioTabla barberos={barberos} onRegistrarExcepcion={setExcepcionPara} />

      {/* 4b: al guardar, mensaje de éxito y regresa al listado (paso 3). */}
      {excepcionPara && (
        <RegistrarExcepcionDialog
          idEmpleado={excepcionPara.idEmpleado}
          nombre={excepcionPara.nombre}
          onCerrar={() => setExcepcionPara(null)}
          onGuardado={(texto) => {
            setExcepcionPara(null);
            setMensaje(texto);
            cambiarFiltros({});
          }}
        />
      )}
    </>
  );
}
