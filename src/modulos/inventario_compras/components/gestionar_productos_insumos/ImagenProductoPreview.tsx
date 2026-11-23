import ImageIcon from '@mui/icons-material/ImageOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { obtenerImagenProducto } from '../../api/gestionar_productos_insumos/productosApi';

interface Props {
  idProducto: number;
  /** null = sin imagen. Al cambiar (se subió otra) se vuelve a pedir. */
  version: number | null;
  nombre: string;
  alto?: number;
  /** Miniatura cuadrada para tablas: sin textos, solo el ícono si no hay imagen. */
  compacto?: boolean;
}

/**
 * Vista previa de la imagen en el panel. Se pide con el token (sirve también para ítems ocultos o
 * deshabilitados, que el catálogo público no muestra) y se libera el objeto al desmontar.
 */
export default function ImagenProductoPreview({ idProducto, version, nombre, alto = 180, compacto = false }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (version === null) return undefined;
    let vigente = true;
    let creada: string | null = null;
    obtenerImagenProducto(idProducto)
      .then((blob) => {
        if (!vigente) return;
        creada = URL.createObjectURL(blob);
        setUrl(creada);
        setFallo(false);
      })
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
      if (creada) URL.revokeObjectURL(creada);
      setUrl(null);
    };
  }, [idProducto, version]);

  const marco = {
    height: alto,
    ...(compacto ? { width: alto, flexShrink: 0 } : {}),
    borderRadius: compacto ? 1.5 : 1,
    bgcolor: 'action.hover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as const;

  if ((version === null || fallo) && compacto) {
    return <Box sx={{ ...marco, color: 'text.disabled' }} aria-hidden><ImageIcon fontSize="small" /></Box>;
  }
  if (version === null || fallo) {
    return (
      <Box sx={{ ...marco, flexDirection: 'column', color: 'text.secondary', gap: 0.5 }}>
        <ImageIcon fontSize="large" />
        <Typography variant="caption">{fallo ? 'No se pudo cargar la imagen' : 'Sin imagen'}</Typography>
      </Box>
    );
  }
  return (
    <Box sx={marco}>
      {url ? (
        <Box component="img" src={url} alt={nombre}
          sx={compacto ? { width: '100%', height: '100%', objectFit: 'cover' } : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <CircularProgress size={compacto ? 16 : 28} />
      )}
    </Box>
  );
}
