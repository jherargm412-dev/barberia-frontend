import Chip from '@mui/material/Chip';
import { ESTADOS_EMPLEADO } from '../../constants/gestionar_barberos';
import type { EstadoUsuario } from '../../types/gestionar_barberos';

const COLORES = {
  ACTIVO: 'success',
  INACTIVO: 'default',
  SUSPENDIDO: 'warning',
} as const;

/** Estado de la cuenta del empleado. INACTIVO se muestra como "Desvinculado" (vocabulario del CU). */
export default function EstadoEmpleadoChip({ estado }: { estado: EstadoUsuario }) {
  const etiqueta = ESTADOS_EMPLEADO.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return <Chip label={etiqueta} color={COLORES[estado]} size="small" />;
}
