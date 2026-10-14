import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { registrarCita } from '../../api/gestionar_citas/citasApi';
import CitaForm from '../../components/gestionar_citas/CitaForm';
import { PERMISOS } from '../../constants/gestionar_citas';
import type { CitaRequest } from '../../types/gestionar_citas';

/** CU11 paso 1: crear cita presencial, telefónica o por WhatsApp. */
export default function CitaCrearPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();

  async function guardar(datos: CitaRequest) {
    const respuesta = await registrarCita(datos);
    // Volvemos a la agenda, en el día de la cita, con el mensaje del backend.
    navigate('/citas', { state: { mensaje: respuesta.mensaje, fecha: respuesta.reserva.fecha } });
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Nueva cita
      </Typography>
      <CitaForm
        puedeRegistrarCliente={tienePermiso(PERMISOS.CLIENTE_CREAR)}
        onGuardar={guardar}
        onCancelar={() => navigate('/citas')}
      />
    </>
  );
}
