import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import ServicioCard from '../../components/consultar_servicios/ServicioCard';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';

/**
 * CU13: Consultar Servicios.
 * Vista pública (sin sesión) que muestra el catálogo de servicios activos.
 * Solo lectura: reservar requiere autenticación (CU12), por eso no hay botones
 * de acción en las tarjetas.
 */
export default function ConsultarServiciosPage() {
  const navigate = useNavigate();

  const [servicios, setServicios] = useState<ServicioResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Paso 2 del CU13: al montar la página consultamos el catálogo público.
  useEffect(() => {
    listarCatalogo()
      .then((data) => setServicios(data))
      .catch(() => setError('No se pudo cargar el catálogo de servicios. Intente nuevamente.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado: botón volver + título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/login')}
        >
          Volver al inicio
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Nuestros Servicios
        </Typography>
      </Box>

      {/* Estado de carga */}
      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Flujo secundario 2a: error de conexión */}
      {!cargando && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Flujo secundario 3a: sin servicios disponibles */}
      {!cargando && !error && servicios.length === 0 && (
        <Alert severity="info">
          No hay servicios disponibles por el momento.
        </Alert>
      )}

      {/* Pasos 3–6: grid de tarjetas con el catálogo ordenado */}
      {!cargando && !error && servicios.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {servicios.map((servicio) => (
            <ServicioCard key={servicio.idServicio} servicio={servicio} />
          ))}
        </Box>
      )}
    </Container>
  );
}