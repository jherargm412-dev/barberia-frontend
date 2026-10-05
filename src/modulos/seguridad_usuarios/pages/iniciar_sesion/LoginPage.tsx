import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import ThemeModeButton from '../../../../shared/components/ThemeModeButton';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

/** CU02 Iniciar sesión. */
export default function LoginPage() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2, py: 9,
      }}
    >
      {/* Permite elegir el tema antes de iniciar sesión. */}
      <Box sx={{ position: 'fixed', top: 16, right: 16 }}><ThemeModeButton /></Box>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>Gestión de barbería</Typography>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            HOUSE of CUT
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Inicia sesión para continuar
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
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
              />
              <TextField
                label="Contraseña"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                fullWidth
                disabled={enviando}
              />
              <Button type="submit" variant="contained" size="large" loading={enviando}>
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <Link component={RouterLink} to="/recuperar" variant="body2" sx={{ textAlign: 'center' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
