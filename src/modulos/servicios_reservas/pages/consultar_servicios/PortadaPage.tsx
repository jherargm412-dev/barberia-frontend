import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import BarraPublica from '../../components/consultar_servicios/BarraPublica';
import ServicioCard from '../../components/consultar_servicios/ServicioCard';
import type { ServicioCatalogo } from '../../types/consultar_servicios';

/**
 * Portada pública (lo primero que ve quien entra sin sesión): presenta la barbería, sus servicios (CU13)
 * y lleva a reservar sin cuenta (CU12) o a iniciar sesión. Con sesión, "/" muestra el inicio del sistema.
 */
export default function PortadaPage() {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<ServicioCatalogo[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogo()
      .then((data) => vigente && setServicios(data))
      .catch(() => vigente && setError('No se pudo cargar el catálogo de servicios. Intente nuevamente.'));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BarraPublica />

      {/* Presentación */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Chip
            icon={<QrCodeIcon />}
            label="Reserva en línea · anticipo por QR"
            color="primary"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 600, mb: 2, maxWidth: 760 }}>
            Tu corte, a la hora que elijas.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 680 }}>
            Elige el servicio, el barbero y un horario libre. Asegura tu turno con un anticipo del 20 % pagado por QR;
            el resto lo pagas en la barbería.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<EventAvailableIcon />}
            onClick={() => navigate('/reservar-sin-cuenta')}
          >
            Reservar cita
          </Button>
        </Container>
      </Box>

      {/* Servicios (CU13) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
            Servicios
          </Typography>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            Precios en bolivianos.
          </Typography>
          <Button onClick={() => navigate('/catalogo')}>Buscar en el catálogo</Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {!servicios && !error && <CircularProgress />}
        {servicios?.length === 0 && <Alert severity="info">No hay servicios disponibles por el momento.</Alert>}
        {servicios && servicios.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {servicios.map((s) => (
              <ServicioCard
                key={s.idServicio}
                servicio={s}
                onReservar={(elegido) => navigate(`/reservar-sin-cuenta?servicio=${elegido.idServicio}`)}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
