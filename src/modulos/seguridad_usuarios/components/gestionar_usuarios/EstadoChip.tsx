import Chip from '@mui/material/Chip';
import { ESTADOS } from '../../constants/gestionar_usuarios';
import type { EstadoUsuario } from '../../types/gestionar_usuarios';

const COLORES = {
  ACTIVO: 'success',
  INACTIVO: 'default',
  SUSPENDIDO: 'warning',
} as const;

export default function EstadoChip({ estado }: { estado: EstadoUsuario }) {
  const etiqueta = ESTADOS.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return <Chip label={etiqueta} color={COLORES[estado]} size="small" />;
}
