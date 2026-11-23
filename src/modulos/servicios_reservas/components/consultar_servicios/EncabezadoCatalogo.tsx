import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { ANCHO_PUBLICO, FUENTE_TITULOS } from '../../../../shared/styles/publico';

interface Props {
  /** Pestaña activa: cada una es su propia ruta (/catalogo y /catalogo/productos). */
  activo: 'servicios' | 'productos';
}

/**
 * Encabezado común del catálogo público: ruta, título y pestañas Servicios / Productos (CU13 y CU23),
 * para que se vean como un solo catálogo.
 */
export default function EncabezadoCatalogo({ activo }: Props) {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ maxWidth: ANCHO_PUBLICO, mx: 'auto', px: { xs: 2, sm: 4 }, pt: { xs: 4, md: 6 }, display: 'flex',
        flexDirection: 'column', gap: 2.5 }}>
        <Breadcrumbs aria-label="Ruta" sx={{ fontSize: 14 }}>
          <Link component={RouterLink} to="/" underline="hover" color="text.secondary">Inicio</Link>
          <Typography color="text.primary" sx={{ fontSize: 14 }}>Catálogo</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 640 }}>
          <Typography component="h1" sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.02em', lineHeight: 1.05, fontSize: { xs: '2.6rem', md: '3.75rem' } }}>
            Catálogo
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 15, md: 17 } }}>
            Servicios para reservar en línea y productos de venta en la barbería. Precios en bolivianos.
          </Typography>
        </Box>
        <Tabs value={activo} aria-label="Tipo de catálogo" sx={{ mt: 1 }}>
          <Tab value="servicios" label="Servicios" component={RouterLink} to="/catalogo" sx={{ fontSize: 16, px: 2.5 }} />
          <Tab value="productos" label="Productos" component={RouterLink} to="/catalogo/productos" sx={{ fontSize: 16, px: 2.5 }} />
        </Tabs>
      </Box>
    </Box>
  );
}
