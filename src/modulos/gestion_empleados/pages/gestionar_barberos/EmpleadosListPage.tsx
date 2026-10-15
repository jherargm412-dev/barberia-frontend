import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import PageHeader from '../../../../shared/components/PageHeader';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { desvincularEmpleado, listarEmpleados, reactivarEmpleado } from '../../api/gestionar_barberos/empleadosApi';
import EmpleadosFiltros from '../../components/gestionar_barberos/EmpleadosFiltros';
import EmpleadosTabla from '../../components/gestionar_barberos/EmpleadosTabla';
import ServiciosEmpleadoDialog from '../../components/gestionar_barberos/ServiciosEmpleadoDialog';
import { PERMISOS_EMPLEADOS } from '../../constants/gestionar_barberos';
import type { EmpleadoResumen, FiltrosEmpleados } from '../../types/gestionar_barberos';

const FILTROS_INICIALES: FiltrosEmpleados = { q: '', rol: 'Barbero', estado: '', tipoContrato: '', page: 0, size: 10 };

/** CU17 paso 1 (listado), paso 4 (servicios, en diálogo) y paso 5 (desvincular / reactivar). */
export default function EmpleadosListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { tienePermiso } = useAuth();
  const puedeRegistrar = tienePermiso(PERMISOS_EMPLEADOS.REGISTRAR);

  const [filtros, setFiltros] = useState<FiltrosEmpleados>(FILTROS_INICIALES);
  const [empleados, setEmpleados] = useState<EmpleadoResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [porCambiar, setPorCambiar] = useState<EmpleadoResumen | null>(null);
  const [conServicios, setConServicios] = useState<EmpleadoResumen | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    listarEmpleados(filtros)
      .then((pagina) => {
        setEmpleados(pagina.contenido);
        setTotal(pagina.totalElementos);
      })
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [filtros]);

  /** Cambia filtros/página; un objeto nuevo siempre vuelve a cargar (también sirve para refrescar). */
  function cambiarFiltros(nuevos: Partial<FiltrosEmpleados>) {
    setFiltros({ ...filtros, ...nuevos });
    setCargando(true);
    setError('');
  }

  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const respuesta =
        porCambiar.estado === 'ACTIVO'
          ? await desvincularEmpleado(porCambiar.idEmpleado)
          : await reactivarEmpleado(porCambiar.idEmpleado);
      setMensaje(respuesta.mensaje);
      cambiarFiltros({});
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setPorCambiar(null);
    }
  }

  const vaADesvincular = porCambiar?.estado === 'ACTIVO';

  return (
    <>
      <PageHeader title="Barberos y empleados" description="Consulta al equipo, sus contratos y los servicios asignados." action={puedeRegistrar && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/empleados/nuevo')}>
            Nuevo empleado
          </Button>
        )} />

      <EmpleadosFiltros iniciales={FILTROS_INICIALES} onBuscar={(f) => cambiarFiltros({ ...f, page: 0 })} />

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

      <EmpleadosTabla mostrarVacio={!cargando && !error}
        empleados={empleados}
        total={total}
        pagina={filtros.page}
        tamano={filtros.size}
        onCambiarPagina={(page) => cambiarFiltros({ page })}
        onCambiarTamano={(size) => cambiarFiltros({ size, page: 0 })}
        onServicios={setConServicios}
        onCambiarEstado={setPorCambiar}
      />

      {/* Se monta solo mientras está abierto: cada apertura empieza con datos frescos. */}
      {conServicios && (
        <ServiciosEmpleadoDialog
          key={conServicios.idEmpleado}
          idEmpleado={conServicios.idEmpleado}
          nombre={conServicios.nombre}
          onCerrar={() => setConServicios(null)}
          onGuardado={(texto) => {
            setConServicios(null);
            setMensaje(texto);
            cambiarFiltros({});
          }}
        />
      )}

      <ConfirmDialog
        abierto={porCambiar !== null}
        titulo={vaADesvincular ? 'Desvincular empleado' : 'Reactivar empleado'}
        mensaje={
          vaADesvincular
            ? `${porCambiar?.nombre} ya no podrá iniciar sesión. Su registro de empleado y sus servicios se conservan para el historial de ventas y comisiones.`
            : `${porCambiar?.nombre} podrá volver a iniciar sesión con su misma cuenta.`
        }
        textoConfirmar={vaADesvincular ? 'Desvincular' : 'Reactivar'}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setPorCambiar(null)}
      />
    </>
  );
}
