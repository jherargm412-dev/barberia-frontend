import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useRef, useState, type ChangeEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import {
  cambiarCatalogoProducto,
  quitarImagenProducto,
  subirImagenProducto,
} from '../../api/gestionar_productos_insumos/productosApi';
import type { Producto, RespuestaProducto } from '../../types/gestionar_productos_insumos';
import ImagenProductoPreview from './ImagenProductoPreview';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

interface Props {
  /** null = diálogo cerrado. */
  producto: Producto | null;
  onCerrar: () => void;
  /** Tras cada cambio: mensaje del backend y el ítem actualizado, para refrescar la lista. */
  onActualizado: (respuesta: RespuestaProducto) => void;
}

/**
 * CU22, gestión del catálogo público (CU23) de un producto de venta: imagen (subir, reemplazar, quitar)
 * y mostrarlo u ocultarlo. La descripción y el precio se editan con "Editar"; el estado, con Habilitar/Deshabilitar.
 */
export default function CatalogoProductoDialog({ producto, onCerrar, onActualizado }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [actual, setActual] = useState<Producto | null>(producto);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // La página vuelve a montar el diálogo (key) al abrirlo con otro ítem; esto cubre el primer render.
  const p = actual ?? producto;

  async function ejecutar(accion: () => Promise<RespuestaProducto>) {
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const respuesta = await accion();
      setActual(respuesta.producto);
      setMensaje(respuesta.mensaje);
      onActualizado(respuesta);
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
    }
  }

  function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo || !p) return;
    // Validación rápida en el navegador; el backend vuelve a validar por el contenido real.
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setMensaje('');
      setError('La imagen debe ser JPG, PNG o WebP');
      return;
    }
    if (archivo.size > MAX_BYTES) {
      setMensaje('');
      setError('La imagen no puede superar 2 MB');
      return;
    }
    void ejecutar(() => subirImagenProducto(p.idProducto, archivo));
  }

  return (
    <Dialog open={producto !== null} onClose={onCerrar} fullWidth maxWidth="xs" aria-labelledby="catalogo-producto-titulo">
      {p && (
        <>
          <DialogTitle id="catalogo-producto-titulo">Catálogo: {p.nombre}</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {mensaje && <Alert severity="success" onClose={() => setMensaje('')}>{mensaje}</Alert>}
              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

              <ImagenProductoPreview idProducto={p.idProducto} version={p.imagenVersion} nombre={p.nombre} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => entrada.current?.click()}
                  disabled={procesando}
                >
                  {p.imagenVersion ? 'Reemplazar imagen' : 'Subir imagen'}
                </Button>
                {p.imagenVersion !== null && (
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => ejecutar(() => quitarImagenProducto(p.idProducto))}
                    disabled={procesando}
                  >
                    Quitar
                  </Button>
                )}
                <input ref={entrada} type="file" accept={TIPOS_PERMITIDOS.join(',')} hidden onChange={elegirArchivo} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                JPG, PNG o WebP, hasta 2 MB.
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={p.enCatalogo}
                    disabled={procesando}
                    onChange={(e) => ejecutar(() => cambiarCatalogoProducto(p.idProducto, e.target.checked))}
                  />
                }
                label="Mostrar en el catálogo público"
              />
              {!p.activo && p.enCatalogo && (
                <Alert severity="info">El ítem está deshabilitado: no aparecerá en el catálogo hasta habilitarlo.</Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCerrar}>Cerrar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
