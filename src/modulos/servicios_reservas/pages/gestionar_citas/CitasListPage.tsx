import PageHeader from '../../../../shared/components/PageHeader';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarEstadoCita, listarBarberos, listarCitas } from '../../api/gestionar_citas/citasApi';
import CitasFiltros from '../../components/gestionar_citas/CitasFiltros';
import CitasTabla from '../../components/gestionar_citas/CitasTabla';
import ReprogramarDialog from '../../components/gestionar_citas/ReprogramarDialog';
import ComprobanteAnticipo from '../../components/registrar_pago_anticipo/ComprobanteAnticipo';
import RegistrarAnticipoDialog from '../../components/registrar_pago_anticipo/RegistrarAnticipoDialog';
import { ACCIONES_ESTADO, PERMISOS } from '../../constants/gestionar_citas';
import { PERMISOS_ANTICIPO } from '../../constants/registrar_pago_anticipo';
import type { AccionEstado, BarberoDisponible, Cita, FiltrosCitas } from '../../types/gestionar_citas';
import type { PagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearFechaLarga, hoy } from '../../utils/gestionar_citas/citaForm';

/** CU11: agenda del día con alta, reprogramación y cambio de estado de las citas. */
export default function CitasListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { tienePermiso } = useAuth();
  const estadoNavegacion = ubicacion.state as { mensaje?: string; fecha?: string; nueva?: Cita } | null;

  // Al volver de "Nueva cita" se abre el día de la cita recién creada.
  const [filtros, setFiltros] = useState<FiltrosCitas>({
    fecha: estadoNavegacion?.fecha ?? hoy(),
    empleadoId: '',
    estado: '',
    q: '',
    page: 0,
    size: 20,
  });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [total, setTotal] = useState(0);
  const [barberos, setBarberos] = useState<BarberoDisponible[]>([]);
  const [pendientesHoy, setPendientesHoy] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(estadoNavegacion?.mensaje ?? '');
  // Cita recién creada: queda Pendiente hasta cobrar su anticipo (Confirmar = cobrar).
  const [recienCreada, setRecienCreada] = useState<Cita | null>(estadoNavegacion?.nueva ?? null);
  const [porCambiar, setPorCambiar] = useState<{ cita: Cita; accion: AccionEstado } | null>(null);
  const [reprogramando, setReprogramando] = useState<Cita | null>(null);
  const [cobrando, setCobrando] = useState<Cita | null>(null);
  const [comprobante, setComprobante] = useState<PagoAnticipo | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    listarBarberos()
      .then(setBarberos)
      .catch(() => setBarberos([]));
  }, []);

  useEffect(() => {
    listarCitas(filtros)
      .then((pagina) => {
        setCitas(pagina.contenido);
        setTotal(pagina.totalElementos);
      })
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));

    // Alerta de recepción: citas de hoy que siguen pendientes de confirmación.
    listarCitas({ fecha: hoy(), empleadoId: '', estado: 'PENDIENTE', q: '', page: 0, size: 1 })
      .then((pagina) => setPendientesHoy(pagina.totalElementos))
      .catch(() => setPendientesHoy(0));
  }, [filtros]);

  /** Cambia filtros/página; un objeto nuevo siempre vuelve a pedir la agenda (también tras un cambio). */
  function cambiarFiltros(nuevos: Partial<FiltrosCitas>) {
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
      const respuesta = await cambiarEstadoCita(porCambiar.cita.idReserva, porCambiar.accion);
      setMensaje(respuesta.mensaje);
      cambiarFiltros({});
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setPorCambiar(null);
    }
  }

  const accion = porCambiar ? ACCIONES_ESTADO[porCambiar.accion] : null;
  const verPendientesDeHoy = filtros.fecha === hoy() && filtros.estado === 'PENDIENTE';

  return (
    <>
      <PageHeader title="Citas" description={filtros.fecha ? formatearFechaLarga(filtros.fecha) : 'Consulta y gestiona las reservas.'}
        action={tienePermiso(PERMISOS.CREAR) && <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/citas/nueva')}>Nueva cita</Button>} />

      {pendientesHoy > 0 && !verPendientesDeHoy && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => cambiarFiltros({ fecha: hoy(), estado: 'PENDIENTE', page: 0 })}>
              Ver
            </Button>
          }
        >
          {pendientesHoy === 1
            ? 'Hay 1 cita de hoy pendiente de confirmación'
            : `Hay ${pendientesHoy} citas de hoy pendientes de confirmación`}
        </Alert>
      )}

      {/* Cualquier filtro vuelve a la primera página. */}
      <CitasFiltros filtros={filtros} barberos={barberos} onCambiar={(f) => cambiarFiltros({ ...f, page: 0 })} />

      {mensaje && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => {
            setMensaje('');
            setRecienCreada(null);
          }}
          action={
            recienCreada && tienePermiso(PERMISOS_ANTICIPO.COBRAR) ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setCobrando(recienCreada);
                  setRecienCreada(null);
                }}
              >
                Cobrar anticipo ahora
              </Button>
            ) : undefined
          }
        >
          {mensaje}
          {recienCreada && ' La cita queda Pendiente hasta cobrar el anticipo.'}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {cargando && <LinearProgress />}

      <CitasTabla
        citas={citas}
        mostrarVacio={!cargando && !error}
        total={total}
        pagina={filtros.page}
        tamano={filtros.size}
        tienePermiso={tienePermiso}
        onCambiarPagina={(page) => cambiarFiltros({ page })}
        onCambiarTamano={(size) => cambiarFiltros({ size, page: 0 })}
        onReprogramar={setReprogramando}
        onCobrarAnticipo={setCobrando}
        onCobrarVenta={(cita) => navigate('/ventas/registrar', { state: { reservaId: cita.idReserva } })}
        onCambiarEstado={(cita, accionElegida) => setPorCambiar({ cita, accion: accionElegida })}
      />

      <ConfirmDialog
        abierto={porCambiar !== null}
        titulo={accion?.titulo ?? ''}
        mensaje={
          porCambiar
            ? `${porCambiar.cita.cliente.nombre} · ${porCambiar.cita.horaInicio} · ${porCambiar.cita.servicio.nombre}. ${accion?.mensaje}`
            : ''
        }
        textoConfirmar={accion?.boton}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setPorCambiar(null)}
      />

      {reprogramando && (
        <ReprogramarDialog
          cita={reprogramando}
          onCerrar={() => setReprogramando(null)}
          onGuardado={(texto) => {
            setReprogramando(null);
            setMensaje(texto);
            cambiarFiltros({});
          }}
        />
      )}

      {cobrando && (
        <RegistrarAnticipoDialog
          cita={cobrando}
          onCerrar={() => setCobrando(null)}
          onCobrado={(respuesta) => {
            setCobrando(null);
            setRecienCreada(null);
            setMensaje(respuesta.mensaje);
            setComprobante(respuesta.pago);
            cambiarFiltros({});
          }}
        />
      )}

      {comprobante && <ComprobanteAnticipo pago={comprobante} onCerrar={() => setComprobante(null)} />}
    </>
  );
}
