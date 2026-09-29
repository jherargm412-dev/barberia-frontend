import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { cambiarEstadoBarbero, listarBarberos } from '../../api/gestionar_barberos/barberosApi';
import BarberosFiltros from '../../components/gestionar_barberos/BarberosFiltros';
import BarberosTabla from '../../components/gestionar_barberos/BarberosTabla';
import { PERMISOS } from '../../constants/gestionar_barberos';
import type { Barbero, FiltrosBarberos } from '../../types/gestionar_barberos';

/** CU16 pasos 1–2 (listado de barberos activos e inactivos) y flujo 3b (cambiar estado sin formulario). */
export default function BarberosListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { tienePermiso } = useAuth();

  const [filtros, setFiltros] = useState<FiltrosBarberos>({ q: '', estado: '', page: 0, size: 10 });
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Paso 6: "Barbero registrado correctamente". Puede venir de registrar/modificar o del 3b aquí.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Barbero al que se le va a cambiar el estado (null = diálogo cerrado).
  const [porCambiar, setPorCambiar] = useState<Barbero | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Cada vez que cambian los filtros o la página, volvemos a pedir la lista (paso 7: listado actualizado).
  useEffect(() => {
    listarBarberos(filtros)
      .then((pagina) => {
        setBarberos(pagina.contenido);
        setTotal(pagina.totalElementos);
      })
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [filtros]);

  /** Cambia filtros/página y deja listo el estado de "cargando" para el useEffect. */
  function cambiarFiltros(nuevos: Partial<FiltrosBarberos>) {
    // Siempre es un objeto nuevo, así que el useEffect se vuelve a ejecutar
    // (lo usamos también para actualizar el listado después de cambiar un estado).
    setFiltros({ ...filtros, ...nuevos });
    setCargando(true);
    setError('');
  }

  // 3b: ACTIVO ↔ SUSPENDIDO. Un barbero inactivo (deshabilitado desde CU01) vuelve a ACTIVO.
  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const nuevoEstado = porCambiar.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
      const respuesta = await cambiarEstadoBarbero(porCambiar.idEmpleado, nuevoEstado);
      setMensaje(respuesta.mensaje);
      cambiarFiltros({});
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setPorCambiar(null);
    }
  }

  const vaASuspender = porCambiar?.estado === 'ACTIVO';

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h5">Gestionar barberos</Typography>
        {/* Registrar asigna el rol Barbero: el backend exige además ROL_ASIGNAR. */}
        {tienePermiso(PERMISOS.ASIGNAR_ROL) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/barberos/nuevo')}>
            Registrar barbero
          </Button>
        )}
      </Box>

      {/* Al buscar volvemos a la primera página. */}
      <BarberosFiltros onBuscar={(f) => cambiarFiltros({ ...f, page: 0 })} />

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

      <BarberosTabla
        barberos={barberos}
        total={total}
        pagina={filtros.page}
        tamano={filtros.size}
        onCambiarPagina={(page) => cambiarFiltros({ page })}
        onCambiarTamano={(size) => cambiarFiltros({ size, page: 0 })}
        onCambiarEstado={setPorCambiar}
      />

      <ConfirmDialog
        abierto={porCambiar !== null}
        titulo={vaASuspender ? 'Suspender barbero' : 'Activar barbero'}
        mensaje={
          vaASuspender
            ? `"${porCambiar?.nombre}" quedará suspendido: no se le podrán asignar nuevas citas ni podrá iniciar sesión. Las citas ya agendadas se conservan.`
            : `"${porCambiar?.nombre}" volverá a estar activo y disponible para nuevas citas.`
        }
        textoConfirmar={vaASuspender ? 'Suspender' : 'Activar'}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setPorCambiar(null)}
      />
    </>
  );
}
