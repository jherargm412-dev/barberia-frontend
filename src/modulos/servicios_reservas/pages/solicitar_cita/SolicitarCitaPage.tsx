import Typography from '@mui/material/Typography';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { solicitarCita } from '../../api/solicitar_cita/solicitudesApi';
import SolicitudCitaForm from '../../components/solicitar_cita/SolicitudCitaForm';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';

/**
 * CU12: el cliente solicita su cita desde la web, por pasos. Queda PENDIENTE y se pasa directo al pago del
 * anticipo (CU14); si lo deja para después, lo encuentra en "Mis citas".
 */
export default function SolicitarCitaPage() {
  const navigate = useNavigate();
  // Servicio elegido en el catálogo (CU13): /solicitar-cita?servicio=ID.
  const servicioInicial = Number(useSearchParams()[0].get('servicio')) || undefined;

  async function guardar(datos: SolicitarCitaRequest) {
    const { mensaje, reserva } = await solicitarCita(datos);
    navigate(`/pagar-anticipo/${reserva.idReserva}`, { state: { mensaje, pagarAntesDe: reserva.pagarAntesDe } });
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Solicitar cita
      </Typography>
      <SolicitudCitaForm servicioInicial={servicioInicial} onGuardar={guardar} />
    </>
  );
}
