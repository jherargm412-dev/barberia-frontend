import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { actualizarPerfil } from '../../api/configurar_perfil/perfilApi';
import type { Perfil } from '../../types/configurar_perfil';
import {
  construirRequest,
  validarDatos,
  valoresDesdePerfil,
  type DatosFormValores,
  type ErroresDatos,
} from '../../utils/configurar_perfil/perfilForm';

interface Props {
  perfil: Perfil;
  /** Se llama con el perfil ya guardado por el backend. */
  onGuardado: (perfil: Perfil) => void;
}

/** CU04 paso 2: editar nombre, teléfono y fecha de nacimiento. */
export default function DatosPersonalesForm({ perfil, onGuardado }: Props) {
  const [valores, setValores] = useState<DatosFormValores>(() => valoresDesdePerfil(perfil));
  const [errores, setErrores] = useState<ErroresDatos>({});
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(campo: keyof DatosFormValores, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setMensaje('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMensaje('');
    const erroresLocales = validarDatos(valores);
    setErrores(erroresLocales);
    if (Object.keys(erroresLocales).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await actualizarPerfil(construirRequest(valores));
      setMensaje(respuesta.mensaje);
      if (respuesta.perfil) {
        setValores(valoresDesdePerfil(respuesta.perfil));
        onGuardado(respuesta.perfil);
      }
    } catch (err) {
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setError(mensajeBackend);
      setErrores(campos as ErroresDatos);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Datos personales
      </Typography>
      <Stack spacing={2}>
        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Nombre"
          required
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={!!errores.nombre}
          helperText={errores.nombre}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
        {/* El correo identifica la cuenta: solo lo cambia el Administrador (CU01). */}
        <TextField label="Correo" value={perfil.correo} disabled helperText="Para cambiarlo, contacte al administrador" />
        <TextField
          label="Teléfono"
          value={valores.telefono}
          onChange={(e) => cambiar('telefono', e.target.value)}
          error={!!errores.telefono}
          helperText={errores.telefono ?? 'Opcional. Ej: +591 71234567'}
          slotProps={{ htmlInput: { maxLength: 15, inputMode: 'tel' } }}
        />
        <TextField
          label="Fecha de nacimiento"
          type="date"
          value={valores.fechaNacimiento}
          onChange={(e) => cambiar('fechaNacimiento', e.target.value)}
          error={!!errores.fechaNacimiento}
          helperText={errores.fechaNacimiento ?? 'Opcional'}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" loading={enviando}>
            {enviando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
