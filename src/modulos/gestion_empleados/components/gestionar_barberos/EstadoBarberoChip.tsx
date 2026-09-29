import Chip from '@mui/material/Chip';
import { ESTADOS_BARBERO } from '../../constants/gestionar_barberos';
import type { EstadoBarbero } from '../../types/gestionar_barberos';

const COLORES = {
  ACTIVO: 'success',
  SUSPENDIDO: 'warning',
  INACTIVO: 'default',
} as const;

export default function EstadoBarberoChip({ estado }: { estado: EstadoBarbero }) {
  const etiqueta = ESTADOS_BARBERO.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return <Chip label={etiqueta} color={COLORES[estado]} size="small" />;
}
