import PageHeader from '../../../../shared/components/PageHeader';

import { useNavigate } from 'react-router-dom';
import { registrarServicio } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import ServicioForm from '../../components/gestionar_catalogo_servicios/ServicioForm';
import {
  construirRequest,
  VALORES_VACIOS,
  type ServicioFormValores,
} from '../../utils/gestionar_catalogo_servicios/servicioForm';

/** CU08 pasos 5–10: registrar servicio (formulario vacío). */
export default function ServicioCrearPage() {
  const navigate = useNavigate();

  async function guardar(valores: ServicioFormValores) {
    const respuesta = await registrarServicio(construirRequest(valores));
    // Paso 10: volvemos al listado actualizado con el mensaje del backend.
    navigate('/servicios', { state: { mensaje: respuesta.mensaje } });
  }

  return (
    <>
      <PageHeader title="Registrar servicio" />
      <ServicioForm
        valoresIniciales={VALORES_VACIOS}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/servicios')}
      />
    </>
  );
}
