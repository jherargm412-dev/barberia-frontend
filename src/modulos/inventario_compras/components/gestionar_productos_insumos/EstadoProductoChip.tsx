import Chip from '@mui/material/Chip';

export default function EstadoProductoChip({ activo }: { activo: boolean }) {
  return <Chip label={activo ? 'Activo' : 'Inactivo'} color={activo ? 'success' : 'default'} size="small" />;
}
