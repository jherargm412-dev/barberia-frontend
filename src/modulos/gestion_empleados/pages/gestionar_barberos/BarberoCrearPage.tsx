import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { registrarBarbero } from '../../api/gestionar_barberos/barberosApi';
import BarberoForm from '../../components/gestionar_barberos/BarberoForm';
import {
  construirRequest,
  VALORES_VACIOS,
  type BarberoFormValores,
} from '../../utils/gestionar_barberos/barberoForm';

/** CU16 pasos 3–7: registrar barbero (formulario vacío). */
export default function BarberoCrearPage() {
  const navigate = useNavigate();

  async function guardar(valores: BarberoFormValores) {
    const respuesta = await registrarBarbero(construirRequest(valores, true));
    // Pasos 6–7: "Barbero registrado correctamente" y el listado actualizado con el nuevo trabajador.
    navigate('/barberos', { state: { mensaje: respuesta.mensaje } });
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Registrar barbero
      </Typography>
      <BarberoForm
        valoresIniciales={VALORES_VACIOS}
        esRegistro
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/barberos')}
      />
    </>
  );
}
