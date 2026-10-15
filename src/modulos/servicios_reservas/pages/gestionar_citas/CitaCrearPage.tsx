import PageHeader from '../../../../shared/components/PageHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { registrarCita } from '../../api/gestionar_citas/citasApi';
import CitaForm from '../../components/gestionar_citas/CitaForm';
import { PERMISOS } from '../../constants/gestionar_citas';
import type { CitaRequest, PrellenadoCita } from '../../types/gestionar_citas';

/** CU11 paso 1: crear cita presencial, telefónica o por WhatsApp. */
export default function CitaCrearPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  // Si viene de CU10 (Consultar disponibilidad), la hora elegida ya llega cargada.
  const prellenado = (useLocation().state as { prellenado?: PrellenadoCita } | null)?.prellenado;

  async function guardar(datos: CitaRequest) {
    const respuesta = await registrarCita(datos);
    // Volvemos a la agenda, en el día de la cita, con el mensaje del backend.
    navigate('/citas', { state: { mensaje: respuesta.mensaje, fecha: respuesta.reserva.fecha } });
  }

  return (
    <>
      <PageHeader title="Nueva cita" description="Completa los datos de la reserva y consulta la disponibilidad." />
      <CitaForm
        puedeRegistrarCliente={tienePermiso(PERMISOS.CLIENTE_CREAR)}
        prellenado={prellenado}
        onGuardar={guardar}
        onCancelar={() => navigate('/citas')}
      />
    </>
  );
}
