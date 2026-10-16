import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { solicitarCitaInvitado } from '../../api/solicitar_cita/invitadoApi';
import SolicitudCitaForm, { type ContactoInvitado } from '../../components/solicitar_cita/SolicitudCitaForm';
import { MENSAJES_SOLICITUD } from '../../constants/solicitar_cita';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';

/**
 * CU12 sin cuenta (pública): quien no tiene cuenta reserva con su nombre y teléfono. Al terminar va a
 * "Mi cita" (/mi-cita/:codigo), su enlace para ver la cita y pagar el anticipo. Con sesión no hace falta:
 * se lo envía al formulario de su cuenta.
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
    navigate(`/mi-cita/${respuesta.codigo}`, { state: { mensaje: respuesta.mensaje } });
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/catalogo')}>
          Ver servicios
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Reservar cita
        </Typography>
      </Box>

      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/login', { state: { desde: `/reservar${sufijo}` } })}
          >
            Iniciar sesión
          </Button>
        }
      >
        ¿Tiene cuenta? Inicie sesión para reservar con ella. Si no, complete su nombre y teléfono.
      </Alert>

      <SolicitudCitaForm
        invitado
        servicioInicial={servicioInicial}
        onGuardar={guardar}
        onCancelar={() => navigate('/catalogo')}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {MENSAJES_SOLICITUD.ANTICIPO}
      </Typography>
    </Container>
  );
}
