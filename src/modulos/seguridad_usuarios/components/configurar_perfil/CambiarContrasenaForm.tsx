import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarContrasena } from '../../api/configurar_perfil/perfilApi';
import {
  CONTRASENA_VACIA,
  validarContrasena,
  type ContrasenaFormValores,
  type ErroresContrasena,
} from '../../utils/configurar_perfil/perfilForm';

/** CU04 paso 3: cambiar la contraseña propia (actual + nueva + confirmación). */
export default function CambiarContrasenaForm() {
  const [valores, setValores] = useState<ContrasenaFormValores>(CONTRASENA_VACIA);
  const [errores, setErrores] = useState<ErroresContrasena>({});
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo: keyof ContrasenaFormValores, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setMensaje('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMensaje('');
    const erroresLocales = validarContrasena(valores);
    setErrores(erroresLocales);
    if (Object.keys(erroresLocales).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await cambiarContrasena(valores);
      setMensaje(respuesta.mensaje);
      setValores(CONTRASENA_VACIA); // nunca dejamos contraseñas escritas en pantalla
    } catch (err) {
      // P. ej. "La contraseña actual es incorrecta" (el backend responde 400, no cierra la sesión).
      // Los campos (contrasenaActual, contrasenaNueva, confirmacion) se llaman igual que en el formulario.
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setError(mensajeBackend);
      setErrores(campos);
    } finally {
      setEnviando(false);
    }
  }

  const tipo = mostrar ? 'text' : 'password';

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Cambiar contraseña
      </Typography>
      <Stack spacing={2}>
        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Contraseña actual"
          type={tipo}
          required
          autoComplete="current-password"
          value={valores.contrasenaActual}
          onChange={(e) => cambiar('contrasenaActual', e.target.value)}
          error={!!errores.contrasenaActual}
          helperText={errores.contrasenaActual}
        />
        <TextField
          label="Nueva contraseña"
          type={tipo}
          required
          autoComplete="new-password"
          value={valores.contrasenaNueva}
          onChange={(e) => cambiar('contrasenaNueva', e.target.value)}
          error={!!errores.contrasenaNueva}
          helperText={errores.contrasenaNueva}
        />
        <TextField
          label="Confirmar nueva contraseña"
          type={tipo}
          required
          autoComplete="new-password"
          value={valores.confirmacion}
          onChange={(e) => cambiar('confirmacion', e.target.value)}
          error={!!errores.confirmacion}
          helperText={errores.confirmacion}
        />
        <FormControlLabel
          control={<Checkbox checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} />}
          label="Mostrar contraseñas"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
