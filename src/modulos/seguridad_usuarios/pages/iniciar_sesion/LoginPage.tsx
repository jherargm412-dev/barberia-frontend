import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import MailIcon from '@mui/icons-material/MailOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import ThemeModeButton from '../../../../shared/components/ThemeModeButton';
import { FUENTE_TITULOS, sxEtiqueta, sxPildora } from '../../../../shared/styles/publico';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

/** CU02 Iniciar sesión: panel de marca a la izquierda (oculto en celular) y formulario a la derecha. */
export default function LoginPage() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState('');
  // P. ej. "Contraseña actualizada. Ya puede iniciar sesión" al volver de Recuperar contraseña.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // evita que el navegador recargue la página
    setError('');
    setMensaje('');

    if (!correo.trim() || !contrasena) {
      setError('Ingresa tu correo y contraseña');
      return;
    }

    setEnviando(true);
    try {
      await iniciarSesion({ correo: correo.trim(), contrasena });
      const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/';
      navigate(destino, { replace: true });
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setEnviando(false);
    }
  }

  const logo = (
    <Box component={RouterLink} to="/" aria-label="HOUSE of CUT, ir a la página de inicio"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, color: 'text.primary', textDecoration: 'none' }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: 1, borderColor: 'primary.main', color: 'primary.main',
        display: 'grid', placeItems: 'center' }}>
        <ContentCutIcon sx={{ fontSize: 20 }} />
      </Box>
      <Typography component="span" sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, letterSpacing: '0.14em', fontSize: 21 }}>
        HOUSE <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>of</Box> CUT
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Panel de marca */}
      <Box component="aside" sx={{
        flex: '1 1 50%', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden', p: { md: 6, lg: 7 }, borderRight: 1, borderColor: 'divider',
        background: (t) => `radial-gradient(90% 70% at 20% 20%, rgba(201,164,92,0.20) 0%, transparent 60%), ${(t.vars ?? t).palette.background.paper}`,
      }}>
        {logo}
        <ContentCutIcon aria-hidden sx={{ position: 'absolute', right: -50, top: '22%', fontSize: 360, color: 'primary.main',
          opacity: 0.12, transform: 'rotate(-18deg)' }} />
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 480 }}>
          <Typography component="span" sx={sxEtiqueta}>Gestión de la barbería</Typography>
          <Typography component="p" sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, textTransform: 'uppercase', lineHeight: 1.04,
            fontSize: { md: '3rem', lg: '3.5rem' } }}>
            Todo tu día,<br />
            <Box component="span" sx={{ color: 'primary.main' }}>en un solo lugar.</Box>
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 17 }}>
            Agenda, caja, ventas e inventario para el equipo de HOUSE of CUT.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>
          © {new Date().getFullYear()} HOUSE of CUT · Santa Cruz, Bolivia
        </Typography>
      </Box>

      {/* Formulario */}
      <Box component="main" sx={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', px: { xs: 2.5, sm: 5 }, py: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>{logo}</Box>
          {/* Permite elegir el tema antes de iniciar sesión. */}
          <ThemeModeButton />
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate
          sx={{ m: 'auto', width: '100%', maxWidth: 400, py: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>Iniciar sesión</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>Ingresa con el correo que te registró la barbería.</Typography>
            </Box>
            {mensaje && <Alert severity="success">{mensaje}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              autoFocus
              fullWidth
              disabled={enviando}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailIcon fontSize="small" /></InputAdornment> } }}
            />
            <Box>
              <TextField
                label="Contraseña"
                type={verContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                fullWidth
                disabled={enviando}
                slotProps={{ input: {
                  startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setVerContrasena((v) => !v)}
                        aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                        {verContrasena ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                } }}
              />
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link component={RouterLink} to="/recuperar" variant="body2" sx={{ fontWeight: 500 }}>¿Olvidaste tu contraseña?</Link>
              </Box>
            </Box>
            <Button type="submit" variant="contained" size="large" loading={enviando} sx={{ ...sxPildora, py: 1.5, fontSize: 16 }}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <Divider sx={{ color: 'text.secondary', fontSize: 13 }}>¿Eres cliente?</Divider>
            {/* CU12: quien no tiene cuenta puede reservar igual. */}
            <Button component={RouterLink} to="/reservar-sin-cuenta" variant="outlined" size="large" sx={{ ...sxPildora, py: 1.5, fontSize: 15 }}>
              Reservar sin cuenta
            </Button>
            {/* Portada pública: servicios (CU13) y productos (CU23). */}
            <Link component={RouterLink} to="/" variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              ← Volver a la página de inicio
            </Link>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
