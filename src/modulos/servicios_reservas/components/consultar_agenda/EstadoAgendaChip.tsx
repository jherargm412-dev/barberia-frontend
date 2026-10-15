import Chip from '@mui/material/Chip';
import { ESTADOS_AGENDA } from '../../constants/consultar_agenda';
import type { EstadoAgenda } from '../../types/consultar_agenda';

/** Estado de la cita con color y texto (el texto siempre se muestra, no solo el color). */
export default function EstadoAgendaChip({ estado }: { estado: EstadoAgenda }) {
  const info = ESTADOS_AGENDA.find((e) => e.valor === estado);
  return <Chip label={info?.etiqueta ?? estado} color={info?.color ?? 'default'} size="small" />;
}
