import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ThemeModeButton from '../../../../shared/components/ThemeModeButton';
import { ANCHO_PUBLICO, FUENTE_TITULOS, sxPildora } from '../../../../shared/styles/publico';
import { useAuth } from '../../../seguridad_usuarios';

const ENLACES = [
  { texto: 'Servicios', ruta: '/catalogo' },
  { texto: 'Productos', ruta: '/catalogo/productos' },
  { texto: 'Cómo reservar', ruta: '/#como-reservar' },
];

/** Logo de la barbería: tijeras en un círculo dorado + "HOUSE of CUT". */
export function LogoPublico({ tamano = 'normal' }: { tamano?: 'normal' | 'chico' }) {
  const chico = tamano === 'chico';
  return (
    <Box component={RouterLink} to="/" aria-label="HOUSE of CUT, ir al inicio"
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.primary', textDecoration: 'none' }}>
      <Box sx={{ width: chico ? 34 : 40, height: chico ? 34 : 40, borderRadius: '50%', border: 1, borderColor: 'primary.main',
        color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <ContentCutIcon sx={{ fontSize: chico ? 17 : 20 }} />
      </Box>
      <Typography component="span" sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, letterSpacing: '0.14em',
        fontSize: chico ? 17 : { xs: 17, sm: 21 }, whiteSpace: 'nowrap' }}>
        HOUSE <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>of</Box> CUT
      </Typography>
    </Box>
  );
}

/**
 * Barra de las páginas públicas (portada, catálogos, reservar sin cuenta, "Mi cita"): logo a la portada,
 * enlaces a los catálogos, "Reservar" y "Ingresar". Con sesión, "Ir al panel" vuelve al sistema.
 */
export default function BarraPublica() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();

  return (
    <AppBar position="sticky" sx={{ backdropFilter: 'blur(10px)' }}>
      <Toolbar sx={{ width: '100%', maxWidth: ANCHO_PUBLICO, mx: 'auto', gap: { xs: 1, md: 3 }, px: { xs: 2, sm: 4 } }}>
        <Box sx={{ mr: 'auto' }}>
          <LogoPublico />
        </Box>
        <Box component="nav" aria-label="Secciones" sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5 }}>
          {/* Con sesión "/" es el panel, así que "Cómo reservar" (sección de la portada) no aplica. */}
          {ENLACES.filter((e) => !usuario || !e.ruta.startsWith('/#')).map((e) => (
            <Link key={e.ruta} component={RouterLink} to={e.ruta} underline="none"
              aria-current={pathname === e.ruta ? 'page' : undefined}
              sx={{ color: pathname === e.ruta ? 'text.primary' : 'text.secondary', fontWeight: pathname === e.ruta ? 600 : 500,
                fontSize: 15, py: 1.5, '&:hover': { color: 'text.primary' } }}>
              {e.texto}
            </Link>
          ))}
        </Box>
        <ThemeModeButton />
        {/* En celular no entra el texto: el acceso queda como ícono con su nombre accesible. */}
        <IconButton component={RouterLink} to={usuario ? '/' : '/login'} aria-label={usuario ? 'Ir al panel' : 'Ingresar'}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <LoginIcon />
        </IconButton>
        <Button component={RouterLink} to={usuario ? '/' : '/login'} variant="outlined"
          sx={{ ...sxPildora, display: { xs: 'none', sm: 'inline-flex' } }}>
          {usuario ? 'Ir al panel' : 'Ingresar'}
        </Button>
        <Button component={RouterLink} to={usuario ? '/reservar' : '/reservar-sin-cuenta'} variant="contained"
          sx={{ ...sxPildora, px: { xs: 2, sm: 3 } }}>
          Reservar
        </Button>
      </Toolbar>
    </AppBar>
  );
}
