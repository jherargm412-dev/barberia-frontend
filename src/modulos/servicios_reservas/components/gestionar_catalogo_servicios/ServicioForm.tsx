import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import {
  validarServicio,
  type ErroresFormulario,
  type ServicioFormValores,
} from '../../utils/gestionar_catalogo_servicios/servicioForm';

interface Props {
  valoresIniciales: ServicioFormValores;
  textoBoton: string;
  onGuardar: (valores: ServicioFormValores) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario compartido entre "Registrar servicio" (vacío) y "Modificar servicio" (con datos). */
export default function ServicioForm({ valoresIniciales, textoBoton, onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<ServicioFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  /** Actualiza un campo y borra su error. */
  function cambiar(campo: keyof ServicioFormValores, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  // Paso 7: el administrador presiona "Guardar".
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    // Paso 8: primero validamos aquí para no llamar al backend con datos que sabemos que fallan.
    const { mensaje, errores: erroresLocales } = validarServicio(valores);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // Errores del backend, por ejemplo 8a "Ya existe un servicio con ese nombre" o
      // 9a "No fue posible guardar el servicio". El formulario conserva lo escrito (vuelve al paso 6).
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(campos as ErroresFormulario);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3, maxWidth: 640 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <TextField
          label="Nombre"
          required
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={!!errores.nombre}
          helperText={errores.nombre}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
        <TextField
          label="Descripción"
          multiline
          minRows={2}
          value={valores.descripcion}
          onChange={(e) => cambiar('descripcion', e.target.value)}
          error={!!errores.descripcion}
          helperText={errores.descripcion ?? `${valores.descripcion.length}/200 (opcional)`}
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* inputMode="decimal" muestra el teclado numérico en el celular. */}
          <TextField
            label="Precio"
            required
            value={valores.precio}
            onChange={(e) => cambiar('precio', e.target.value)}
            error={!!errores.precio}
            helperText={errores.precio}
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { startAdornment: <InputAdornment position="start">Bs</InputAdornment> },
            }}
          />
          <TextField
            label="Porcentaje de comisión"
            required
            value={valores.porcentajeComision}
            onChange={(e) => cambiar('porcentajeComision', e.target.value)}
            error={!!errores.porcentajeComision}
            helperText={errores.porcentajeComision ?? 'Lo que gana el barbero por este servicio'}
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            }}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Guardando...' : textoBoton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
