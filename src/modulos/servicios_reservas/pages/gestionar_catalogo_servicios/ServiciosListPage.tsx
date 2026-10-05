import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import PageHeader from '../../../../shared/components/PageHeader';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarEstadoServicio, listarServicios } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import ServiciosFiltros from '../../components/gestionar_catalogo_servicios/ServiciosFiltros';
import ServiciosTabla from '../../components/gestionar_catalogo_servicios/ServiciosTabla';
import type { FiltrosServicios, Servicio } from '../../types/gestionar_catalogo_servicios';

/** CU08 paso 3 (listado) y flujo 4a (habilitar / inhabilitar sin formulario). */
export default function ServiciosListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [filtros, setFiltros] = useState<FiltrosServicios>({ q: '', estado: '', page: 0, size: 10 });
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Paso 10: "Servicio guardado correctamente". Puede venir de registrar/modificar o de 4a aquí.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Servicio al que se le va a cambiar el estado (null = diálogo cerrado).
  const [porCambiar, setPorCambiar] = useState<Servicio | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Cada vez que cambian los filtros o la página, volvemos a pedir la lista.
  useEffect(() => {
    listarServicios(filtros)
      .then((pagina) => {
        setServicios(pagina.contenido);
        setTotal(pagina.totalElementos);
      })
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [filtros]);

  /** Cambia filtros/página y deja listo el estado de "cargando" para el useEffect. */
  function cambiarFiltros(nuevos: Partial<FiltrosServicios>) {
    // Siempre es un objeto nuevo, así que el useEffect se vuelve a ejecutar
    // (lo usamos también para "actualizar el listado" después de cambiar un estado).
    setFiltros({ ...filtros, ...nuevos });
    setCargando(true);
    setError('');
  }

  // 4a → 9 → 10: el sistema alterna el estado y actualiza el listado.
  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const nuevoEstado = porCambiar.estado === 'HABILITADO' ? 'INHABILITADO' : 'HABILITADO';
      const respuesta = await cambiarEstadoServicio(porCambiar.idServicio, nuevoEstado);
      setMensaje(respuesta.mensaje);
      cambiarFiltros({});
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setPorCambiar(null);
    }
  }

  const vaAInhabilitar = porCambiar?.estado === 'HABILITADO';

  return (
    <>
      <PageHeader title="Catálogo de servicios" description="Administra los servicios disponibles y sus precios." action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/servicios/nuevo')}>
          Nuevo servicio
        </Button>
      } />

      {/* Al buscar volvemos a la primera página. */}
      <ServiciosFiltros onBuscar={(f) => cambiarFiltros({ ...f, page: 0 })} />

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

      <ServiciosTabla mostrarVacio={!cargando && !error}
        servicios={servicios}
        total={total}
        pagina={filtros.page}
        tamano={filtros.size}
        onCambiarPagina={(page) => cambiarFiltros({ page })}
        onCambiarTamano={(size) => cambiarFiltros({ size, page: 0 })}
        onCambiarEstado={setPorCambiar}
      />

      <ConfirmDialog
        abierto={porCambiar !== null}
        titulo={vaAInhabilitar ? 'Inhabilitar servicio' : 'Habilitar servicio'}
        mensaje={
          vaAInhabilitar
            ? `"${porCambiar?.nombre}" dejará de estar disponible para nuevas reservas y ventas. Las reservas ya registradas se conservan.`
            : `"${porCambiar?.nombre}" volverá a estar disponible para reservas y ventas.`
        }
        textoConfirmar={vaAInhabilitar ? 'Inhabilitar' : 'Habilitar'}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setPorCambiar(null)}
      />
    </>
  );
}
