import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { solicitarCitaInvitado } from '../../api/solicitar_cita/invitadoApi';
import BarraPublica from '../../components/consultar_servicios/BarraPublica';
import SolicitudCitaForm, { type ContactoInvitado } from '../../components/solicitar_cita/SolicitudCitaForm';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';

/**
 * CU12 sin cuenta (pública): quien no tiene cuenta reserva por pasos con su nombre y teléfono. Al confirmar va a
 * "Mi cita" (/mi-cita/:codigo) con el QR ya abierto para pagar el anticipo. Con sesión no hace falta:
 * se lo envía a la reserva de su cuenta.
 */
export default function ReservaInvitadoPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const servicioInicial = Number(useSearchParams()[0].get('servicio')) || undefined;
  const sufijo = servicioInicial ? `?servicio=${servicioInicial}` : '';

  if (usuario) {
    return <Navigate to={`/reservar${sufijo}`} replace />;
  }

  async function guardar(datos: SolicitarCitaRequest, contacto?: ContactoInvitado) {
    const respuesta = await solicitarCitaInvitado({ ...datos, nombre: contacto?.nombre ?? '', telefono: contacto?.telefono ?? '' });
    navigate(`/mi-cita/${respuesta.codigo}`, { state: { mensaje: respuesta.mensaje, pagar: true } });
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BarraPublica />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
          Reservar cita
        </Typography>
        <SolicitudCitaForm
          invitado
          servicioInicial={servicioInicial}
          onGuardar={guardar}
          onIniciarSesion={() => navigate('/login', { state: { desde: `/reservar${sufijo}` } })}
        />
      </Container>
    </Box>
  );
}
