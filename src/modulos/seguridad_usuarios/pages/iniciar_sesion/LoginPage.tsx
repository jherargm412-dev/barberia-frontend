import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

/** CU02 Iniciar sesión. */
export default function LoginPage() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // evita que el navegador recargue la página
    setError('');

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
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Barbería
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Inicia sesión para continuar
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                autoFocus
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={enviando}>
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
