import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarEstadoProducto, listarProductos } from '../../api/gestionar_productos_insumos/productosApi';
import AjusteStockDialog from '../../components/gestionar_productos_insumos/AjusteStockDialog';
import ProductoDetalleDialog from '../../components/gestionar_productos_insumos/ProductoDetalleDialog';
import ProductosTabla from '../../components/gestionar_productos_insumos/ProductosTabla';
import type { Producto } from '../../types/gestionar_productos_insumos';

/** CU22 paso 2 (listado) y flujos Consultar, Habilitar, Deshabilitar y Ajustar stock. */
export default function ProductosListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Paso 8: "Ítem registrado" / "Ítem actualizado" llegan desde el formulario; los de estado, de aquí.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Cambia de valor para volver a pedir la lista ("lista actualizada").
  const [recargar, setRecargar] = useState(0);
  // Ítem que se está viendo (null = detalle cerrado).
  const [viendo, setViendo] = useState<Producto | null>(null);
  // Ítem al que se le va a cambiar el estado. Se guarda aparte de "confirmando" para que el
  // diálogo no cambie su texto mientras se cierra.
  const [porCambiar, setPorCambiar] = useState<Producto | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  // Ítem cuyo stock se va a ajustar. "vecesAjuste" vuelve a montar el diálogo para que empiece vacío.
  const [porAjustar, setPorAjustar] = useState<Producto | null>(null);
  const [ajustando, setAjustando] = useState(false);
  const [vecesAjuste, setVecesAjuste] = useState(0);

  useEffect(() => {
    listarProductos()
      .then(setProductos)
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [recargar]);

  function actualizarLista() {
    setCargando(true);
    setError('');
    setRecargar((n) => n + 1);
  }

  // Habilitar / Deshabilitar: el sistema pide confirmación, cambia el estado y muestra el mensaje.
  function pedirConfirmacion(producto: Producto) {
    setPorCambiar(producto);
    setConfirmando(true);
  }

  function abrirAjuste(producto: Producto) {
    setPorAjustar(producto);
    setVecesAjuste((n) => n + 1);
    setAjustando(true);
  }

  function ajusteGuardado(mensajeBackend: string) {
    setAjustando(false);
    setError('');
    setMensaje(mensajeBackend);
    actualizarLista();
  }

  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const respuesta = await cambiarEstadoProducto(porCambiar.idProducto, !porCambiar.activo);
      setMensaje(respuesta.mensaje);
      actualizarLista();
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setConfirmando(false);
    }
  }

  const vaADeshabilitar = porCambiar?.activo === true;

  return (
    <>
      <PageHeader title="Productos e insumos" description="Registra los productos de venta y los insumos de consumo interno." action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/productos/nuevo')}>
          Nuevo ítem
        </Button>
      } />

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

      <ProductosTabla
        mostrarVacio={!cargando && !error}
        productos={productos}
        onVer={setViendo}
        onCambiarEstado={pedirConfirmacion}
        onAjustarStock={abrirAjuste}
      />

      <AjusteStockDialog
        key={vecesAjuste}
        abierto={ajustando}
        producto={porAjustar}
        onCerrar={() => setAjustando(false)}
        onAjustado={ajusteGuardado}
      />

      <ProductoDetalleDialog producto={viendo} onCerrar={() => setViendo(null)} />

      <ConfirmDialog
        abierto={confirmando}
        titulo={vaADeshabilitar ? 'Deshabilitar ítem' : 'Habilitar ítem'}
        mensaje={
          vaADeshabilitar
            ? `"${porCambiar?.nombre}" quedará inactivo y no se podrá usar en nuevas ventas ni compras.`
            : `"${porCambiar?.nombre}" volverá a estar activo.`
        }
        textoConfirmar={vaADeshabilitar ? 'Deshabilitar' : 'Habilitar'}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setConfirmando(false)}
      />
    </>
  );
}
