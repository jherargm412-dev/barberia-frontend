import Chip from '@mui/material/Chip';
import { ESTADOS_HORARIO } from '../../constants/gestionar_horarios';
import type { EstadoHorario } from '../../types/gestionar_horarios';

/** Paso 3: "Asignado" (tiene al menos un día guardado) o "Sin asignar". */
export default function EstadoHorarioChip({ estado }: { estado: EstadoHorario }) {
  const etiqueta = ESTADOS_HORARIO.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return <Chip label={etiqueta} color={estado === 'ASIGNADO' ? 'success' : 'warning'} size="small" />;
}
