import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import RequisitosContrasena from '../../../../shared/components/RequisitosContrasena';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cumplePoliticaContrasena } from '../../../../shared/utils/politicaContrasena';
import { aceptarInvitacion, consultarInvitacion } from '../../api/aceptar_invitacion/invitacionApi';
import type { DatosInvitacion } from '../../types/aceptar_invitacion';

type Errores = Partial<Record<'contrasena' | 'confirmacion', string>>;

/** Enlace de invitación (CU01/CU17): el trabajador invitado elige su contraseña. Página pública. */
export default function ActivarCuentaPage() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';
  const navigate = useNavigate();

  const [datos, setDatos] = useState<DatosInvitacion | null>(null);
  const [errorEnlace, setErrorEnlace] = useState(token ? '' : 'El enlace de invitación no es válido');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return;
    consultarInvitacion(token)
      .then(setDatos)
      .catch((err) => setErrorEnlace(obtenerError(err).mensaje));
  }, [token]);

  async function activar(e: FormEvent) {
    e.preventDefault();
    setError('');
    const locales: Errores = {};
    if (!cumplePoliticaContrasena(contrasena)) locales.contrasena = 'No cumple los requisitos de seguridad';
    if (confirmacion !== contrasena) locales.confirmacion = 'No coincide con la contraseña';
    setErrores(locales);
    if (Object.keys(locales).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await aceptarInvitacion({ token, contrasena, confirmacion });
      navigate('/login', { replace: true, state: { mensaje: respuesta.mensaje } });
    } catch (err) {
      const { mensaje, campos } = obtenerError(err);
      setError(mensaje);
      setErrores(campos);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Activar cuenta
          </Typography>

          {errorEnlace ? (
            <Alert severity="error">{errorEnlace}</Alert>
          ) : !datos ? (
            <CircularProgress />
          ) : (
            <>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Hola {datos.nombre}, elige la contraseña para entrar con {datos.correo}.
              </Typography>
              <Box component="form" onSubmit={activar} noValidate>
                <Stack spacing={2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  <Box>
                    <TextField
                      label="Contraseña"
                      type="password"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      error={!!errores.contrasena}
                      helperText={errores.contrasena}
                      autoComplete="new-password"
                      autoFocus
                      fullWidth
                    />
                    <RequisitosContrasena contrasena={contrasena} />
                  </Box>
                  <TextField
                    label="Confirmar contraseña"
                    type="password"
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                    error={!!errores.confirmacion}
                    helperText={errores.confirmacion}
                    autoComplete="new-password"
                    fullWidth
                  />
                  <Button type="submit" variant="contained" size="large" disabled={enviando}>
                    {enviando ? 'Activando...' : 'Activar cuenta'}
                  </Button>
                </Stack>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Ir a iniciar sesión
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
