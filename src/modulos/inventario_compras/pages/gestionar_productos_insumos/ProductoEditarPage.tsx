import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarProducto, modificarProducto } from '../../api/gestionar_productos_insumos/productosApi';
import EstadoProductoChip from '../../components/gestionar_productos_insumos/EstadoProductoChip';
import ProductoForm from '../../components/gestionar_productos_insumos/ProductoForm';
import type { Producto } from '../../types/gestionar_productos_insumos';
import {
  construirRequest,
  valoresDesdeProducto,
  type ProductoFormValores,
} from '../../utils/gestionar_productos_insumos/productoForm';

/** CU22 flujo Modificar: el sistema muestra los datos del ítem y el administrador los cambia. */
export default function ProductoEditarPage() {
  const { id } = useParams(); // viene de la ruta /productos/:id/editar
  const idProducto = Number(id);
  const navigate = useNavigate();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarProducto(idProducto)
      .then(setProducto)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idProducto]);

  async function guardar(valores: ProductoFormValores) {
    const respuesta = await modificarProducto(idProducto, construirRequest(valores));
    navigate('/productos', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!producto) return <CircularProgress />;

  return (
    <>
      <PageHeader title="Editar ítem" description={`Stock actual: ${producto.stockActual}`} action={<EstadoProductoChip activo={producto.activo} />} />
      {/* El estado no se cambia aquí: se hace desde el listado (Habilitar / Deshabilitar). */}
      <ProductoForm
        valoresIniciales={valoresDesdeProducto(producto)}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/productos')}
      />
    </>
  );
}
