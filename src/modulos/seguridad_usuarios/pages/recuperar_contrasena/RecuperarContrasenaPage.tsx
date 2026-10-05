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
import { Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import RequisitosContrasena from '../../../../shared/components/RequisitosContrasena';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cumplePoliticaContrasena } from '../../../../shared/utils/politicaContrasena';
import { recuperarContrasena, solicitarCodigo } from '../../api/recuperar_contrasena/recuperarApi';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

type Errores = Partial<Record<'correo' | 'codigo' | 'contrasenaNueva' | 'confirmacion', string>>;

/** CU02 (05 §5.5) "¿Olvidaste tu contraseña?": 1) correo → código por email, 2) código + nueva contraseña. */
export default function RecuperarContrasenaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso] = useState<1 | 2>(1);
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function pedirCodigo() {
    setError('');
    setAviso('');
    if (!correo.trim()) {
      setErrores({ correo: 'Ingrese su correo' });
      return;
    }
    setEnviando(true);
    try {
      const respuesta = await solicitarCodigo(correo.trim());
      setAviso(respuesta.mensaje);
      setErrores({});
      setPaso(2);
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarCodigo(e: FormEvent) {
    e.preventDefault();
    await pedirCodigo();
  }

  async function cambiarContrasena(e: FormEvent) {
    e.preventDefault();
    setError('');
    setAviso('');
    const locales: Errores = {};
    if (!/^\d{6}$/.test(codigo.trim())) locales.codigo = 'El código tiene 6 dígitos';
    if (!cumplePoliticaContrasena(contrasenaNueva)) locales.contrasenaNueva = 'No cumple los requisitos de seguridad';
    if (confirmacion !== contrasenaNueva) locales.confirmacion = 'No coincide con la nueva contraseña';
    setErrores(locales);
    if (Object.keys(locales).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await recuperarContrasena({ correo: correo.trim(), codigo: codigo.trim(), contrasenaNueva, confirmacion });
      navigate('/login', { replace: true, state: { mensaje: respuesta.mensaje } });
    } catch (err) {
      const { mensaje, campos } = obtenerError(err);
      setError(mensaje);
      setErrores({ ...campos, codigo: campos.codigo ? 'Revise el código' : undefined });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Recuperar contraseña
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {paso === 1
              ? 'Ingresa tu correo y te enviaremos un código de 6 dígitos.'
              : `Escribe el código que enviamos a ${correo.trim()} y tu nueva contraseña.`}
          </Typography>

          {paso === 1 ? (
            <Box component="form" onSubmit={enviarCodigo} noValidate>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  label="Correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  error={!!errores.correo}
                  helperText={errores.correo}
                  autoComplete="email"
                  autoFocus
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar código'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={cambiarContrasena} noValidate>
              <Stack spacing={2}>
                {aviso && <Alert severity="info">{aviso}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  label="Código de 6 dígitos"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={!!errores.codigo}
                  helperText={errores.codigo ?? 'Vence en 5 minutos'}
                  slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'one-time-code' } }}
                  autoFocus
                  fullWidth
                />
                <Box>
                  <TextField
                    label="Nueva contraseña"
                    type="password"
                    value={contrasenaNueva}
                    onChange={(e) => setContrasenaNueva(e.target.value)}
                    error={!!errores.contrasenaNueva}
                    helperText={errores.contrasenaNueva}
                    autoComplete="new-password"
                    fullWidth
                  />
                  <RequisitosContrasena contrasena={contrasenaNueva} />
                </Box>
                <TextField
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  error={!!errores.confirmacion}
                  helperText={errores.confirmacion}
                  autoComplete="new-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={enviando}>
                  {enviando ? 'Guardando...' : 'Cambiar contraseña'}
                </Button>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Button size="small" onClick={pedirCodigo} disabled={enviando}>
                    Reenviar código
                  </Button>
                  <Button size="small" onClick={() => setPaso(1)} disabled={enviando}>
                    Cambiar correo
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Volver a iniciar sesión
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
