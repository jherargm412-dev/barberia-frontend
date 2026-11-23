import Chip from '@mui/material/Chip';

export default function EstadoProductoChip({ activo }: { activo: boolean }) {
  return <Chip label={activo ? 'Activo' : 'Inactivo'} color={activo ? 'success' : 'default'} size="small" />;
}

/** Productos de venta ocultos del catálogo público (CU23); los visibles no llevan marca. */
export function OcultoCatalogoChip() {
  return <Chip label="Oculto en catálogo" size="small" variant="outlined" sx={{ ml: 0.5 }} />;
}
