import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { registrarProducto } from '../../api/gestionar_productos_insumos/productosApi';
import ProductoForm from '../../components/gestionar_productos_insumos/ProductoForm';
import {
  construirRequest,
  VALORES_VACIOS,
  type ProductoFormValores,
} from '../../utils/gestionar_productos_insumos/productoForm';

/** CU22 pasos 3–8: nuevo ítem (formulario vacío). */
export default function ProductoCrearPage() {
  const navigate = useNavigate();

  async function guardar(valores: ProductoFormValores) {
    const respuesta = await registrarProducto(construirRequest(valores));
    // Paso 8: "Ítem registrado" y la lista actualizada.
    navigate('/productos', { state: { mensaje: respuesta.mensaje } });
  }

  return (
    <>
      <PageHeader title="Nuevo ítem" description="El ítem se registra con stock 0 y estado activo." />
      <ProductoForm
        valoresIniciales={VALORES_VACIOS}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/productos')}
      />
    </>
  );
}
