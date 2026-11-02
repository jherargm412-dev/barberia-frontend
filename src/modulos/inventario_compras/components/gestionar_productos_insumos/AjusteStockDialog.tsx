import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { ajustarStock } from '../../api/gestionar_productos_insumos/productosApi';
import { MENSAJES, TIPOS_AJUSTE } from '../../constants/gestionar_productos_insumos';
import type { Producto, TipoAjusteStock } from '../../types/gestionar_productos_insumos';
import { datosAjuste } from '../../utils/gestionar_productos_insumos/productoForm';

interface Props {
  abierto: boolean;
  /** Ítem a ajustar; se conserva mientras el diálogo se cierra para que el texto no cambie. */
  producto: Producto | null;
  onCerrar: () => void;
  /** Se llama con el mensaje del backend ("Stock actualizado") para que la página lo muestre. */
  onAjustado: (mensaje: string) => void;
}

type Errores = Partial<Record<'tipo' | 'cantidad' | 'observacion', string>>;

/**
 * Flujo "Ajustar stock": inventario inicial (suma, una sola vez por ítem) o pérdida / vencido (restan).
 * La página lo vuelve a montar (key) cada vez que se abre, así empieza vacío.
 */
export default function AjusteStockDialog({ abierto, producto, onCerrar, onAjustado }: Props) {
  const [tipo, setTipo] = useState<TipoAjusteStock | ''>('');
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const stockActual = producto?.stockActual ?? 0;
  const cantidadValida = /^\d{1,9}$/.test(cantidad.trim()) && Number(cantidad) > 0;
  // Vista previa: cómo quedará el stock si se confirma.
  const stockNuevo = tipo && cantidadValida
    ? stockActual + (datosAjuste(tipo).suma ? 1 : -1) * Number(cantidad)
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!producto) return;
    setErrorGeneral('');

    // Mismas reglas que el backend (ProductoService.validarAjuste).
    const nuevos: Errores = {};
    if (!tipo) nuevos.tipo = 'Obligatorio';
    if (!cantidad.trim()) nuevos.cantidad = 'Obligatorio';
    else if (!cantidadValida) nuevos.cantidad = 'Debe ser un número entero mayor a 0';
    else if (stockNuevo !== null && stockNuevo < 0) nuevos.cantidad = `Máximo ${stockActual}`;
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      setErrorGeneral(!tipo || !cantidad.trim() ? MENSAJES.CAMPOS_VACIOS : MENSAJES.VALOR_INVALIDO);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await ajustarStock(producto.idProducto, {
        tipo: tipo as TipoAjusteStock,
        cantidad: Number(cantidad),
        observacion: observacion.trim() || null,
      });
      onAjustado(respuesta.mensaje);
    } catch (err) {
      // Por ejemplo "El inventario inicial de este ítem ya fue registrado".
      const { mensaje, campos } = obtenerError(err);
      setErrorGeneral(mensaje);
      setErrores(campos as Errores);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onClose={enviando ? undefined : onCerrar} fullWidth maxWidth="xs" aria-labelledby="ajuste-stock-titulo">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="ajuste-stock-titulo">Ajustar stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {producto?.nombre} · Stock actual: <strong>{stockActual}</strong>
            </Typography>
            {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

            <TextField
              select
              label="Motivo"
              required
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as TipoAjusteStock);
                setErrores((anteriores) => ({ ...anteriores, tipo: undefined }));
              }}
              error={!!errores.tipo}
              helperText={errores.tipo ?? 'Inventario inicial suma (una sola vez); pérdida y vencido restan.'}
            >
              {TIPOS_AJUSTE.map((t) => (
                <MenuItem key={t.valor} value={t.valor}>
                  {t.etiqueta} ({t.suma ? 'suma' : 'resta'})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Cantidad"
              required
              value={cantidad}
              onChange={(e) => {
                setCantidad(e.target.value);
                setErrores((anteriores) => ({ ...anteriores, cantidad: undefined }));
              }}
              error={!!errores.cantidad}
              helperText={errores.cantidad ?? (stockNuevo !== null ? `El stock quedará en ${stockNuevo}` : ' ')}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
            <TextField
              label="Observación"
              multiline
              minRows={2}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              error={!!errores.observacion}
              helperText={errores.observacion ?? `${observacion.length}/200 (opcional)`}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={enviando}>
            Guardar ajuste
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
