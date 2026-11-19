import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { ANCHO_PUBLICO } from '../../../../shared/styles/publico';
import { LogoPublico } from './BarraPublica';

/** Pie de las páginas públicas: logo, año y acceso del personal. */
export default function PiePublico() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
      <Box sx={{ maxWidth: ANCHO_PUBLICO, mx: 'auto', px: { xs: 2, sm: 4 }, py: 3.5, display: 'flex', gap: 2,
        flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoPublico tamano="chico" />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} HOUSE of CUT · Santa Cruz, Bolivia
        </Typography>
        <Link component={RouterLink} to="/login" underline="hover" color="text.secondary" sx={{ fontSize: 14, py: 1 }}>
          Acceso del personal
        </Link>
      </Box>
    </Box>
  );
}
