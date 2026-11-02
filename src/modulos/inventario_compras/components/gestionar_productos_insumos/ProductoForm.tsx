import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { TIPOS_PRODUCTO } from '../../constants/gestionar_productos_insumos';
import {
  validarProducto,
  type ErroresFormulario,
  type ProductoFormValores,
} from '../../utils/gestionar_productos_insumos/productoForm';

interface Props {
  valoresIniciales: ProductoFormValores;
  textoBoton: string;
  onGuardar: (valores: ProductoFormValores) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario compartido entre "Nuevo ítem" (vacío) y "Editar ítem" (con datos). CU22 paso 4. */
export default function ProductoForm({ valoresIniciales, textoBoton, onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<ProductoFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  /** Actualiza un campo y borra su error. */
  function cambiar(campo: keyof ProductoFormValores, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  // Paso 5: el administrador presiona "Guardar".
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    // Paso 6: primero validamos aquí para no llamar al backend con datos que sabemos que fallan.
    const { mensaje, errores: erroresLocales } = validarProducto(valores);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // Errores del backend, por ejemplo 6b "Ya existe un ítem con ese nombre".
      // El formulario conserva lo escrito (vuelve al paso 5).
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(campos as ErroresFormulario);
    } finally {
      setEnviando(false);
    }
  }

  const esInsumo = valores.tipo === 'INSUMO';

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <TextField
          select
          label="Tipo"
          required
          value={valores.tipo}
          onChange={(e) => cambiar('tipo', e.target.value)}
          error={!!errores.tipo}
          helperText={errores.tipo ?? 'Producto: se vende al cliente. Insumo: se consume en la barbería.'}
        >
          {TIPOS_PRODUCTO.map((t) => (
            <MenuItem key={t.valor} value={t.valor}>
              {t.etiqueta}
            </MenuItem>
          ))}
        </TextField>
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
            label="Costo"
            required
            value={valores.costo}
            onChange={(e) => cambiar('costo', e.target.value)}
            error={!!errores.costo}
            helperText={errores.costo ?? 'Lo que paga la barbería'}
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { startAdornment: <InputAdornment position="start">Bs</InputAdornment> },
            }}
          />
          <TextField
            label="Precio de venta"
            required={!esInsumo}
            value={valores.precioVenta}
            onChange={(e) => cambiar('precioVenta', e.target.value)}
            error={!!errores.precioVenta}
            helperText={errores.precioVenta ?? (esInsumo ? 'Opcional para insumos (se guarda 0)' : 'Lo que paga el cliente')}
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { startAdornment: <InputAdornment position="start">Bs</InputAdornment> },
            }}
          />
        </Stack>
        <TextField
          label="Stock mínimo"
          required
          value={valores.stockMinimo}
          onChange={(e) => cambiar('stockMinimo', e.target.value)}
          error={!!errores.stockMinimo}
          helperText={errores.stockMinimo ?? 'Se avisa cuando el stock llega a esta cantidad'}
          sx={{ maxWidth: { sm: 'calc(50% - 8px)' } }}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={enviando}>
            {enviando ? 'Guardando...' : textoBoton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
