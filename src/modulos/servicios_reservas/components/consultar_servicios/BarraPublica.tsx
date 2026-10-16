import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import ThemeModeButton from '../../../../shared/components/ThemeModeButton';
import { useAuth } from '../../../seguridad_usuarios';

/**
 * Barra de las páginas públicas (portada, catálogo, reservar sin cuenta, "Mi cita"): el nombre lleva a la
 * portada, "Reservar" a la reserva y "Ingresar" al login. Con sesión, "Ir al panel" vuelve al sistema.
 */
export default function BarraPublica() {
  const { usuario } = useAuth();

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ gap: 1 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none', mr: 'auto' }}
        >
          <ContentCutIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            HOUSE of CUT
          </Typography>
        </Box>
        <ThemeModeButton />
        <Button
          component={RouterLink}
          to={usuario ? '/reservar' : '/reservar-sin-cuenta'}
          variant="contained"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Reservar
        </Button>
        {usuario ? (
          <Button component={RouterLink} to="/" variant="outlined">
            Ir al panel
          </Button>
        ) : (
          <Button component={RouterLink} to="/login" variant="outlined" startIcon={<LoginIcon />}>
            Ingresar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
