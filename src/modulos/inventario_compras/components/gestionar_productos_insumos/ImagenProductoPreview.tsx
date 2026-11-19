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
}

/**
 * Vista previa de la imagen en el panel. Se pide con el token (sirve también para ítems ocultos o
 * deshabilitados, que el catálogo público no muestra) y se libera el objeto al desmontar.
 */
export default function ImagenProductoPreview({ idProducto, version, nombre, alto = 180 }: Props) {
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
    borderRadius: 1,
    bgcolor: 'action.hover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as const;

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
        <Box component="img" src={url} alt={nombre} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <CircularProgress size={28} />
      )}
    </Box>
  );
}
