import Chip from '@mui/material/Chip';
import { ESTADOS_CITA } from '../../constants/gestionar_citas';
import type { EstadoCita } from '../../types/gestionar_citas';

/** Estado de la cita con el código de colores de CU16. */
export default function EstadoCitaChip({ estado }: { estado: EstadoCita }) {
  const info = ESTADOS_CITA.find((e) => e.valor === estado);
  return <Chip label={info?.etiqueta ?? estado} color={info?.color ?? 'default'} size="small" />;
}
